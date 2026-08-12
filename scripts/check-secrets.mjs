import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const trackedFiles = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', '.'], {
  cwd: process.cwd(),
  encoding: 'utf8',
}).split('\0').filter(Boolean)

const forbiddenEnvironmentFiles = trackedFiles.filter(
  (file) => /^\.env(?:\.|$)/.test(file) && file !== '.env.example',
)

const secretPatterns = [
  { name: 'Google API key', pattern: /(?:AIza|AQ\.)[A-Za-z0-9_-]{30,}/g },
  { name: 'Groq API key', pattern: /gsk_[A-Za-z0-9_-]{20,}/g },
  { name: 'Cerebras API key', pattern: /csk-[A-Za-z0-9_-]{20,}/g },
  { name: 'OpenRouter API key', pattern: /sk-or-v1-[A-Za-z0-9_-]{20,}/g },
  { name: 'generic provider key', pattern: /sk-[a-f0-9]{24,}/gi },
]

const findings = forbiddenEnvironmentFiles.map((file) => `tracked environment file: ${file}`)

for (const file of trackedFiles) {
  let contents
  try {
    contents = readFileSync(resolve(process.cwd(), file), 'utf8')
  } catch {
    continue
  }

  for (const { name, pattern } of secretPatterns) {
    pattern.lastIndex = 0
    if (pattern.test(contents)) findings.push(`${name}: ${file}`)
  }
}

if (findings.length > 0) {
  console.error('Potential committed secrets found:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log(`Secret scan passed (${trackedFiles.length} tracked files).`)
