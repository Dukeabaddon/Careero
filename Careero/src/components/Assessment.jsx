import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, MapPin, RotateCcw } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getLocalizedQuestion } from '../data/localizedQuestions.js'

const questionAssets = import.meta.glob('../assets/riasec/questions/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

function optionImage(questionId, option) {
  const filename = `q${String(questionId).padStart(2, '0')}_${option.toLowerCase()}.webp`
  return Object.entries(questionAssets).find(([path]) => path.endsWith(filename))?.[1]
}

function upsertResponse(responses, response) {
  const existingIndex = responses.findIndex(({ questionId }) => questionId === response.questionId)
  if (existingIndex === -1) return [...responses, response]
  return responses.map((item, index) => (index === existingIndex ? response : item))
}

const REACTION_CONFIG = [
  { value: 1, key: 'okay', label: 'Just Okay', gif: '/reactions/just-okay.gif' },
  { value: 2, key: 'like', label: 'Like It', gif: '/reactions/love-it.gif' },
  { value: 3, key: 'love', label: 'Love It!', gif: '/reactions/wow.gif' },
]

function ReactionCard({ config, isSelected, onClick }) {
  const { t } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)
  const isActive = isSelected || isHovered

  return (
    <button
      type="button"
      className={`reaction-gif-card ${isSelected ? 'active' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`rating-${config.value}-btn`}
    >
      <div className="gif-rounded-thumb">
        <img
          src={isActive ? config.gif : config.gif}
          alt={t(`quiz.${config.key}`)}
          className={`reaction-gif-img ${isActive ? 'playing' : 'paused-thumb'}`}
        />
      </div>
      <span className="reaction-label">{config.value} · {t(`quiz.${config.key}`)}</span>
    </button>
  )
}

export default function Assessment({ questions, state, onChange, onComplete, onReset }) {
  const { t, i18n } = useTranslation()
  const currentIndex = state.currentQuestionIndex
  const question = getLocalizedQuestion(questions[currentIndex], i18n.language)
  const response = state.responses.find(({ questionId }) => questionId === question.id)
  const progress = ((currentIndex + 1) / questions.length) * 100

  const selectOption = (option, timestamp) => {
    const selected = question[option]
    const nextResponse = {
      questionId: question.id,
      selectedCode: selected.code,
      rating: response?.selectedCode === selected.code ? response.rating : null,
      timestamp,
    }
    onChange({ ...state, responses: upsertResponse(state.responses, nextResponse) })
  }

  const selectRating = (rating, timestamp) => {
    if (!response) return
    onChange({
      ...state,
      responses: upsertResponse(state.responses, { ...response, rating, timestamp }),
    })
  }

  const moveBack = () => {
    if (currentIndex === 0) return
    onChange({ ...state, currentQuestionIndex: currentIndex - 1 })
  }

  const moveNext = () => {
    if (!response?.rating) return
    if (currentIndex === questions.length - 1) {
      onComplete({ ...state, isCompleted: true })
      return
    }
    onChange({ ...state, currentQuestionIndex: currentIndex + 1 })
  }

  useEffect(() => {
    const handleKeyboard = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') selectOption('optionA', event.timeStamp)
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'b') selectOption('optionB', event.timeStamp)
      if (['1', '2', '3'].includes(event.key) && response) selectRating(Number(event.key), event.timeStamp)
      if (event.key === 'Enter' && response?.rating) moveNext()
    }
    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  })

  return (
    <section className="assessment section-wrap">
      <div className="assessment-topline">
        <span><MapPin size={15} /> {[state.location.city || state.location.region, state.location.country].filter(Boolean).join(', ')}</span>
        <button className="text-button" type="button" onClick={onReset}><RotateCcw size={15} /> {t('quiz.reset')}</button>
      </div>
      <div className="progress-copy" data-testid="question-progress">
        <strong>{t('quiz.questionOf', { current: currentIndex + 1, total: questions.length })}</strong>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="progress-track"><motion.span animate={{ width: `${progress}%` }} /></div>

      <AnimatePresence mode="wait">
        <motion.div
          className="question-stage"
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
        >
          <header className="question-heading">
            <p className="eyebrow">RIASEC · {question.optionA.code} / {question.optionB.code}</p>
            <h1>{question.text}</h1>
            <p>{t('quiz.choose')} <span className="keyboard-hint">{t('quiz.keyboardHint')}</span></p>
          </header>
          <div className="choice-grid">
            {['optionA', 'optionB'].map((option, index) => {
              const item = question[option]
              const active = response?.selectedCode === item.code
              return (
                <button
                  type="button"
                  className={`choice-card ${active ? 'active' : ''}`}
                  key={option}
                  onClick={(event) => selectOption(option, event.timeStamp)}
                  data-testid={index === 0 ? 'option-a-card' : 'option-b-card'}
                  aria-pressed={active}
                >
                  <span className="choice-index">{String.fromCharCode(65 + index)}</span>
                  <div className="choice-image"><img src={optionImage(question.id, index === 0 ? 'a' : 'b')} alt="" /></div>
                  <span className="choice-copy"><small>{t(`dimensions.${item.code}.name`)}</small><strong>{item.text}</strong></span>
                  <span className="choice-code">{item.code}</span>
                </button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className={`intensity-panel ${response ? 'revealed' : ''}`} aria-hidden={!response}>
        <p>{t('quiz.intensity')}</p>
        <div className="intensity-options flex gap-4 justify-center">
          {REACTION_CONFIG.map((config) => (
            <ReactionCard
              key={config.value}
              config={config}
              isSelected={response?.rating === config.value}
              onClick={(event) => selectRating(config.value, event.timeStamp)}
            />
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        <button className="text-button" type="button" onClick={moveBack} disabled={currentIndex === 0}><ArrowLeft size={18} /> {t('location.back')}</button>
        <button className="primary-button" type="button" onClick={moveNext} disabled={!response?.rating} data-testid="next-question-btn">
          {t(currentIndex === questions.length - 1 ? 'quiz.finish' : 'quiz.next')} <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}
