import { describe, expect, it } from 'vitest'
import { CAREER_COUNT, CAREER_VECTORS } from '../../src/data/careers.js'
import {
  buildProfessionTags,
  calculateRiasecScores,
  correlationToMatchPercent,
  normalizeRiasecScores,
  pearsonCorrelation,
  rankCareerMatches,
  RIASEC_CODES,
} from '../../src/utils/riasecScoring.js'

function randomResponses(seed) {
  let value = seed
  const next = () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value
  }
  return Array.from({ length: 30 }, (_, index) => {
    const code = RIASEC_CODES[next() % RIASEC_CODES.length]
    const rating = (next() % 3) + 1
    return { questionId: index + 1, selectedCode: code, rating, timestamp: index }
  })
}

function profileFromResponses(responses) {
  return normalizeRiasecScores(calculateRiasecScores(responses))
}

/** Build a sharp 6-vector for a Holland high-point pair. */
function comboProfile(primary, secondary) {
  const scores = Object.fromEntries(RIASEC_CODES.map((code) => [code, 2]))
  scores[primary] = 11
  scores[secondary] = 8.5
  return scores
}

function jaccard(a, b) {
  const setA = new Set(a)
  const setB = new Set(b)
  let intersection = 0
  for (const item of setA) if (setB.has(item)) intersection += 1
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0 : intersection / union
}

