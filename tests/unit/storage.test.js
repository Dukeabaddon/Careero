import { describe, expect, it, vi } from 'vitest'
import {
  createProfileHash,
  loadQuizState,
  QUIZ_STATE_KEY,
  readResultsCache,
  saveQuizState,
  writeResultsCache,
} from '../../src/utils/storage.js'
import { getRecommendations } from '../../src/services/recommendations.js'
import { createRecommendationsHandler } from '../../api/v1/recommendations.js'

class MemoryStorage {
  constructor() { this.values = new Map() }
  get length() { return this.values.size }
  getItem(key) { return this.values.get(key) ?? null }
  setItem(key, value) { this.values.set(key, String(value)) }
  removeItem(key) { this.values.delete(key) }
  key(index) { return [...this.values.keys()][index] ?? null }
}

const quizState = {
  version: 1,
  location: { country: 'Japan', city: 'Tokyo' },
  language: 'ja',
  currentQuestionIndex: 17,
  responses: [{ questionId: 18, selectedCode: 'E', rating: 3, timestamp: 123 }],
  isCompleted: false,
}

const profile = {
  normalizedScores: { R: 3.41, I: 10.97, A: 4.1, S: 2.61, E: 2.69, C: 8.47 },
  archetypeCode: 'IC',
  location: { country: 'Japan', city: 'Tokyo' },
  language: 'ja',
}
const topProfession = { id: 'data-scientists-15-2051-00', title: 'Data Scientists', matchPercent: 100 }

describe('local persistence and results cache', () => {
  it('restores exact mid-quiz progress', () => {
    const storage = new MemoryStorage()
    saveQuizState(quizState, storage)
    expect(loadQuizState(storage)).toEqual(quizState)
    expect(JSON.parse(storage.getItem(QUIZ_STATE_KEY)).currentQuestionIndex).toBe(17)
  })

  it('allows `location: null` before country selection', () => {
    const storage = new MemoryStorage()
    const startingState = {
      version: 1,
      location: null,
      language: 'en',
      currentQuestionIndex: 0,
      responses: [],
      isCompleted: false,
    }
    saveQuizState(startingState, storage)
    expect(loadQuizState(storage)).toEqual(startingState)
  })

  it('removes corrupted quiz state safely', () => {
    const storage = new MemoryStorage()
    storage.setItem(QUIZ_STATE_KEY, '{bad json')
    expect(loadQuizState(storage)).toBeNull()
    expect(storage.getItem(QUIZ_STATE_KEY)).toBeNull()
  })

  it('creates deterministic profile hashes', async () => {
    await expect(createProfileHash(profile)).resolves.toBe(await createProfileHash({ ...profile }))
  })

  it('stores and reads recommendation payloads by profile hash', async () => {
    const storage = new MemoryStorage()
    await writeResultsCache('abc', { status: 'success' }, storage)
    expect((await readResultsCache('abc', storage)).payload.status).toBe('success')
  })

  it('rejects a tampered cached payload', async () => {
    const storage = new MemoryStorage()
    await writeResultsCache('abc', { status: 'success' }, storage)
    const entry = JSON.parse(storage.getItem('global_results_cache_abc'))
    entry.payload.status = 'tampered'
    storage.setItem('global_results_cache_abc', JSON.stringify(entry))
    expect(await readResultsCache('abc', storage)).toBeNull()
  })

  it('serves cached AI results without a duplicate fetch', async () => {
    const storage = new MemoryStorage()
    const hash = await createProfileHash(profile, topProfession.id)
    await writeResultsCache(hash, { status: 'success', meta: { cached: false }, recommendations: {} }, storage)
    const fetchMock = vi.fn()

    const result = await getRecommendations(profile, topProfession, { storage, fetchImpl: fetchMock })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.meta.cached).toBe(true)
  })

  it('caches recommendations separately per profession', async () => {
    const storage = new MemoryStorage()
    const otherProfession = { id: 'accountant', title: 'Accountant', matchPercent: 88 }
    const hashA = await createProfileHash(profile, topProfession.id)
    const hashB = await createProfileHash(profile, otherProfession.id)
    expect(hashA).not.toBe(hashB)

    await writeResultsCache(hashA, { status: 'success', meta: { cached: false }, recommendations: { schools: [{ name: 'A' }] } }, storage)
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', meta: { cached: false }, recommendations: { schools: [{ name: 'B' }] } }),
    })

    const cached = await getRecommendations(profile, topProfession, { storage, fetchImpl: fetchMock })
    const fresh = await getRecommendations(profile, otherProfession, { storage, fetchImpl: fetchMock })

    expect(cached.recommendations.schools[0].name).toBe('A')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fresh.recommendations.schools[0].name).toBe('B')
  })

  it('coalesces prefetch and expand requests for the same profession', async () => {
    const storage = new MemoryStorage()
    let resolveFetch
    const fetchMock = vi.fn(() => new Promise((resolve) => {
      resolveFetch = () => resolve({
        ok: true,
        json: async () => ({ status: 'success', recommendations: { schools: [] } }),
      })
    }))

    const prefetch = getRecommendations(profile, topProfession, { storage, fetchImpl: fetchMock })
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const expand = getRecommendations(profile, topProfession, { storage, fetchImpl: fetchMock })
    resolveFetch()

    const [prefetched, expanded] = await Promise.all([prefetch, expand])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(expanded).toEqual(prefetched)
    expect((await readResultsCache(prefetched.profileHash, storage)).payload.status).toBe('success')
  })

  it('reports an actionable error when a frontend-only server returns an empty 404', async () => {
    const storage = new MemoryStorage()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => '',
    })

    await expect(getRecommendations(profile, topProfession, { storage, fetchImpl: fetchMock }))
      .rejects.toThrow('Start Careero with npm run dev')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('connects the frontend service contract to the Edge handler and survives refresh', async () => {
    const storage = new MemoryStorage()
    const engine = {
      keys: [{ id: 'integration-key' }],
      executeRequest: vi.fn().mockResolvedValue({
        model: 'gemini-2.5-flash-lite',
        data: {
          recommendations: {
            professionSummary: { title: 'Data Scientists', localOutlook: 'Demand varies.' },
            schools: [{
              name: 'University of Tokyo',
              program: 'Data Science',
              location: 'Tokyo, Japan',
              scope: 'nearby',
              whyStrong: 'Relevant quantitative study.',
              website: 'https://www.u-tokyo.ac.jp/',
            }],
            scholarshipsAndPrograms: [],
            skillDevelopment: ['Statistics'],
            verificationNote: 'Check the official site.',
          },
        },
      }),
    }
    const edgeHandler = createRecommendationsHandler({ engine, environment: {} })
    const edgeFetch = vi.fn((url, options) => edgeHandler(new Request(`https://careero.test${url}`, options)))

    const first = await getRecommendations(profile, topProfession, { storage, fetchImpl: edgeFetch })
    const afterRefreshFetch = vi.fn()
    const restored = await getRecommendations(profile, topProfession, { storage, fetchImpl: afterRefreshFetch })

    expect(first.recommendations.schools[0].name).toBe('University of Tokyo')
    expect(edgeFetch).toHaveBeenCalledTimes(1)
    expect(engine.executeRequest).toHaveBeenCalledTimes(1)
    expect(afterRefreshFetch).not.toHaveBeenCalled()
    expect(restored.meta.cached).toBe(true)
  })
})
