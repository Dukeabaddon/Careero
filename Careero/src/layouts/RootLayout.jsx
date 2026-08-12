import { useEffect } from 'react'
import Lenis from 'lenis'
import Navbar from '@/components/Navbar.jsx'

export default function RootLayout({
  children,
  onLanguageChange,
  onStart,
  compact,
  onGoHome,
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothTouch: false,
    })

    window.lenis = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      window.lenis = null
      lenis.destroy()
    }
  }, [])

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Navbar
        onLanguageChange={onLanguageChange}
        onStart={onStart}
        compact={compact}
        onGoHome={onGoHome}
      />

      <main>{children}</main>
    </div>
  )
}
