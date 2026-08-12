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

  it.each([400, 401, 402, 403, 404, 422, 500, 502, 503, 504])('fails over for HTTP %s', async (status) => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ careerPathways: [] }) })
    await expect(rotator.executeRequest({ prompt: 'test' }, fetchMock)).resolves.toBeDefined()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('fails over immediately after a provider network error', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network unavailable'))
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

  it('uses DeepSeek after all Gemini keys are exhausted', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: '{"recommendations":{"schools":[]}}' } }],
        }),
      })

    const result = await rotator.executeRequest({ prompt: 'test' }, fetchMock)
    const [deepSeekUrl, deepSeekOptions] = fetchMock.mock.calls[2]
    expect(deepSeekUrl).toBe('https://api.deepseek.com/chat/completions')
    expect(deepSeekOptions.headers.authorization).toBe('Bearer key-3')
    expect(JSON.parse(deepSeekOptions.body).model).toBe('deepseek-test')
    expect(result.provider).toBe('deepseek')
  })

  it('skips duplicate keys for an unavailable Gemini model and uses its fallback model', async () => {
    const modelRotator = new MultiLLMRotator([
      { id: 'primary-1', provider: 'gemini', key: 'key-1', model: 'gemini-primary', priority: 1 },
      { id: 'primary-2', provider: 'gemini', key: 'key-2', model: 'gemini-primary', priority: 1 },
      { id: 'fallback-1', provider: 'gemini', key: 'key-1', model: 'gemini-fallback', priority: 2 },
    ])
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ recommendations: { schools: [] } }) })

    const result = await modelRotator.executeRequest({ prompt: 'test' }, fetchMock)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][0]).toContain('/gemini-primary:generateContent')
    expect(fetchMock.mock.calls[1][0]).toContain('/gemini-fallback:generateContent')
    expect(modelRotator.keys.filter((key) => key.model === 'gemini-primary').every((key) => key.status === 'cooldown')).toBe(true)
    expect(result.model).toBe('gemini-fallback')
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

  it('rotates when a parseable response fails contract validation', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ recommendations: { unsafe: true } }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ recommendations: { safe: true } }) })
    const result = await rotator.executeRequest({
      prompt: 'test',
      validate: (data) => data.recommendations?.safe === true,
    }, fetchMock)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.data.recommendations.safe).toBe(true)
  })

  it('builds two requested slots for each added provider', () => {
    const environment = Object.fromEntries([
      ['GROQ_API_KEY_1', 'groq-1'],
      ['GROQ_API_KEY_2', 'groq-2'],
      ['CEREBRAS_API_KEY_1', 'cerebras-1'],
      ['CEREBRAS_API_KEY_2', 'cerebras-2'],
      ['OPENROUTER_API_KEY_1', 'or-1'],
      ['OPENROUTER_API_KEY_2', 'or-2'],
      ...Array.from({ length: 5 }, (_, index) => [`GEMINI_API_KEY_${index + 1}`, `g-${index + 1}`]),
      ['DEEPSEEK_API_KEY_1', 'd-1'],
      ['ENABLE_PAID_DEEPSEEK', 'true'],
    ])
    const pool = createEnvironmentKeyPool(environment)
    expect(pool).toHaveLength(17)
    expect(pool.filter((entry) => entry.provider === 'groq')).toHaveLength(2)
    expect(pool.filter((entry) => entry.provider === 'cerebras')).toHaveLength(2)
    expect(pool.filter((entry) => entry.provider === 'openrouter')).toHaveLength(2)
    expect(pool.find((entry) => entry.provider === 'groq').model).toBe('groq/compound-mini')
    expect(pool.find((entry) => entry.provider === 'openrouter').webSearch).toBe(true)
    expect(pool.filter((entry) => entry.model === 'gemini-2.5-flash-lite')).toHaveLength(5)
    expect(pool.filter((entry) => entry.model === 'gemini-2.5-flash')).toHaveLength(5)
    expect(pool.at(-1).provider).toBe('deepseek')
  })

  it('uses Groq OpenAI-compatible chat completions first', async () => {
    const freeFirst = new MultiLLMRotator([
      { id: 'groq-1', provider: 'groq', key: 'groq-key', model: 'groq/compound-mini', webSearch: true, priority: 1 },
      { id: 'gemini-1', provider: 'gemini', key: 'gemini-key', model: 'gemini-test', priority: 3 },
    ])
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: '{"recommendations":{"schools":[]}}' } }],
      }),
    })

    const result = await freeFirst.executeRequest({ prompt: 'test', searchCountry: 'Philippines' }, fetchMock)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions')
    expect(options.headers.authorization).toBe('Bearer groq-key')
    const body = JSON.parse(options.body)
    expect(body.model).toBe('groq/compound-mini')
    expect(body.response_format).toEqual({ type: 'json_object' })
    expect(body.search_settings).toEqual({ country: 'philippines' })
    expect(result.provider).toBe('groq')
  })

  it('enables OpenRouter web search and response healing', async () => {
    const openRouter = new MultiLLMRotator([
      {
        id: 'openrouter-1',
        provider: 'openrouter',
        key: 'or-key',
        model: 'openai/gpt-oss-20b:free',
        webSearch: true,
        priority: 1,
      },
    ])
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{
          message: {
            content: '{"recommendations":{"schools":[]}}',
            annotations: [{
              type: 'url_citation',
              url_citation: { title: 'Official school', url: 'https://school.example.edu' },
            }],
          },
        }],
      }),
    })

    const result = await openRouter.executeRequest({ prompt: 'test' }, fetchMock)
    const [url, options] = fetchMock.mock.calls[0]
    const body = JSON.parse(options.body)
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions')
    expect(body.plugins).toEqual([
      { id: 'web', max_results: 10 },
      { id: 'response-healing' },
    ])
    expect(result.data.recommendations.sources).toEqual([
      { title: 'Official school', uri: 'https://school.example.edu' },
    ])
  })

  it('enables configured DeepSeek by default and supports an explicit off switch', () => {
    expect(createEnvironmentKeyPool({ DEEPSEEK_API_KEY_1: 'configured' })).toHaveLength(1)
    expect(createEnvironmentKeyPool({
      DEEPSEEK_API_KEY_1: 'configured',
      ENABLE_PAID_DEEPSEEK: 'false',
    })).toHaveLength(0)
  })
})
