const DEFAULT_PNG_OPTIONS = {
  cacheBust: true,
  pixelRatio: 2,
}

function getExportSize(element) {
  const rect = element.getBoundingClientRect()
  return {
    width: Math.ceil(rect.width),
    height: Math.ceil(rect.height),
  }
}

export function getShareSiteUrl() {
  const fromEnv = import.meta.env.VITE_SITE_URL
  if (fromEnv) return String(fromEnv).replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return 'https://careero.app'
}

export function getShareHost() {
  return 'careero'
}

export function buildShareText({ archetypeTitle, code, profession, percent }) {
  const site = getShareSiteUrl()
  return [
    `My Careero character is ${archetypeTitle} (${code}).`,
    `Top career match: ${profession} — ${percent}% profile match.`,
    `Discover your path → ${site}`,
  ].join('\n')
}

/** PNG export — omit backgroundColor for true alpha outside the card. */
export async function exportElementAsBlob(element, options = {}) {
  if (!element) return { ok: false, error: 'Missing element' }

  const { toBlob } = await import('html-to-image')
  const { width, height } = getExportSize(element)
  const { transparent = true, backgroundColor, ...rest } = options

  const blob = await toBlob(element, {
    ...DEFAULT_PNG_OPTIONS,
    width,
    height,
    ...(transparent ? {} : { backgroundColor: backgroundColor ?? '#ffffff' }),
    ...rest,
  })

  if (!blob) return { ok: false, error: 'Export failed' }
  return { ok: true, blob }
}

export async function exportElementAsPng(element, filename = 'careero-result.png', options = {}) {
  const result = await exportElementAsBlob(element, options)
  if (!result.ok) return result

  const dataUrl = URL.createObjectURL(result.blob)
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
  URL.revokeObjectURL(dataUrl)

  return { ok: true }
}

export function blobToShareFile(blob, filename) {
  return new File([blob], filename, { type: 'image/png' })
}
