import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Lenis from 'lenis'
import { calculateRiasecScores, getTopDimensions, normalizeRiasecScores } from './utils/riasecScoring.js'
import { loadQuizState, saveQuizState } from './utils/storage.js'
import Navbar from './components/Navbar.jsx'

const Landing = lazy(() => import('./components/Landing.jsx'))
const LocationModal = lazy(() => import('./components/LocationModal.jsx'))
const Assessment = lazy(() => import('./components/Assessment.jsx'))
const Results = lazy(() => import('./components/Results.jsx'))

function createState(location, language) {
  return {
    version: 1,
    location,
    language,
    currentQuestionIndex: 0,
    responses: [],
    isCompleted: false,
  }
}

export default function App() {
  const { i18n } = useTranslation()
  const [, setSavedSession] = useState(() => loadQuizState())
  const [assessmentState, setAssessmentState] = useState(() => loadQuizState())
  const [isLocationOpen, setLocationOpen] = useState(false)
  const [phase, setPhase] = useState(() => (loadQuizState()?.isCompleted ? 'results' : 'landing'))

  // Initialize Lenis smooth scroll
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

  const profile = useMemo(() => {
    if (!assessmentState?.responses?.length) return null
    const rawScores = calculateRiasecScores(assessmentState.responses)
    const normalizedScores = normalizeRiasecScores(rawScores)
    const topDimensions = getTopDimensions(normalizedScores)
    return {
      rawScores,
      normalizedScores,
      topDimensions,
      archetypeCode: topDimensions.map(({ code }) => code).join(''),
      location: assessmentState.location,
      language: assessmentState.language,
    }
  }, [assessmentState])

  const startAssessment = (location) => {
    const nextState = createState(location, i18n.language)
    saveQuizState(nextState)
    setAssessmentState(nextState)
    setSavedSession(null)
    setLocationOpen(false)
    setPhase('quiz')
    // Scroll to top so quiz renders at top of viewport
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true })
  }

  const updateAssessment = (nextState) => {
    const hydratedState = { ...nextState, language: i18n.language }
    saveQuizState(hydratedState)
    setAssessmentState(hydratedState)
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Navbar onLanguageChange={(code) => i18n.changeLanguage(code)} onStart={() => setLocationOpen(true)} />

      <main>
        <Suspense fallback={<div className="screen-loader"><div className="spinner" /></div>}>
          {phase === 'landing' && (
            <Landing onStart={() => setLocationOpen(true)} />
          )}

          {phase === 'quiz' && (
            <Assessment
              assessmentState={assessmentState}
              onUpdateState={updateAssessment}
              onComplete={() => setPhase('results')}
            />
          )}

          {phase === 'results' && profile && (
            <Results
              profile={profile}
              onRetake={() => {
                setAssessmentState(null)
                saveQuizState(null)
                setPhase('landing')
              }}
            />
          )}
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <LocationModal
          open={isLocationOpen}
          onConfirm={startAssessment}
          onClose={() => setLocationOpen(false)}
        />
      </Suspense>
    </div>
  )
}
