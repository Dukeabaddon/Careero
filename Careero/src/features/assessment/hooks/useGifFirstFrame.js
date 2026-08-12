import { useEffect, useState } from 'react'

/**
 * Extracts a frozen first-frame from an animated GIF using canvas.
 * Returns a data URL that can be used as a static poster image.
 */
export function useGifFirstFrame(gifSrc) {
  const [posterSrc, setPosterSrc] = useState(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        setPosterSrc(canvas.toDataURL('image/png'))
      } catch {
        setPosterSrc(gifSrc)
      }
    }
    img.onerror = () => setPosterSrc(gifSrc)
    img.src = gifSrc
  }, [gifSrc])

  return posterSrc
}