describe('career catalog + matching proof suite', () => {
  it('catalog meets the landing claim (>= 500 occupations)', () => {
    expect(CAREER_COUNT).toBe(CAREER_VECTORS.length)
    expect(CAREER_COUNT).toBeGreaterThanOrEqual(500)
    expect(new Set(CAREER_VECTORS.map((c) => c.id)).size).toBe(CAREER_COUNT)
    expect(new Set(CAREER_VECTORS.map((career) => (
      RIASEC_CODES.map((code) => career.vector[code]).join('|')
    ))).size).toBe(CAREER_COUNT)
  })

  it('regression: ranks the reported CIAS screenshot profile from intact O*NET vectors', () => {
    const screenshotProfile = { R: 0, I: 27, A: 18.33, S: 16.5, E: 0, C: 33 }
    const ranked = rankCareerMatches(screenshotProfile, CAREER_VECTORS).slice(0, 10)

    expect(ranked.map(({ title }) => title)).toEqual([
      'Historians',
      'Archivists',
      'Interpreters and Translators',
      'Proofreaders and Copy Markers',
      'Librarians and Media Collections Specialists',
      'Social Science Research Assistants',
      'Medical Transcriptionists',
      'Data Scientists',
      'Technical Writers',
      'Statisticians',
    ])
    expect(ranked[0]).toMatchObject({
      onetSoc: '19-3093.00',
      holland: 'IC',
      matchPercent: 94,
      vector: { R: 3.76, I: 8.36, A: 5.81, S: 5.06, E: 3.69, C: 7.65 },
    })
    expect(ranked[0].correlation).toBeCloseTo(0.943456, 5)
  })

  it('keeps every career vector on the shared 0–11 RIASEC scale', () => {
    for (const career of CAREER_VECTORS) {
      for (const code of RIASEC_CODES) {
        expect(career.vector[code]).toBeGreaterThanOrEqual(0)
        expect(career.vector[code]).toBeLessThanOrEqual(11)
      }
      expect(career.holland).toMatch(/^[RIASEC]{2}$/)
    }
  })

  it('covers all six primary Holland codes with substantial depth', () => {
    for (const code of RIASEC_CODES) {
      const count = CAREER_VECTORS.filter((career) => career.holland.startsWith(code)).length
      expect(count).toBeGreaterThanOrEqual(20)
    }
  })

  it('ranks identical profiles first and inverse profiles near the bottom', () => {
    const target = CAREER_VECTORS.find((career) => /data scientist/i.test(career.title))
    expect(target).toBeTruthy()
    const ranked = rankCareerMatches(target.vector, CAREER_VECTORS)
    expect(ranked[0].id).toBe(target.id)
    expect(ranked[0].matchPercent).toBe(100)

    const inverse = Object.fromEntries(RIASEC_CODES.map((code) => [code, 11 - target.vector[code]]))
    const inverseRanked = rankCareerMatches(inverse, CAREER_VECTORS)
    const inverseIndex = inverseRanked.findIndex((career) => career.id === target.id)
    expect(inverseIndex).toBeGreaterThan(CAREER_COUNT * 0.9)
    expect(inverseRanked[inverseIndex].correlation).toBeLessThan(0)
  })

  it('uses stable tie-breaks so equal correlations do not shuffle', () => {
    const flat = { R: 5, I: 5, A: 5, S: 5, E: 5, C: 5 }
    const first = rankCareerMatches(flat, CAREER_VECTORS).map((career) => career.id)
    const second = rankCareerMatches(flat, CAREER_VECTORS).map((career) => career.id)
    expect(first).toEqual(second)
  })

  it('PROOF: different RIASEC combos produce different top-10 careers', () => {
    const topsByCombo = new Map()

    for (const primary of RIASEC_CODES) {
      for (const secondary of RIASEC_CODES) {
        if (primary === secondary) continue
        const combo = `${primary}${secondary}`
        const ranked = rankCareerMatches(comboProfile(primary, secondary), CAREER_VECTORS).slice(0, 10)
        topsByCombo.set(combo, ranked.map((career) => career.id))

        // Primary dimension should dominate the top result's vector
        expect(ranked[0].vector[primary]).toBeGreaterThanOrEqual(8)
        // Top-10 average primary should beat catalog average
        const topAvg = ranked.reduce((sum, career) => sum + career.vector[primary], 0) / ranked.length
        const catalogAvg = CAREER_VECTORS.reduce((sum, career) => sum + career.vector[primary], 0) / CAREER_VECTORS.length
        expect(topAvg).toBeGreaterThan(catalogAvg)
      }
    }

    expect(topsByCombo.size).toBe(30)

    // Cross-primary combos must not collapse to the same list
    let distantPairs = 0
    const combos = [...topsByCombo.keys()]
    for (let i = 0; i < combos.length; i += 1) {
      for (let j = i + 1; j < combos.length; j += 1) {
        if (combos[i][0] === combos[j][0]) continue
        const overlap = jaccard(topsByCombo.get(combos[i]), topsByCombo.get(combos[j]))
        if (overlap < 0.4) distantPairs += 1
        expect(overlap).toBeLessThan(0.7)
      }
    }
    expect(distantPairs).toBeGreaterThan(50)
  })

  it('PROOF: opposite Holland poles share almost no top-10 overlap', () => {
    const pairs = [
      ['R', 'A'],
      ['I', 'E'],
      ['S', 'R'],
      ['C', 'A'],
      ['E', 'I'],
      ['A', 'C'],
    ]
    for (const [left, right] of pairs) {
      const secondaryLeft = RIASEC_CODES.find((code) => code !== left && code !== right)
      const secondaryRight = RIASEC_CODES.find((code) => code !== right && code !== left && code !== secondaryLeft)
      const topLeft = rankCareerMatches(comboProfile(left, secondaryLeft), CAREER_VECTORS).slice(0, 10).map((c) => c.id)
      const topRight = rankCareerMatches(comboProfile(right, secondaryRight), CAREER_VECTORS).slice(0, 10).map((c) => c.id)
      expect(jaccard(topLeft, topRight)).toBeLessThan(0.35)
      expect(topLeft[0]).not.toBe(topRight[0])
    }
  })

  it('Monte Carlo: 500 random profiles always yield 10 unique ranked careers', () => {
    for (let seed = 1; seed <= 500; seed += 1) {
      const scores = profileFromResponses(randomResponses(seed))
      const ranked = rankCareerMatches(scores, CAREER_VECTORS).slice(0, 10)

      expect(ranked).toHaveLength(10)
      expect(new Set(ranked.map((career) => career.id)).size).toBe(10)

      for (let index = 1; index < ranked.length; index += 1) {
        expect(ranked[index - 1].correlation).toBeGreaterThanOrEqual(ranked[index].correlation)
        expect(ranked[index].matchPercent).toBe(correlationToMatchPercent(ranked[index].correlation))
      }

      expect(pearsonCorrelation(ranked[0].vector, ranked[0].vector)).toBeCloseTo(1, 10)
    }
  })

  it('Monte Carlo: dominant dimension surfaces matching careers', () => {
    const dominantProfiles = {
      R: { R: 11, I: 4, A: 2, S: 2, E: 3, C: 3 },
      I: { R: 3, I: 11, A: 3, S: 3, E: 3, C: 4 },
      A: { R: 2, I: 4, A: 11, S: 4, E: 4, C: 2 },
      S: { R: 2, I: 4, A: 3, S: 11, E: 4, C: 3 },
      E: { R: 3, I: 4, A: 4, S: 5, E: 11, C: 4 },
      C: { R: 2, I: 5, A: 2, S: 3, E: 4, C: 11 },
    }

    for (const [code, scores] of Object.entries(dominantProfiles)) {
      const top = rankCareerMatches(scores, CAREER_VECTORS).slice(0, 5)
      const avgDim = top.reduce((sum, career) => sum + career.vector[code], 0) / top.length
      const catalogAvg = CAREER_VECTORS.reduce((sum, career) => sum + career.vector[code], 0) / CAREER_VECTORS.length
      expect(avgDim).toBeGreaterThan(catalogAvg)
      expect(top[0].vector[code]).toBeGreaterThanOrEqual(8)
      expect(top[0].holland.startsWith(code)).toBe(true)
    }
  })

  it('builds client-side tags without inventing empty junk', () => {
    const career = CAREER_VECTORS.find((item) => /accountant/i.test(item.title))
    expect(career).toBeTruthy()
    const tags = buildProfessionTags({ R: 2, I: 8, A: 2, S: 3, E: 5, C: 11 }, { ...career, matchPercent: 90 })
    expect(tags.length).toBeGreaterThan(0)
    expect(tags.some((tag) => tag.type === 'alignment' || tag.type === 'campus')).toBe(true)
    expect(tags.some((tag) => tag.code === 'C' || tag.type === 'flagship')).toBe(true)
    expect(tags.some((tag) => tag.type === 'flagship')).toBe(true)
  })
})
