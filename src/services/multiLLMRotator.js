const ROTATABLE_STATUS_CODES = new Set([401, 402, 403, 404, 429, 500, 502, 503, 504])

export class MultiLLMRotator {
  constructor(keys, options = {}) {
    this.cooldownMs = options.cooldownMs ?? 60_000
    this.now = options.now ?? Date.now
    this.requestTimeoutMs = options.requestTimeoutMs ?? 75_000
    this.keys = keys
      .filter((entry) => entry?.key)
      .map((entry, order) => ({ ...entry, order, status: 'active', cooldownUntil: 0, errorCount: 0 }))
  }

  getAvailableKeys() {
    const now = this.now()
    return this.keys
      .map((entry) => {
        if (entry.status === 'cooldown' && now >= entry.cooldownUntil) {
          return { ...entry, status: 'active', cooldownUntil: 0 }
        }
        return entry
      })
      .sort((left, right) => left.priority - right.priority || left.order - right.order)
  }

  markCooldown(key) {
    const stored = this.keys.find((entry) => entry.id === key.id)
    if (!stored) return
    stored.status = 'cooldown'
    stored.cooldownUntil = this.now() + this.cooldownMs
    stored.errorCount += 1
  }

  markSuccess(key) {
    const stored = this.keys.find((entry) => entry.id === key.id)
    if (!stored) return
    stored.status = 'active'
    stored.cooldownUntil = 0
    stored.errorCount = 0
  }

  markModelCooldown(key) {
    for (const stored of this.keys) {
      if (stored.provider !== key.provider || stored.model !== key.model) continue
      stored.status = 'cooldown'
      stored.cooldownUntil = this.now() + this.cooldownMs
      stored.errorCount += 1
    }
  }

  async executeRequest(payload, fetchImpl = globalThis.fetch) {
    const deadline = this.now() + this.requestTimeoutMs
    const available = this.getAvailableKeys().filter(
      (entry) => entry.status === 'active' || this.now() >= entry.cooldownUntil,
    )
    const unavailableModels = new Set()

    for (const key of available) {
      const providerModel = `${key.provider}:${key.model}`
      if (unavailableModels.has(providerModel)) continue

      let response
      try {
        const remainingMs = Math.max(1, deadline - this.now())
        response = await requestProvider(key, payload, fetchImpl, remainingMs)
      } catch (error) {
        if (isRotatableError(error)) {
          this.markCooldown(key)
          continue
        }
        this.markCooldown(key)
        if (this.now() < deadline) continue
        throw new ProviderRequestError(504, 'Provider request timed out.')
      }

      if (!response.ok) {
        if (ROTATABLE_STATUS_CODES.has(response.status)) {
          if (response.status === 503 && key.provider === 'gemini') {
            this.markModelCooldown(key)
            unavailableModels.add(providerModel)
          } else {
            this.markCooldown(key)
          }
          continue
        }
        throw new ProviderRequestError(response.status, `Provider request failed with HTTP ${response.status}`)
      }

      const json = await response.json()
      let data
      try {
        data = normalizeProviderPayload(key.provider, json)
      } catch {
        this.markCooldown(key)
        continue
      }
      if (payload.validate && !payload.validate(data)) {
        this.markCooldown(key)
        continue
      }
      this.markSuccess(key)
      return {
        data,
        provider: key.provider,
        model: key.model,
      }
    }

    throw new Error('All API key pools temporarily exhausted. Please try again shortly.')
  }
}

export class ProviderRequestError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ProviderRequestError'
    this.status = status
  }
}

function isRotatableError(error) {
  return error instanceof ProviderRequestError && ROTATABLE_STATUS_CODES.has(error.status)
}

async function requestProvider(config, payload, fetchImpl, timeoutMs) {
  if (config.provider === 'gemini') {
    return fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': config.key },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: payload.prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.1 },
        }),
      },
    )
  }

  if (config.provider === 'deepseek') {
    return fetchImpl('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${config.key}`, 'content-type': 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        model: config.model,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: payload.prompt }],
        temperature: 0.1,
      }),
    })
  }

  throw new Error(`Unsupported provider: ${config.provider}`)
}

function normalizeProviderPayload(provider, payload) {
  if (payload?.recommendations || payload?.careerPathways) return payload
  const content =
    provider === 'gemini'
      ? payload?.candidates?.[0]?.content?.parts?.[0]?.text
      : payload?.choices?.[0]?.message?.content
  if (!content) throw new Error('The provider returned an empty response.')
  const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace === -1 || lastBrace <= firstBrace) throw new Error('The provider returned malformed JSON.')
    parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1))
  }
  if (provider === 'gemini' && parsed?.recommendations) {
    parsed.recommendations.sources = (payload?.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
      .map((chunk) => chunk.web)
      .filter((source) => source?.uri && source?.title)
      .slice(0, 12)
  }
  return parsed
}

export function createEnvironmentKeyPool(environment = process.env) {
  const primaryModel = environment.GEMINI_MODEL || 'gemini-2.5-flash-lite'
  const fallbackModel = environment.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash'
  const gemini = Array.from({ length: 5 }, (_, index) => ({
    id: `gemini-${index + 1}`,
    provider: 'gemini',
    key: environment[`GEMINI_API_KEY_${index + 1}`],
    model: primaryModel,
    priority: 1,
  }))
  const geminiFallback = fallbackModel === primaryModel
    ? []
    : Array.from({ length: 5 }, (_, index) => ({
        id: `gemini-fallback-${index + 1}`,
        provider: 'gemini',
        key: environment[`GEMINI_API_KEY_${index + 1}`],
        model: fallbackModel,
        priority: 2,
      }))
  return [
    ...gemini,
    ...geminiFallback,
    {
      id: 'deepseek-1',
      provider: 'deepseek',
      key: environment.DEEPSEEK_API_KEY_1,
      model: environment.DEEPSEEK_MODEL || 'deepseek-v4-flash',
      priority: 3,
    },
  ].filter((entry) => entry.key && (entry.provider !== 'deepseek' || environment.ENABLE_PAID_DEEPSEEK !== 'false'))
}
