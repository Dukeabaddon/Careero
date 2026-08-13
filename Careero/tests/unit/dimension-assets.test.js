import { describe, expect, it } from 'vitest'
import { dimensionImage } from '@/features/landing/dimensions/dimensionAssets.js'
import { RIASEC_CODES } from '@/utils/riasecScoring.js'

describe('dimensionAssets', () => {
  it('resolves riasec webp urls for every code', () => {
    for (const code of RIASEC_CODES) {
      const url = dimensionImage(code)
      expect(url, `missing image for ${code}`).toBeTruthy()
      expect(String(url)).toContain('riasec_')
    }
  })
})
