import { describe, expect, it, vi } from 'vitest'
import { createRecommendationCacheKey, ServerRecommendationCache } from '../../src/services/serverRecommendationCache.js'

const input = {
  profile: { normalizedScores: { R: 8, I: 9, A: 4, S: 3, E: 6, C: 7 } },
  location: { country: 'Philippines', city: 'Manila' },
  language: 'en',
  topProfession: { id: 'data-scientists-15-2051-00' },
}

describe('server recommendation cache', () => {
  it('creates stable, profession-specific opaque keys', async () => {
    const first = await createRecommendationCacheKey(input)
    const same = await createRecommendationCacheKey(structuredClone(input))
    const otherProfession = await createRecommendationCacheKey({
      ...input,
      topProfession: { id: 'statisticians-15-2041-00' },
    })
    expect(first).toBe(same)
    expect(first).not.toBe(otherProfession)
    expect(first).not.toContain('data-scientists')
  })

  it('uses the in-isolate cache without network access', async () => {
    const fetchMock = vi.fn()
    const cache = new ServerRecommendationCache({}, { fetchImpl: fetchMock })
    await cache.set('key', { status: 'success' })
    await expect(cache.get('key')).resolves.toMatchObject({ payload: { status: 'success' }, layer: 'memory' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('writes and reads optional Upstash REST cache entries', async () => {
    const payload = { status: 'success', recommendations: { schools: [] } }
    const environment = {
      UPSTASH_REDIS_REST_URL: 'https://careero-cache.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'test-token',
    }
    const writeFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: 'OK' }) })
    const writer = new ServerRecommendationCache(environment, { fetchImpl: writeFetch })
    await expect(writer.set('key', payload)).resolves.toBe(true)
    expect(JSON.parse(writeFetch.mock.calls[0][1].body)).toEqual(['SET', 'key', JSON.stringify(payload), 'EX', 86400])

    const readFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: JSON.stringify(payload) }) })
    const reader = new ServerRecommendationCache(environment, { fetchImpl: readFetch })
    await expect(reader.get('key')).resolves.toMatchObject({ payload, layer: 'redis' })
    expect(readFetch.mock.calls[0][1].headers.authorization).toBe('Bearer test-token')
  })

  it('fails open when the durable cache is unavailable', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'))
    const cache = new ServerRecommendationCache({
      UPSTASH_REDIS_REST_URL: 'https://careero-cache.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'test-token',
    }, { fetchImpl: fetchMock })
    await expect(cache.get('missing')).resolves.toBeNull()
  })

  it('uses an opaque Redis key for the shared rate limit', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: [3, 45_000] }) })
    const cache = new ServerRecommendationCache({
      UPSTASH_REDIS_REST_URL: 'https://careero-cache.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'test-token',
    }, { fetchImpl: fetchMock, now: () => 1_000 })

    await expect(cache.consumeRateLimit('203.0.113.4', 20, 60_000)).resolves.toEqual({
      allowed: true,
      remaining: 17,
      resetAt: 46_000,
      layer: 'redis',
    })
    const command = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(command[0]).toBe('EVAL')
    expect(command[3]).not.toContain('203.0.113.4')
  })
})
