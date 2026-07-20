import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(projectRoot, '.env.local')

if (!fs.existsSync(envPath)) {
  console.error('Missing .env.local. Copy .env.example and add server-side keys.')
  process.exit(1)
}

const environment = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const separator = line.indexOf('=')
      return [line.slice(0, separator), line.slice(separator + 1).replace(/^['"]|['"]$/g, '')]
    }),
)

const checks = []
for (let index = 1; index <= 5; index += 1) {
  const key = environment[`GEMINI_API_KEY_${index}`]
  if (!key) continue
  checks.push({
    label: `Gemini slot ${index}`,
    request: () => fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1', {
      headers: { 'x-goog-api-key': key },
    }),
  })
}

if (environment.DEEPSEEK_API_KEY_1) {
  checks.push({
    label: 'DeepSeek slot 1 (authentication only; no generation)',
    request: () => fetch('https://api.deepseek.com/models', {
      headers: { authorization: `Bearer ${environment.DEEPSEEK_API_KEY_1}` },
    }),
  })
}

let failures = 0
for (const check of checks) {
  try {
    const response = await check.request()
    if (response.ok) console.log(`${check.label}: valid`)
    else { console.error(`${check.label}: rejected (HTTP ${response.status})`); failures += 1 }
  } catch {
    console.error(`${check.label}: network check failed`)
    failures += 1
  }
}

if (!checks.length) {
  console.error('No provider keys configured.')
  process.exit(1)
}

if (failures) process.exit(1)
