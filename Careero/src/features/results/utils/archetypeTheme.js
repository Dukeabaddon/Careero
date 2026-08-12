const archetypeAssets = import.meta.glob('@/assets/riasec/archetype_*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

const archetypes = {
  RI: ['pathfinder', '#f59e0b', 'rgba(245, 158, 11, 0.14)'],
  IR: ['pathfinder', '#f59e0b', 'rgba(245, 158, 11, 0.14)'],
  AS: ['creator', '#ec4899', 'rgba(236, 72, 153, 0.14)'],
  SA: ['creator', '#ec4899', 'rgba(236, 72, 153, 0.14)'],
  EC: ['strategist', '#7c3aed', 'rgba(124, 58, 237, 0.14)'],
  CE: ['strategist', '#7c3aed', 'rgba(124, 58, 237, 0.14)'],
  CI: ['visionary', '#0ea5e9', 'rgba(14, 165, 233, 0.14)', 'analyst'],
  IC: ['visionary', '#0ea5e9', 'rgba(14, 165, 233, 0.14)', 'analyst'],
  IA: ['visionary', '#0ea5e9', 'rgba(14, 165, 233, 0.14)'],
  AI: ['visionary', '#0ea5e9', 'rgba(14, 165, 233, 0.14)'],
  RC: ['builder', '#ea580c', 'rgba(234, 88, 12, 0.16)'],
  CR: ['builder', '#ea580c', 'rgba(234, 88, 12, 0.16)'],
  SE: ['guardian', '#059669', 'rgba(5, 150, 105, 0.14)'],
  ES: ['guardian', '#059669', 'rgba(5, 150, 105, 0.14)'],
}

const primaryFallback = {
  R: ['pathfinder', '#f59e0b', 'rgba(245, 158, 11, 0.14)'],
  I: ['visionary', '#0ea5e9', 'rgba(14, 165, 233, 0.14)'],
  A: ['creator', '#ec4899', 'rgba(236, 72, 153, 0.14)'],
  S: ['guardian', '#059669', 'rgba(5, 150, 105, 0.14)'],
  E: ['strategist', '#7c3aed', 'rgba(124, 58, 237, 0.14)'],
  C: ['builder', '#ea580c', 'rgba(234, 88, 12, 0.16)'],
}

function resolveArchetypeImage(asset) {
  return Object.entries(archetypeAssets).find(([path]) => path.endsWith(`archetype_${asset}.webp`))?.[1]
}

export function resolveArchetype(code) {
  const direct = archetypes[code] || archetypes[code.split('').reverse().join('')]
  const [asset, stroke, fill, title = asset] = direct || primaryFallback[code[0]]
  const image = resolveArchetypeImage(asset)
  return { asset, titleKey: `results.archetypes.${title}`, image, stroke, fill }
}

export function listArchetypeAssetKeys() {
  return Object.keys(archetypeAssets)
}
