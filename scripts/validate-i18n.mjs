import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const localesDir = path.join(projectRoot, 'src', 'locales')
const baseLanguage = 'en'
const languagesModuleUrl = pathToFileURL(path.join(projectRoot, 'src', 'i18n', 'languages.js')).href

const { LANGUAGES } = await import(languagesModuleUrl)

function flatten(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key
    return child && typeof child === 'object' && !Array.isArray(child) ? flatten(child, next) : [next]
  })
}

const base = JSON.parse(fs.readFileSync(path.join(localesDir, baseLanguage, 'translation.json'), 'utf8'))
const baseKeys = new Set(flatten(base))
let failures = 0

for (const { code } of LANGUAGES) {
  const filePath = path.join(localesDir, code, 'translation.json')
  if (!fs.existsSync(filePath)) {
    console.error(`Missing locale dictionary: ${code}`)
    failures += 1
    continue
  }

  if (code === baseLanguage) {
    console.log(`${code}: ${baseKeys.size} keys (base)`)
    continue
  }

  const dictionary = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const keys = new Set(flatten(dictionary))
  const missing = [...baseKeys].filter((key) => !keys.has(key))
  const extra = [...keys].filter((key) => !baseKeys.has(key))
  if (missing.length || extra.length) {
    console.error(`${code}: missing [${missing.join(', ')}], extra [${extra.join(', ')}]`)
    failures += missing.length + extra.length
  } else {
    console.log(`${code}: ${keys.size} keys verified`)
  }
}

const onDisk = fs.readdirSync(localesDir).filter((entry) => {
  return fs.statSync(path.join(localesDir, entry)).isDirectory()
})
const registryCodes = new Set(LANGUAGES.map((language) => language.code))
const orphanDirs = onDisk.filter((code) => !registryCodes.has(code))
if (orphanDirs.length) {
  console.error(`Orphan locale dirs not in registry: ${orphanDirs.join(', ')}`)
  failures += orphanDirs.length
}

console.log(`registry languages: ${LANGUAGES.length}`)
if (failures > 0) process.exit(1)
