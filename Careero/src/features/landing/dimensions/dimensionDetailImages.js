import { resolveArchetypeImageAsset } from '@/features/results/utils/archetypeTheme.js'

// Detail-panel artwork is rotated per dimension; titles/colors stay on the RIASEC code.
const DIMENSION_DETAIL_IMAGE_ASSET = {
  R: 'builder',
  I: 'pathfinder',
  A: 'creator',
  S: 'guardian',
  E: 'visionary',
  C: 'strategist',
}

export function dimensionDetailImage(code) {
  const asset = DIMENSION_DETAIL_IMAGE_ASSET[code]
  return asset ? resolveArchetypeImageAsset(asset) : undefined
}
