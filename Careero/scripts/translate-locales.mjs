import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const localesDir = path.join(projectRoot, 'src', 'locales')
const envPath = path.join(projectRoot, '.env.local')

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const i = trimmed.indexOf('=')
    const key = trimmed.slice(0, i).trim()
    let value = trimmed.slice(i + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnv(envPath)

const { LANGUAGES } = await import(pathToFileURL(path.join(projectRoot, 'src', 'i18n', 'languages.js')).href)

function flatten(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key
    if (child && typeof child === 'object' && !Array.isArray(child)) return flatten(child, next)
    if (Array.isArray(child)) {
      return child.flatMap((item, index) => {
        if (item && typeof item === 'object') return flatten(item, `${next}.${index}`)
        return [[`${next}.${index}`, item]]
      })
    }
    return [[next, child]]
  })
}

function unflatten(entries) {
  const root = {}
  for (const [leaf, value] of entries) {
    const parts = leaf.split('.')
    let cursor = root
    for (let i = 0; i < parts.length - 1; i += 1) {
      const part = parts[i]
      const nextPart = parts[i + 1]
      const nextIsIndex = /^\d+$/.test(nextPart)
      if (cursor[part] == null) cursor[part] = nextIsIndex ? [] : {}
      cursor = cursor[part]
    }
    const last = parts[parts.length - 1]
    cursor[/^\d+$/.test(last) ? Number(last) : last] = value
  }
  return root
}

function collectGeminiKeys() {
  const keys = []
  for (let i = 1; i <= 8; i += 1) {
    const key = process.env[`GEMINI_API_KEY_${i}`] || (i === 1 ? process.env.GEMINI_API_KEY : null)
    if (key) keys.push(key)
  }
  return keys
}

const geminiKeys = collectGeminiKeys()
if (!geminiKeys.length) {
  console.error('No GEMINI_API_KEY_* found in environment / .env.local')
  process.exit(1)
}

const geminiModels = ['gemini-2.5-flash']
const openrouterKeys = [process.env.OPENROUTER_API_KEY_1, process.env.OPENROUTER_API_KEY_2].filter(Boolean)
const openrouterModel = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free'
const only = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1]?.split(',').filter(Boolean)
  : null
const force = process.argv.includes('--force')
const concurrency = Number(process.argv.find((arg) => arg.startsWith('--concurrency='))?.split('=')[1] || 2)

const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en', 'translation.json'), 'utf8'))
const enFlat = Object.fromEntries(flatten(en))
const enJson = JSON.stringify(enFlat, null, 2)

let keyCursor = 0
function nextKey() {
  const key = geminiKeys[keyCursor % geminiKeys.length]
  keyCursor += 1
  return key
}

function parseTranslatedFlat(text) {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
  const translatedFlat = JSON.parse(cleaned)
  const missing = Object.keys(enFlat).filter((key) => !(key in translatedFlat))
  const extra = Object.keys(translatedFlat).filter((key) => !(key in enFlat))
  if (missing.length || extra.length) {
    throw new Error(`key mismatch missing=${missing.length} extra=${extra.length}`)
  }
  return unflatten(Object.entries(translatedFlat))
}

function buildPrompt(targetName, targetCode) {
  return [
    `Translate Careero UI strings from English to ${targetName} (BCP-47: ${targetCode}).`,
    'Input is a flat JSON object of leaf keys to English strings.',
    'Return ONLY a flat JSON object with the exact same keys.',
    'Translate values only. Keep Careero, RIASEC, Pearson, O*NET unchanged.',
    'Keep placeholders like {{count}} unchanged.',
    'Do not wrap in markdown.',
    enJson,
  ].join('\n\n')
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function geminiTranslate(targetName, targetCode) {
  const prompt = buildPrompt(targetName, targetCode)
  let lastError = null
  for (const model of geminiModels) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const apiKey = nextKey()
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      })
      if (response.status === 503 || response.status === 429) {
        lastError = new Error(`Gemini ${model} ${response.status}`)
        await sleep(1500 * (attempt + 1))
        continue
      }
      if (!response.ok) {
        const body = await response.text()
        lastError = new Error(`Gemini ${model} ${response.status}: ${body.slice(0, 160)}`)
        break
      }
      const payload = await response.json()
      const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || ''
      return parseTranslatedFlat(text)
    }
  }
  throw lastError || new Error('Gemini failed')
}

async function openrouterTranslate(targetName, targetCode) {
  if (!openrouterKeys.length) throw new Error('No OpenRouter keys')
  const apiKey = openrouterKeys[keyCursor % openrouterKeys.length]
  keyCursor += 1
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:5173',
      'X-Title': process.env.OPENROUTER_APP_TITLE || 'Careero',
    },
    body: JSON.stringify({
      model: openrouterModel,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Return only valid JSON objects.' },
        { role: 'user', content: buildPrompt(targetName, targetCode) },
      ],
    }),
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenRouter ${response.status}: ${body.slice(0, 180)}`)
  }
  const payload = await response.json()
  const text = payload?.choices?.[0]?.message?.content || ''
  return parseTranslatedFlat(text)
}

async function translateLocale(targetName, targetCode) {
  try {
    return await geminiTranslate(targetName, targetCode)
  } catch (geminiError) {
    try {
      return await openrouterTranslate(targetName, targetCode)
    } catch (openrouterError) {
      throw new Error(`${geminiError.message} | ${openrouterError.message}`)
    }
  }
}

function alreadyTranslated(code) {
  const filePath = path.join(localesDir, code, 'translation.json')
  if (!fs.existsSync(filePath)) return false
  const current = fs.readFileSync(filePath, 'utf8')
  return current !== JSON.stringify(en, null, 2) + '\n' && current !== JSON.stringify(en)
}

const targets = LANGUAGES.filter((language) => {
  if (language.quality === 'human' || language.code === 'en') return false
  if (only && !only.includes(language.code)) return false
  if (!force && alreadyTranslated(language.code)) return false
  return true
})

console.log(`translate targets=${targets.length} geminiModels=${geminiModels.join(',')} openrouter=${openrouterModel} concurrency=${concurrency}`)

async function mapPool(items, limit, worker) {
  const results = []
  let index = 0
  async function run() {
    while (index < items.length) {
      const current = index
      index += 1
      results[current] = await worker(items[current], current)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()))
  return results
}

const outcomes = await mapPool(targets, concurrency, async (language) => {
  const started = Date.now()
  try {
    const translated = await translateLocale(language.name, language.code)
    const outPath = path.join(localesDir, language.code, 'translation.json')
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, `${JSON.stringify(translated, null, 2)}\n`)
    const ok = JSON.stringify(translated) !== JSON.stringify(en)
    console.log(`${ok ? 'ok' : 'warn-same'} ${language.code} ${Date.now() - started}ms`)
    return { code: language.code, ok, error: null }
  } catch (error) {
    console.error(`fail ${language.code}: ${error.message}`)
    return { code: language.code, ok: false, error: error.message }
  }
})

const failed = outcomes.filter((item) => item && !item.ok)
console.log(`done ok=${outcomes.filter((item) => item?.ok).length} fail=${failed.length}`)
if (failed.length) process.exitCode = 1
