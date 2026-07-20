import { describe, expect, it } from 'vitest'
import {
  calculateRiasecScores,
  correlationToMatchPercent,
  getTopDimensions,
  normalizeRiasecScores,
  pearsonCorrelation,
} from '../../src/utils/riasecScoring.js'

describe('RIASEC scoring engine', () => {
  it('calculates raw sums and applies opportunity normalization exactly', () => {
    const responses = [
      { selectedCode: 'R', rating: 3 },
      { selectedCode: 'R', rating: 2 },
      { selectedCode: 'I', rating: 3 },
      { selectedCode: 'A', rating: 1 },
    ]

    const raw = calculateRiasecScores(responses)
    const normalized = normalizeRiasecScores(raw)

    expect(raw).toEqual({ R: 5, I: 3, A: 1, S: 0, E: 0, C: 0 })
    expect(normalized.R).toBe(5.5)
    expect(normalized.I).toBe(3)
    expect(normalized.A).toBe(1.22)
  })

  it('normalizes equal opportunity-adjusted profiles to equal values', () => {
    const normalized = normalizeRiasecScores({ R: 10, I: 11, A: 9, S: 10, E: 9, C: 11 })
    expect(normalized).toEqual({ R: 11, I: 11, A: 11, S: 11, E: 11, C: 11 })
  })

  it('calculates continuous Pearson profile correlation', () => {
    const user = { R: 10, I: 9, A: 5, S: 3, E: 2, C: 6 }
    const identical = { ...user }
    const inverse = { R: 2, I: 3, A: 6, S: 8, E: 9, C: 5 }

    expect(pearsonCorrelation(user, identical)).toBeCloseTo(1, 10)
    expect(correlationToMatchPercent(pearsonCorrelation(user, identical))).toBe(100)
    expect(pearsonCorrelation(user, inverse)).toBeLessThan(-0.9)
  })

  it('extracts the top dimensions with stable tie handling', () => {
    const top = getTopDimensions({ R: 9.5, I: 11, A: 4, S: 3, E: 6, C: 8 }, 2)
    expect(top).toEqual([{ code: 'I', score: 11 }, { code: 'R', score: 9.5 }])
  })
})
