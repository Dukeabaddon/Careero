import { CAREER_VECTORS } from '@/data/careers.js'
import { RIASEC_CODES } from '@/utils/riasecScoring.js'

const EXAMPLE_COUNT = 3

/** Top O*NET occupations whose interest vector peaks on the given RIASEC dimension. */
export function getExampleCareersForDimension(code, count = EXAMPLE_COUNT) {
  if (!RIASEC_CODES.includes(code)) return []

  return CAREER_VECTORS
    .slice()
    .sort((left, right) => right.vector[code] - left.vector[code])
    .slice(0, count)
    .map((career) => career.title)
}
