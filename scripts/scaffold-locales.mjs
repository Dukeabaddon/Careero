import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const localesDir = path.join(projectRoot, 'src', 'locales')
const languagesModuleUrl = pathToFileURL(path.join(projectRoot, 'src', 'i18n', 'languages.js')).href

const { LANGUAGES } = await import(languagesModuleUrl)
const basePath = path.join(localesDir, 'en', 'translation.json')
const base = fs.readFileSync(basePath, 'utf8')

let created = 0
let skipped = 0

for (const { code } of LANGUAGES) {
  const dir = path.join(localesDir, code)
  const filePath = path.join(dir, 'translation.json')
  if (fs.existsSync(filePath)) {
    skipped += 1
    continue
  }
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, base)
  created += 1
  console.log(`created ${code}`)
}

console.log(`scaffold complete: created=${created} skipped=${skipped} total=${LANGUAGES.length}`)
