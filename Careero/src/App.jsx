import { lazy, Suspense, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { calculateRiasecScores, getTopDimensions, normalizeRiasecScores } from '@/utils/riasecScoring.js'
import { clearQuizState } from '@/utils/storage.js'
import RootLayout from '@/layouts/RootLayout.jsx'
import HomePage from '@/pages/HomePage.jsx'
import { useAssessmentFlow } from '@/features/assessment'

const AssessmentPage = lazy(() => import('@/pages/AssessmentPage.jsx'))
const ResultsPage = lazy(() => import('@/pages/ResultsPage.jsx'))

export default function App() {
  const { i18n } = useTranslation()
  const {
    assessmentState,
    setAssessmentState,
    phase,
    setPhase,
    updateAssessment,
    handleLanguageChange,
    startQuiz,
  } = useAssessmentFlow()

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

  const goHome = () => {
    setPhase('landing')
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true })
  }

  return (
    <RootLayout
      onLanguageChange={handleLanguageChange}
      onStart={startQuiz}
      compact={phase === 'quiz' || phase === 'results'}
      onGoHome={goHome}
    >
      <Suspense fallback={<div className="screen-loader"><div className="size-10 animate-spin rounded-full border-2 border-blue-600/20 border-t-blue-600" /></div>}>
        {phase === 'landing' && <HomePage onStart={startQuiz} />}

        {phase === 'quiz' && (
          <AssessmentPage
            assessmentState={assessmentState}
            onUpdateState={updateAssessment}
            onComplete={(completedState) => {
              updateAssessment({ ...completedState, isCompleted: true })
              setPhase('results')
              window.scrollTo({ top: 0, behavior: 'instant' })
              if (window.lenis) window.lenis.scrollTo(0, { immediate: true })
            }}
            onReset={() => {
              const freshState = {
                ...assessmentState,
                location: null,
                responses: [],
                currentQuestionIndex: 0,
                isCompleted: false,
              }
              updateAssessment(freshState)
            }}
          />
        )}

        {phase === 'results' && profile && (
          <ResultsPage
            profile={profile}
            onRetake={() => {
              clearQuizState()
              setAssessmentState(null)
              setPhase('landing')
            }}
          />
        )}
      </Suspense>
    </RootLayout>
  )
}
