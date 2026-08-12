const dimensionAssets = import.meta.glob('@/assets/riasec/riasec_*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

export function dimensionImage(code) {
  const suffix = `riasec_${code.toLowerCase()}.webp`
  return Object.entries(dimensionAssets).find(([path]) => path.endsWith(suffix))?.[1]
}
