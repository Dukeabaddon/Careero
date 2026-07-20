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
  normalizedScores: { R: 8.8, I: 9.5, A: 4.2, S: 3, E: 6.1, C: 7.7 },
  archetypeCode: 'IR',
  location: { country: 'Japan', city: 'Tokyo' },
  language: 'ja',
}
const topProfession = { id: 'data-scientist', title: 'Data Scientist', matchPercent: 92 }

describe('local persistence and results cache', () => {
  it('restores exact mid-quiz progress', () => {
    const storage = new MemoryStorage()
    saveQuizState(quizState, storage)
    expect(loadQuizState(storage)).toEqual(quizState)
    expect(JSON.parse(storage.getItem(QUIZ_STATE_KEY)).currentQuestionIndex).toBe(17)
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
    const hash = await createProfileHash(profile)
    await writeResultsCache(hash, { status: 'success', meta: { cached: false }, recommendations: {} }, storage)
    const fetchMock = vi.fn()

    const result = await getRecommendations(profile, topProfession, { storage, fetchImpl: fetchMock })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.meta.cached).toBe(true)
  })
})
