import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MultiLLMRotator, createEnvironmentKeyPool } from '../../src/services/multiLLMRotator.js'

describe('MultiLLMRotator', () => {
  let rotator

  beforeEach(() => {
    rotator = new MultiLLMRotator([
      { id: 'gemini-1', provider: 'gemini', key: 'key-1', model: 'gemini-test', priority: 1 },
      { id: 'gemini-2', provider: 'gemini', key: 'key-2', model: 'gemini-test', priority: 1 },
      { id: 'deepseek-1', provider: 'deepseek', key: 'key-3', model: 'deepseek-test', priority: 2 },
    ])
  })

  it('uses the first active key on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ careerPathways: [] }),
    })

    const result = await rotator.executeRequest({ prompt: 'test' }, fetchMock)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][1].headers['x-goog-api-key']).toBe('key-1')
    expect(result.provider).toBe('gemini')
  })

  it('rotates immediately on HTTP 429 without timers or backoff', async () => {
    const timerSpy = vi.spyOn(globalThis, 'setTimeout')
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ careerPathways: ['AI Engineer'] }) })

    const result = await rotator.executeRequest({ prompt: 'test' }, fetchMock)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(timerSpy).not.toHaveBeenCalled()
    expect(result.data.careerPathways).toEqual(['AI Engineer'])
    expect(rotator.keys[0].status).toBe('cooldown')
    timerSpy.mockRestore()
  })

  it.each([403, 500, 502, 503, 504])('fails over for HTTP %s', async (status) => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ careerPathways: [] }) })
    await expect(rotator.executeRequest({ prompt: 'test' }, fetchMock)).resolves.toBeDefined()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('throws when every configured key is exhausted', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 429 })
    await expect(rotator.executeRequest({ prompt: 'test' }, fetchMock)).rejects.toThrow(
      'All API key pools temporarily exhausted',
    )
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('rotates immediately when a provider returns malformed JSON', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: 'not json' }] } }] }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ recommendations: { schools: [] } }) })
    const result = await rotator.executeRequest({ prompt: 'test' }, fetchMock)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.data.recommendations.schools).toEqual([])
  })

  it('builds five Gemini keys and one DeepSeek key from environment values', () => {
    const environment = Object.fromEntries([
      ...Array.from({ length: 5 }, (_, index) => [`GEMINI_API_KEY_${index + 1}`, `g-${index + 1}`]),
      ['DEEPSEEK_API_KEY_1', 'd-1'],
      ['ENABLE_PAID_DEEPSEEK', 'true'],
    ])
    expect(createEnvironmentKeyPool(environment)).toHaveLength(6)
  })

  it('keeps paid DeepSeek disabled unless explicitly enabled', () => {
    expect(createEnvironmentKeyPool({ DEEPSEEK_API_KEY_1: 'configured' })).toHaveLength(0)
  })
})
