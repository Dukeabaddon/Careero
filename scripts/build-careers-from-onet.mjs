#!/usr/bin/env node
/**
 * Build CAREER_VECTORS from official O*NET Interests + Occupation Data.
 *
 * Scale: O*NET Occupational Interests (OI) are ~1–7.
 * Careero normalized scores use 0–11, so we map: value * (11/7).
 *
 * Usage:
 *   node scripts/build-careers-from-onet.mjs [path-to-db_30_2_text-dir]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultDir = join(__dirname, '../tmp_onet/db_30_2_text')
const dataDir = process.argv[2] || defaultDir
const interestsPath = join(dataDir, 'Interests.txt')
const occupationsPath = join(dataDir, 'Occupation Data.txt')
const outPath = join(__dirname, '../src/data/careers.js')

const ELEMENT_TO_CODE = {
  Realistic: 'R',
  Investigative: 'I',
  Artistic: 'A',
  Social: 'S',
  Enterprising: 'E',
  Conventional: 'C',
}

function slugify(title, soc) {
  const base = title
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${base}-${soc.replace(/\./g, '-')}`
}

function parseTsv(path) {
  const text = readFileSync(path, 'utf8')
  const lines = text.split(/\r?\n/).filter(Boolean)
  const headers = lines[0].split('\t')
  return lines.slice(1).map((line) => {
    const cols = line.split('\t')
    return Object.fromEntries(headers.map((header, index) => [header, cols[index] ?? '']))
  })
}

if (!existsSync(interestsPath) || !existsSync(occupationsPath)) {
  console.error(`Missing O*NET files in ${dataDir}`)
  process.exit(1)
}

const occupations = new Map()
for (const row of parseTsv(occupationsPath)) {
  occupations.set(row['O*NET-SOC Code'], {
    title: row.Title,
    description: row.Description || `Career pathway for ${row.Title}.`,
  })
}

const interestBySoc = new Map()
for (const row of parseTsv(interestsPath)) {
  if (row['Scale ID'] !== 'OI') continue
  const code = ELEMENT_TO_CODE[row['Element Name']]
  if (!code) continue
  const soc = row['O*NET-SOC Code']
  if (!interestBySoc.has(soc)) interestBySoc.set(soc, {})
  interestBySoc.get(soc)[code] = Number(row['Data Value'])
}

const careers = []
const seenIds = new Set()

for (const [soc, scores] of interestBySoc.entries()) {
  const meta = occupations.get(soc)
  if (!meta) continue
  if (!['R', 'I', 'A', 'S', 'E', 'C'].every((code) => Number.isFinite(scores[code]))) continue

  const vector = Object.fromEntries(
    ['R', 'I', 'A', 'S', 'E', 'C'].map((code) => [
      code,
      Number(Math.min(11, Math.max(0, (scores[code] * 11) / 7)).toFixed(2)),
    ]),
  )

  const ranked = Object.entries(vector).sort((a, b) => b[1] - a[1])
  const holland = `${ranked[0][0]}${ranked[1][0]}`
  let id = slugify(meta.title, soc)
  if (seenIds.has(id)) id = `${id}-dup`
  seenIds.add(id)

  const skillLabels = {
    R: 'Hands-on systems',
    I: 'Analysis & research',
    A: 'Creative expression',
    S: 'Helping people',
    E: 'Leadership & persuasion',
    C: 'Organization & accuracy',
  }

  careers.push({
    id,
    title: meta.title,
    onetSoc: soc,
    vector,
    description: meta.description,
    skills: ranked.slice(0, 3).map(([code]) => skillLabels[code]),
    holland,
  })
}

careers.sort((a, b) => a.title.localeCompare(b.title))

const file = `/**
 * Auto-generated from official O*NET 30.2 Interests + Occupation Data.
 * OI scale (1–7) mapped to Careero 0–11 via value * (11/7).
 * Regenerated: ${new Date().toISOString().slice(0, 10)}
 * Count: ${careers.length}
 * Source: https://www.onetcenter.org/database.html
 */
export const CAREER_COUNT = ${careers.length}

export const CAREER_VECTORS = ${JSON.stringify(careers, null, 2)}
`

writeFileSync(outPath, file)
console.log(`Wrote ${careers.length} O*NET careers → ${outPath}`)
