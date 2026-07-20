import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const localesDir = path.join(projectRoot, 'src', 'locales')
const baseLanguage = 'en'

function flatten(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key
    return child && typeof child === 'object' && !Array.isArray(child) ? flatten(child, next) : [next]
  })
}

const base = JSON.parse(fs.readFileSync(path.join(localesDir, baseLanguage, 'translation.json'), 'utf8'))
const baseKeys = new Set(flatten(base))
const languages = fs.readdirSync(localesDir).filter((language) => language !== baseLanguage)
let failures = 0

for (const language of languages) {
  const filePath = path.join(localesDir, language, 'translation.json')
  if (!fs.existsSync(filePath)) {
    console.error(`Missing locale dictionary: ${language}`)
    failures += 1
    continue
  }
  const dictionary = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const keys = new Set(flatten(dictionary))
  const missing = [...baseKeys].filter((key) => !keys.has(key))
  const extra = [...keys].filter((key) => !baseKeys.has(key))
  if (missing.length || extra.length) {
    console.error(`${language}: missing [${missing.join(', ')}], extra [${extra.join(', ')}]`)
    failures += missing.length + extra.length
  } else {
    console.log(`${language}: ${keys.size} keys verified`)
  }
}

if (failures > 0) process.exit(1)
