import { useEffect, useMemo, useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import ClickSpark from '@/components/ClickSpark.jsx'
import { getLocalizedQuestion } from '@/features/assessment/data/localizedQuestions.js'
import { useAssessmentKeyboard } from '@/features/assessment/hooks/useAssessmentKeyboard.js'
import {
  defaultQuestions,
  resolveQuestionsList,
  upsertResponse,
} from '@/features/assessment/utils/assessmentUtils.js'
import AssessmentProgress from '@/features/assessment/components/AssessmentProgress.jsx'
import ChoiceCard from '@/features/assessment/components/ChoiceCard.jsx'
import LocationSetup from '@/features/assessment/components/LocationSetup.jsx'
import './Assessment.css'

export default function Assessment({
  questions = defaultQuestions,
  assessmentState,
  onUpdateState,
  onComplete,
  onReset: _onReset,
}) {
  const { t, i18n } = useTranslation()

  const hasLocation = Boolean(assessmentState?.location?.country)

  const questionsList = useMemo(() => resolveQuestionsList(questions), [questions])
  const currentIndex = assessmentState?.currentQuestionIndex || 0
  const currentQ = questionsList[currentIndex] || questionsList[0] || {}
  const question = getLocalizedQuestion(currentQ, i18n.language)
  const response = assessmentState?.responses?.find(({ questionId }) => questionId === question?.id)
  const progress = questionsList.length ? ((currentIndex + 1) / questionsList.length) * 100 : 0

  const assessmentRef = useRef(assessmentState)
  const questionRef = useRef(question)
  const currentIndexRef = useRef(currentIndex)
  const questionsLenRef = useRef(questionsList.length)
  const latestResponseRef = useRef(null)

  useEffect(() => {
    assessmentRef.current = assessmentState
  }, [assessmentState])

  useEffect(() => {
    questionRef.current = question
    currentIndexRef.current = currentIndex
    questionsLenRef.current = questionsList.length
  }, [question, currentIndex, questionsList.length])

  useEffect(() => {
    latestResponseRef.current = response || null
  }, [response])

  const selectOptionAndRating = (optionKey, rating = null, timestamp = Date.now()) => {
    const activeQuestion = questionRef.current
    const activeState = assessmentRef.current
    const selected = activeQuestion?.[optionKey]
    if (!selected || !activeState) return
    const existing = (activeState.responses || []).find(({ questionId }) => questionId === activeQuestion.id)
    const newRating = rating !== null ? rating : (existing?.selectedCode === selected.code ? existing.rating : null)
    const nextResponse = {
      questionId: activeQuestion.id,
      selectedCode: selected.code,
      rating: newRating,
      timestamp,
    }
    latestResponseRef.current = nextResponse
    onUpdateState({ ...activeState, responses: upsertResponse(activeState.responses || [], nextResponse) })
  }

  const moveBack = () => {
    const index = currentIndexRef.current
    const activeState = assessmentRef.current
    if (index === 0 || !activeState) return
    onUpdateState({ ...activeState, currentQuestionIndex: index - 1 })
  }

  const moveNext = () => {
    const activeState = assessmentRef.current
    const index = currentIndexRef.current
    const total = questionsLenRef.current
    const latest = latestResponseRef.current
    if (!activeState || !latest?.rating) return
    if (index >= total - 1) {
      onComplete({ ...activeState, isCompleted: true })
      return
    }
    onUpdateState({ ...activeState, currentQuestionIndex: index + 1 })
  }

  const selectOptionAndRatingRef = useRef(selectOptionAndRating)
  const moveNextRef = useRef(moveNext)
  selectOptionAndRatingRef.current = selectOptionAndRating
  moveNextRef.current = moveNext

  useAssessmentKeyboard({
    enabled: hasLocation,
    onUpdateState,
    onComplete,
    selectOptionAndRatingRef,
    moveNextRef,
    questionRef,
    latestResponseRef,
  })

  const handleOptionDoubleClick = (optionKey, timestamp) => {
    selectOptionAndRating(optionKey, null, timestamp)
    if (response?.rating) moveNext()
  }

  const handleReactionDoubleClick = (optionKey, rating, timestamp) => {
    const opt = question?.[optionKey] || {}
    selectOptionAndRating(optionKey, rating, timestamp)
    if (currentIndex < questionsList.length - 1) {
      onUpdateState({
        ...assessmentState,
        responses: upsertResponse(assessmentState.responses || [], {
          questionId: question.id,
          selectedCode: opt.code,
          rating,
          timestamp,
        }),
        currentQuestionIndex: currentIndex + 1,
      })
    } else {
      onComplete({ ...assessmentState, isCompleted: true })
    }
  }

  if (!hasLocation) {
    return <LocationSetup assessmentState={assessmentState} onUpdateState={onUpdateState} />
  }

  return (
    <ClickSpark sparkColor="#2563eb" sparkRadius={28} sparkSize={12} duration={650} sparkCount={10}>
      <section className="assessment section-wrap max-w-4xl mx-auto py-8 px-4">
        <AssessmentProgress
          currentIndex={currentIndex}
          totalQuestions={questionsList.length}
          progress={progress}
        />

        <AnimatePresence mode="wait">
          <motion.div
            className="question-container"
            key={question?.id || currentIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <div className="choice-cards mb-10">
              {['optionA', 'optionB'].map((optionKey, idx) => {
                const opt = question?.[optionKey] || {}
                const isSelected = response?.selectedCode === opt.code
                return (
                  <div key={optionKey} className="contents">
                    {idx === 1 && (
                      <span className="choice-or" aria-hidden="true">{t('quiz.or')}</span>
                    )}
                    <ChoiceCard
                      optionKey={optionKey}
                      optionIndex={idx}
                      question={question}
                      option={opt}
                      isSelected={isSelected}
                      responseRating={response?.rating}
                      onSelectOption={selectOptionAndRating}
                      onOptionDoubleClick={handleOptionDoubleClick}
                      onReactionDoubleClick={handleReactionDoubleClick}
                    />
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={moveBack}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 hover:font-bold hover:border-slate-400 flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft size={16} /> {t('quiz.previous')}
              </button>

              <button
                type="button"
                onClick={moveNext}
                disabled={!response?.rating}
                className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-extrabold shadow-md flex items-center gap-1.5 transition-all"
              >
                <span className="text-white font-extrabold">{t('quiz.next')}</span>
                <ArrowRight size={16} className="text-white" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </ClickSpark>
  )
}
