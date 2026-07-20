const ROTATABLE_STATUS_CODES = new Set([400, 401, 402, 403, 404, 422, 429, 500, 502, 503, 504])

const OPENAI_COMPATIBLE = new Set(['groq', 'cerebras', 'openrouter', 'deepseek'])

const PROVIDER_ENDPOINTS = {
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  cerebras: 'https://api.cerebras.ai/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/chat/completions',
}

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
        const attemptTimeoutMs = Math.min(remainingMs, key.requestTimeoutMs || remainingMs)
        response = await requestProvider(key, payload, fetchImpl, attemptTimeoutMs)
      } catch (error) {
        if (error?.name === 'TimeoutError') {
          this.markModelCooldown(key)
          unavailableModels.add(providerModel)
          continue
        }
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
          if (response.status === 400 || response.status === 422 || response.status === 503) {
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

  if (OPENAI_COMPATIBLE.has(config.provider)) {
    const headers = {
      authorization: `Bearer ${config.key}`,
      'content-type': 'application/json',
    }
    if (config.provider === 'openrouter') {
      headers['HTTP-Referer'] = config.referer || 'https://careero.app'
      headers['X-Title'] = config.appTitle || 'Careero'
    }

    const body = {
      model: config.model,
      messages: [{ role: 'user', content: payload.prompt }],
      temperature: 0.1,
    }
    if (config.jsonMode !== false) {
      body.response_format = { type: 'json_object' }
    }
    if (config.provider === 'groq' && config.webSearch) {
      if (payload.searchCountry) body.search_settings = { country: payload.searchCountry.toLowerCase() }
    }
    if (config.provider === 'openrouter' && config.webSearch) {
      body.plugins = [
        { id: 'web', max_results: 10 },
        { id: 'response-healing' },
      ]
    }

    return fetchImpl(config.baseUrl || PROVIDER_ENDPOINTS[config.provider], {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify(body),
    })
  }

  throw new Error(`Unsupported provider: ${config.provider}`)
}

function collectProviderSources(provider, payload) {
  if (provider === 'gemini') {
    return (payload?.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
      .map((chunk) => chunk.web)
  }
  if (provider === 'groq') {
    return (payload?.choices?.[0]?.message?.executed_tools || [])
      .flatMap((tool) => tool?.search_results?.results || [])
      .map((source) => ({ title: source.title, uri: source.url }))
  }
  if (provider === 'openrouter') {
    return (payload?.choices?.[0]?.message?.annotations || [])
      .filter((annotation) => annotation?.type === 'url_citation')
      .map((annotation) => ({
        title: annotation.url_citation?.title,
        uri: annotation.url_citation?.url,
      }))
  }
  return []
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
  if (parsed?.recommendations) {
    const sources = collectProviderSources(provider, payload)
      .filter((source) => source?.uri && source?.title)
      .slice(0, 12)
    if (sources.length) parsed.recommendations.sources = sources
  }
  return parsed
}

function collectNumberedKeys(environment, prefix, count = 2) {
  return Array.from({ length: count }, (_, index) => environment[`${prefix}_${index + 1}`]).filter(Boolean)
}

export function createEnvironmentKeyPool(environment = process.env) {
  const groqModel = environment.GROQ_MODEL || 'groq/compound-mini'
  const cerebrasModel = environment.CEREBRAS_MODEL || 'gpt-oss-120b'
  const openRouterModel = environment.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free'
  const primaryModel = environment.GEMINI_MODEL || 'gemini-2.5-flash-lite'
  const fallbackModel = environment.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash'

  const groq = collectNumberedKeys(environment, 'GROQ_API_KEY').map((key, index) => ({
    id: `groq-${index + 1}`,
    provider: 'groq',
    key,
    model: groqModel,
    webSearch: true,
    requestTimeoutMs: 25_000,
    priority: 1,
  }))

  const cerebras = collectNumberedKeys(environment, 'CEREBRAS_API_KEY').map((key, index) => ({
    id: `cerebras-${index + 1}`,
    provider: 'cerebras',
    key,
    model: cerebrasModel,
    requestTimeoutMs: 20_000,
    priority: 5,
  }))

  const openrouter = collectNumberedKeys(environment, 'OPENROUTER_API_KEY').map((key, index) => ({
    id: `openrouter-${index + 1}`,
    provider: 'openrouter',
    key,
    model: openRouterModel,
    webSearch: true,
    referer: environment.OPENROUTER_SITE_URL,
    appTitle: environment.OPENROUTER_APP_TITLE,
    requestTimeoutMs: 25_000,
    priority: 3,
  }))

  const gemini = Array.from({ length: 5 }, (_, index) => ({
    id: `gemini-${index + 1}`,
    provider: 'gemini',
    key: environment[`GEMINI_API_KEY_${index + 1}`],
    model: primaryModel,
    priority: 2,
  }))

  const geminiFallback = fallbackModel === primaryModel
    ? []
    : Array.from({ length: 5 }, (_, index) => ({
        id: `gemini-fallback-${index + 1}`,
        provider: 'gemini',
        key: environment[`GEMINI_API_KEY_${index + 1}`],
        model: fallbackModel,
        priority: 4,
      }))

  const deepseek = environment.DEEPSEEK_API_KEY_1 && environment.ENABLE_PAID_DEEPSEEK !== 'false'
    ? [{
        id: 'deepseek-1',
        provider: 'deepseek',
        key: environment.DEEPSEEK_API_KEY_1,
        model: environment.DEEPSEEK_MODEL || 'deepseek-v4-flash',
        priority: 6,
      }]
    : []

  return [...groq, ...gemini, ...openrouter, ...geminiFallback, ...cerebras, ...deepseek]
    .filter((entry) => entry.key)
}
