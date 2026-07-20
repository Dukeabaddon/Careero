import { lazy, Suspense, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import questionsData from './data/questions.json'
import { calculateRiasecScores, getTopDimensions, normalizeRiasecScores } from './utils/riasecScoring.js'
import { clearCareerData, clearQuizState, loadQuizState, saveQuizState } from './utils/storage.js'
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
  const [savedSession, setSavedSession] = useState(() => loadQuizState())
  const [assessmentState, setAssessmentState] = useState(() => loadQuizState())
  const [isLocationOpen, setLocationOpen] = useState(false)
  const [phase, setPhase] = useState(() => (loadQuizState()?.isCompleted ? 'results' : 'landing'))

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
  }

  const updateAssessment = (nextState) => {
    const hydratedState = { ...nextState, language: i18n.language }
    saveQuizState(hydratedState)
    setAssessmentState(hydratedState)
  }

  const resumeAssessment = () => {
    if (!savedSession) return
    i18n.changeLanguage(savedSession.language)
    setAssessmentState(savedSession)
    setPhase(savedSession.isCompleted ? 'results' : 'quiz')
  }

  const resetAssessment = () => {
    clearQuizState()
    setAssessmentState(null)
    setSavedSession(null)
    window.history.replaceState({}, '', '/')
    setPhase('landing')
  }

  const finishAssessment = (completedState) => {
    updateAssessment(completedState)
    window.history.pushState({}, '', '/results')
    setPhase('results')
  }

  const clearAllData = () => {
    clearCareerData()
    setAssessmentState(null)
    setSavedSession(null)
    window.history.replaceState({}, '', '/')
    setPhase('landing')
  }

  const changeLanguage = (language) => {
    i18n.changeLanguage(language)
    if (!assessmentState) return
    const nextState = { ...assessmentState, language }
    saveQuizState(nextState)
    setAssessmentState(nextState)
    setSavedSession((current) => (current ? { ...current, language } : current))
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <Navbar onClearData={clearAllData} onLanguageChange={changeLanguage} />
      <main>
        <Suspense fallback={<div className="screen-loader"><span className="loader" /></div>}>
          {phase === 'landing' && (
            <Landing
              savedSession={savedSession}
              onStart={() => setLocationOpen(true)}
              onResume={resumeAssessment}
              onStartFresh={() => {
                resetAssessment()
                setLocationOpen(true)
              }}
            />
          )}
          {phase === 'quiz' && assessmentState && (
            <Assessment
              questions={questionsData.questions}
              state={assessmentState}
              onChange={updateAssessment}
              onComplete={finishAssessment}
              onReset={resetAssessment}
            />
          )}
          {phase === 'results' && assessmentState && profile && (
            <Results profile={profile} onRestart={resetAssessment} />
          )}
        </Suspense>
      </main>
      {isLocationOpen && (
        <Suspense fallback={null}>
          <LocationModal open onClose={() => setLocationOpen(false)} onConfirm={startAssessment} />
        </Suspense>
      )}
    </div>
  )
}
