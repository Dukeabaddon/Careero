import { describe, expect, it } from 'vitest'
import { dimensionDetailImage } from '@/features/landing/dimensions/dimensionDetailImages.js'
import { RIASEC_CODES } from '@/utils/riasecScoring.js'

describe('dimensionDetailImages', () => {
  it('maps rotated archetype artwork for each RIASEC dimension', () => {
    const expected = {
      R: 'archetype_builder',
      I: 'archetype_pathfinder',
      A: 'archetype_creator',
      S: 'archetype_guardian',
      E: 'archetype_visionary',
      C: 'archetype_strategist',
    }

    for (const code of RIASEC_CODES) {
      const url = dimensionDetailImage(code)
      expect(url, `missing detail image for ${code}`).toBeTruthy()
      expect(String(url)).toContain(expected[code])
    }
  })
})
