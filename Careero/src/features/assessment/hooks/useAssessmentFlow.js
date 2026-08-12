import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadQuizState, saveQuizState } from '@/utils/storage.js'

export function initialPhase(state) {
  if (!state) return 'landing'
  if (state.isCompleted) return 'results'
  const answered = state.responses?.filter((item) => item.rating)?.length || 0
  // Recover older sessions that finished the quiz but never persisted isCompleted.
  if (answered >= 30) return 'results'
  if (state.location?.country || state.responses?.length) return 'quiz'
  return 'landing'
}

export function useAssessmentFlow() {
  const { i18n } = useTranslation()
  const [assessmentState, setAssessmentState] = useState(() => {
    const saved = loadQuizState()
    if (!saved) return null
    const answered = saved.responses?.filter((item) => item.rating)?.length || 0
    if (!saved.isCompleted && answered >= 30) {
      const repaired = { ...saved, isCompleted: true }
      try { saveQuizState(repaired) } catch { /* ignore repair write failures */ }
      return repaired
    }
    return saved
  })
  const [phase, setPhase] = useState(() => initialPhase(assessmentState ?? loadQuizState()))

  const updateAssessment = (nextState) => {
    const hydratedState = { ...nextState, language: i18n.language }
    saveQuizState(hydratedState)
    setAssessmentState(hydratedState)
  }

  const handleLanguageChange = (code) => {
    if (phase === 'quiz' && assessmentState) {
      const nextState = { ...assessmentState, language: code }
      saveQuizState(nextState)
      setAssessmentState(nextState)
    }
  }

  const startQuiz = () => {
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

  return {
    assessmentState,
    setAssessmentState,
    phase,
    setPhase,
    updateAssessment,
    handleLanguageChange,
    startQuiz,
  }
}
