const DEFAULT_TTL_SECONDS = 24 * 60 * 60
const MAX_TTL_SECONDS = 7 * 24 * 60 * 60
const DEFAULT_MEMORY_ENTRIES = 200
const MAX_CACHE_BYTES = 256_000

function clampInteger(value, fallback, minimum, maximum) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, minimum), maximum)
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function createRecommendationCacheKey(input) {
  const stablePayload = JSON.stringify({
    scores: ['R', 'I', 'A', 'S', 'E', 'C'].map((code) => input.profile.normalizedScores[code]),
    professionId: input.topProfession.id,
    country: input.location.country,
    city: input.location.city || '',
    region: input.location.region || '',
    language: input.language,
  })
  return `careero:recommendations:v2:${await sha256(stablePayload)}`
}

function redisConfiguration(environment) {
  const url = environment.UPSTASH_REDIS_REST_URL || environment.KV_REST_API_URL
  const token = environment.UPSTASH_REDIS_REST_TOKEN || environment.KV_REST_API_TOKEN
  if (!url || !token) return null
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return null
    return { url: parsed.href.replace(/\/$/, ''), token }
  } catch {
    return null
  }
}

export class ServerRecommendationCache {
  constructor(environment = process.env, options = {}) {
    this.environment = environment
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch
    this.now = options.now ?? Date.now
    this.ttlSeconds = clampInteger(
      environment.RECOMMENDATION_CACHE_TTL_SECONDS,
      DEFAULT_TTL_SECONDS,
      60,
      MAX_TTL_SECONDS,
    )
    this.maxMemoryEntries = clampInteger(
      environment.RECOMMENDATION_CACHE_MEMORY_ENTRIES,
      DEFAULT_MEMORY_ENTRIES,
      10,
      1000,
    )
    this.redis = redisConfiguration(environment)
    this.memory = new Map()
  }

  pruneMemory() {
    const now = this.now()
    for (const [key, entry] of this.memory) {
      if (entry.expiresAt <= now) this.memory.delete(key)
    }
    while (this.memory.size >= this.maxMemoryEntries) {
      this.memory.delete(this.memory.keys().next().value)
    }
  }

  async redisCommand(command) {
    if (!this.redis) return null
    try {
      const response = await this.fetchImpl(this.redis.url, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.redis.token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(command),
        signal: AbortSignal.timeout(1500),
      })
      if (!response.ok) return null
      return (await response.json()).result ?? null
    } catch {
      return null
    }
  }

  async get(key) {
    const memoryEntry = this.memory.get(key)
    if (memoryEntry?.expiresAt > this.now()) return { payload: memoryEntry.payload, layer: 'memory' }
    if (memoryEntry) this.memory.delete(key)

    const stored = await this.redisCommand(['GET', key])
    if (typeof stored !== 'string') return null
    try {
      const payload = JSON.parse(stored)
      this.pruneMemory()
      this.memory.set(key, { payload, expiresAt: this.now() + this.ttlSeconds * 1000 })
      return { payload, layer: 'redis' }
    } catch {
      return null
    }
  }

  async set(key, payload) {
    const serialized = JSON.stringify(payload)
    if (serialized.length > MAX_CACHE_BYTES) return false
    this.pruneMemory()
    this.memory.set(key, { payload, expiresAt: this.now() + this.ttlSeconds * 1000 })
    if (!this.redis) return true
    return (await this.redisCommand(['SET', key, serialized, 'EX', this.ttlSeconds])) === 'OK'
  }

  async consumeRateLimit(subject, maximum, windowMs) {
    if (!this.redis) return null
    const key = `careero:rate:v1:${await sha256(subject)}`
    const script = "local count=redis.call('INCR',KEYS[1]); if count==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]); end; local ttl=redis.call('PTTL',KEYS[1]); return {count,ttl}"
    const result = await this.redisCommand(['EVAL', script, '1', key, String(windowMs)])
    if (!Array.isArray(result) || result.length < 2) return null
    const count = Number(result[0])
    const ttl = Number(result[1])
    if (!Number.isFinite(count) || !Number.isFinite(ttl)) return null
    return {
      allowed: count <= maximum,
      remaining: Math.max(0, maximum - count),
      resetAt: this.now() + Math.max(1, ttl),
      layer: 'redis',
    }
  }
}
