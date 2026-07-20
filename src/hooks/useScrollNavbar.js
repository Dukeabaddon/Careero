import { useEffect, useRef, useState } from 'react'

export const NAV_MODES = {
  REST: 'rest',
  PILL: 'pill',
  HIDDEN: 'hidden',
}

export const REST_TOP = 8
export const HIDE_DELTA = 30
export const MORPH_DELAY_MS = 300

export function reduceNavbarScrollState(state, scrollY, delta, now = Date.now()) {
  const y = Math.max(0, scrollY)
  let { mode, pillEnteredAt, accumulatedDown, hasScrolledPastTop } = state

  if (y >= REST_TOP) {
    hasScrolledPastTop = true
  }

  if (y < REST_TOP) {
    if (!hasScrolledPastTop || y <= 1) {
      return {
        mode: NAV_MODES.REST,
        pillEnteredAt: null,
        accumulatedDown: 0,
        hasScrolledPastTop: false,
      }
    }

    return {
      mode: NAV_MODES.PILL,
      pillEnteredAt,
      accumulatedDown,
      hasScrolledPastTop: true,
    }
  }

  if (mode === NAV_MODES.REST) {
    mode = NAV_MODES.PILL
    pillEnteredAt = now
  }

  // Scrolling UP -> Reveal Pill immediately
  if (delta < 0) {
    accumulatedDown = 0
    if (mode === NAV_MODES.HIDDEN) {
      mode = NAV_MODES.PILL
    }
    return { mode, pillEnteredAt, accumulatedDown, hasScrolledPastTop }
  }

  // Scrolling DOWN -> Hide Pill after HIDE_DELTA threshold
  if (delta > 0) {
    const morphReady = pillEnteredAt != null && now - pillEnteredAt >= MORPH_DELAY_MS

    if (!morphReady) {
      if (mode === NAV_MODES.HIDDEN) {
        mode = NAV_MODES.PILL
      }
      return { mode, pillEnteredAt, accumulatedDown, hasScrolledPastTop }
    }

    accumulatedDown += delta
    if (accumulatedDown >= HIDE_DELTA) {
      return {
        mode: NAV_MODES.HIDDEN,
        pillEnteredAt,
        accumulatedDown,
        hasScrolledPastTop,
      }
    }
  }

  if (mode !== NAV_MODES.HIDDEN) {
    mode = NAV_MODES.PILL
  }

  return { mode, pillEnteredAt, accumulatedDown, hasScrolledPastTop }
}

export function useScrollNavbar() {
  const [mode, setMode] = useState(NAV_MODES.REST)
  const lastScrollY = useRef(0)
  const stateRef = useRef({
    mode: NAV_MODES.REST,
    pillEnteredAt: null,
    accumulatedDown: 0,
    hasScrolledPastTop: false,
  })

  useEffect(() => {
    const update = (scrollY) => {
      const delta = scrollY - lastScrollY.current
      lastScrollY.current = scrollY
      stateRef.current = reduceNavbarScrollState(stateRef.current, scrollY, delta)
      setMode(stateRef.current.mode)
    }

    const onScroll = () => update(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return {
    mode,
    isRest: mode === NAV_MODES.REST,
    isPill: mode === NAV_MODES.PILL,
    isHidden: mode === NAV_MODES.HIDDEN,
  }
}
