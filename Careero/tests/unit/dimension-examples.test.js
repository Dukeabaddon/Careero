import { describe, expect, it } from 'vitest'
import { RIASEC_CODES } from '@/utils/riasecScoring.js'
import { getExampleCareersForDimension } from '@/features/landing/dimensions/dimensionExamples.js'

describe('getExampleCareersForDimension', () => {
  it('returns three O*NET titles per RIASEC code', () => {
    for (const code of RIASEC_CODES) {
      const examples = getExampleCareersForDimension(code)
      expect(examples).toHaveLength(3)
      expect(new Set(examples).size).toBe(3)
    }
  })

  it('returns empty list for unknown codes', () => {
    expect(getExampleCareersForDimension('X')).toEqual([])
  })
})
