import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Lenis from 'lenis'
import { calculateRiasecScores, getTopDimensions, normalizeRiasecScores } from './utils/riasecScoring.js'
import { loadQuizState, saveQuizState } from './utils/storage.js'
import Navbar from './components/Navbar.jsx'

const Landing = lazy(() => import('./components/Landing.jsx'))
const Assessment = lazy(() => import('./components/Assessment.jsx'))
const Results = lazy(() => import('./components/Results.jsx'))

export default function App() {
  const { i18n } = useTranslation()
  const [assessmentState, setAssessmentState] = useState(() => loadQuizState())
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
      location: assessmentState.location || { country: 'Global', city: '' },
      language: assessmentState.language || i18n.language,
    }
  }, [assessmentState, i18n.language])

  const updateAssessment = (nextState) => {
    const hydratedState = { ...nextState, language: i18n.language }
    saveQuizState(hydratedState)
    setAssessmentState(hydratedState)
  }

  const startQuiz = () => {
    // ALWAYS reset location so the country selection step renders first
    const freshState = {
      version: 1,
      location: null,
      language: i18n.language,
      currentQuestionIndex: 0,
      responses: [],
      isCompleted: false,
    }
    saveQuizState(freshState)
    setAssessmentState(freshState)
    setPhase('quiz')
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true })
  }

  const goHome = () => {
    setPhase('landing')
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true })
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Navbar
        onLanguageChange={(code) => i18n.changeLanguage(code)}
        onStart={startQuiz}
        isQuiz={phase === 'quiz'}
        onGoHome={goHome}
      />

      <main>
        <Suspense fallback={<div className="screen-loader"><div className="spinner" /></div>}>
          {phase === 'landing' && (
            <Landing onStart={startQuiz} />
          )}

          {phase === 'quiz' && (
            <Assessment
              assessmentState={assessmentState}
              onUpdateState={updateAssessment}
              onComplete={() => setPhase('results')}
              onReset={() => {
                const freshState = { ...assessmentState, location: null, responses: [], currentQuestionIndex: 0, isCompleted: false }
                saveQuizState(freshState)
                setAssessmentState(freshState)
              }}
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
    </div>
  )
}
