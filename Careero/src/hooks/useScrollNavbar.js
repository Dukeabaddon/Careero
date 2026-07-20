import { useEffect, useState } from 'react'

export const NAV_MODES = {
  REST: 'rest',
  PILL: 'pill',
}

export function useScrollNavbar() {
  const [mode, setMode] = useState(NAV_MODES.REST)

  useEffect(() => {
    const update = (scrollY) => {
      const y = Math.max(0, scrollY || 0)
      if (y > 15) {
        setMode(NAV_MODES.PILL)
      } else {
        setMode(NAV_MODES.REST)
      }
    }

    const onWindowScroll = () => update(window.scrollY)

    let unsubscribeLenis = null
    if (window.lenis) {
      const handleLenisScroll = (instance) => update(instance.scroll)
      window.lenis.on('scroll', handleLenisScroll)
      update(window.lenis.scroll)
      unsubscribeLenis = () => window.lenis.off('scroll', handleLenisScroll)
    }

    window.addEventListener('scroll', onWindowScroll, { passive: true })
    onWindowScroll()

    return () => {
      if (unsubscribeLenis) unsubscribeLenis()
      window.removeEventListener('scroll', onWindowScroll)
    }
  }, [])

  return {
    mode,
    isRest: mode === NAV_MODES.REST,
    isPill: mode === NAV_MODES.PILL,
  }
}
