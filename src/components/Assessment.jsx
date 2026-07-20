import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronDown, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Country, City } from 'country-state-city'
import ClickSpark from './ClickSpark.jsx'
import { getLocalizedQuestion } from '../data/localizedQuestions.js'
import questionsData from '../data/questions.json'

const defaultQuestions = questionsData.questions || questionsData

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

const REACTION_KEYS = [
  { value: 1, labelKey: 'quiz.reactionJustOkay', gif: '/reactions/just-okay.gif' },
  { value: 2, labelKey: 'quiz.reactionGreat', gif: '/reactions/wow.gif' },
  { value: 3, labelKey: 'quiz.reactionLoveIt', gif: '/reactions/love-it.gif' },
]

/**
 * Extracts a frozen first-frame from an animated GIF using canvas.
 * Returns a data URL that can be used as a static poster image.
 */
function useGifFirstFrame(gifSrc) {
  const [posterSrc, setPosterSrc] = useState(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        setPosterSrc(canvas.toDataURL('image/png'))
      } catch {
        // canvas fallback to gif src
        setPosterSrc(gifSrc)
      }
    }
    img.onerror = () => setPosterSrc(gifSrc)
    img.src = gifSrc
  }, [gifSrc])

  return posterSrc
}

function ReactionCard({ config, label, isSelected, onClick, onDoubleClick }) {
  const [isHovered, setIsHovered] = useState(false)
  const posterSrc = useGifFirstFrame(config.gif)
  const allowHoverPlayback = config.value !== 1
  const shouldAnimate = isSelected || (allowHoverPlayback && isHovered)

  return (
    <button
      type="button"
      className={`reaction-gif-card ${isSelected ? 'active' : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`rating-${config.value}-btn`}
    >
      <div className="gif-rounded-thumb">
        <img
          src={shouldAnimate ? config.gif : (posterSrc || config.gif)}
          alt={label}
          className="reaction-gif-img"
        />
      </div>
      <span className="reaction-label">{label}</span>
    </button>
  )
}

export default function Assessment({ questions = defaultQuestions, assessmentState, onUpdateState, onComplete, onReset: _onReset }) {
  const { t, i18n } = useTranslation()

  const [countryOpen, setCountryOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [countryQuery, setCountryQuery] = useState('')
  const [cityQuery, setCityQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const countryDropdownRef = useRef(null)
  const cityDropdownRef = useRef(null)
  const latestResponseRef = useRef(null)

  const hasLocation = Boolean(assessmentState?.location?.country)

  // Load 250 Worldwide Countries using country-state-city library
  const regionNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([i18n.language], { type: 'region' })
    } catch {
      return null
    }
  }, [i18n.language])

  const allCountries = useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      isoCode: c.isoCode,
      name: regionNames?.of(c.isoCode) || c.name,
      flag: c.flag || '🌐',
    })).sort((a, b) => a.name.localeCompare(b.name, i18n.language))
  }, [i18n.language, regionNames])

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase()
    if (!q) return allCountries
    return allCountries
      .filter((c) => c.name.toLowerCase().includes(q) || c.isoCode.toLowerCase().includes(q))
  }, [allCountries, countryQuery])

  // Load cities for selected country using country-state-city library
  const allCities = useMemo(() => {
    if (!selectedCountry) return []
    const rawCities = City.getCitiesOfCountry(selectedCountry.isoCode) || []
    const unique = [...new Set(rawCities.map((c) => c.name))]
    return unique.sort((a, b) => a.localeCompare(b, i18n.language))
  }, [selectedCountry, i18n.language])

  const filteredCities = useMemo(() => {
    const q = cityQuery.trim().toLowerCase()
    if (!q) return allCities
    return allCities.filter((c) => c.toLowerCase().includes(q))
  }, [allCities, cityQuery])

  const pickCountry = (country) => {
    setSelectedCountry(country)
    setSelectedCity(null)
    setCountryQuery('')
    setCityQuery('')
    setCountryOpen(false)
    setCityOpen(false)
  }

  const pickCity = (cityName) => {
    setSelectedCity(cityName)
    setCityQuery('')
    setCityOpen(false)
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setCountryOpen(false)
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setCityOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const confirmLocation = () => {
    if (!selectedCountry) return
    const newLocation = {
      country: selectedCountry.name,
      city: selectedCity || '',
    }
    const nextState = {
      version: 1,
      location: newLocation,
      language: i18n.language,
      currentQuestionIndex: 0,
      responses: assessmentState?.responses || [],
      isCompleted: false,
    }
    onUpdateState(nextState)
  }

  // 30-Question Assessment Logic
  const questionsList = useMemo(() => {
    if (Array.isArray(questions)) return questions
    if (Array.isArray(questions?.questions)) return questions.questions
    return defaultQuestions
  }, [questions])

  const currentIndex = assessmentState?.currentQuestionIndex || 0
  const currentQ = questionsList[currentIndex] || questionsList[0] || {}
  const question = getLocalizedQuestion(currentQ, i18n.language)
  const response = assessmentState?.responses?.find(({ questionId }) => questionId === question?.id)
  const progress = questionsList.length ? ((currentIndex + 1) / questionsList.length) * 100 : 0

  const assessmentRef = useRef(assessmentState)
  const questionRef = useRef(question)
  const currentIndexRef = useRef(currentIndex)
  const questionsLenRef = useRef(questionsList.length)

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

  // Atomic function to select option and rating together without stale closure bugs
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

  useEffect(() => {
    if (!hasLocation) return undefined
    const handleKeyboard = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (
        event.target instanceof HTMLInputElement
        || event.target instanceof HTMLSelectElement
        || event.target instanceof HTMLTextAreaElement
      ) return

      const key = event.key
      if (key === 'ArrowLeft' || key.toLowerCase() === 'a') {
        selectOptionAndRating('optionA', null, event.timeStamp)
        return
      }
      if (key === 'ArrowRight' || key.toLowerCase() === 'b') {
        selectOptionAndRating('optionB', null, event.timeStamp)
        return
      }
      if (['1', '2', '3'].includes(key) && latestResponseRef.current?.selectedCode) {
        const activeQuestion = questionRef.current
        const activeOptKey = latestResponseRef.current.selectedCode === activeQuestion?.optionA?.code ? 'optionA' : 'optionB'
        selectOptionAndRating(activeOptKey, Number(key), event.timeStamp)
        return
      }
      if ((key === 'Enter' || key === 'NumpadEnter') && latestResponseRef.current?.rating) {
        event.preventDefault()
        moveNext()
      }
    }
    document.addEventListener('keydown', handleKeyboard, true)
    return () => document.removeEventListener('keydown', handleKeyboard, true)
  }, [hasLocation, onComplete, onUpdateState])

  if (!hasLocation) {
    return (
      <ClickSpark sparkColor="#2563eb" sparkRadius={28} sparkSize={12} duration={650} sparkCount={10}>
        <section className="location-setup">
        <motion.div
          className="location-setup-inner"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="location-field" ref={countryDropdownRef}>
            <span className="location-label">{t('location.country')}</span>
            <button
              type="button"
              className={`location-dropdown-trigger ${countryOpen ? 'open' : ''}`}
              onClick={() => {
                setCountryOpen((open) => !open)
                setCityOpen(false)
              }}
              data-testid="country-dropdown-trigger"
            >
              <span className="location-dropdown-value">
                {selectedCountry ? (
                  <>
                    <span className="location-flag">{selectedCountry.flag}</span>
                    {selectedCountry.name}
                  </>
                ) : (
                  t('location.selectCountry')
                )}
              </span>
              <ChevronDown size={18} />
            </button>
            {countryOpen && (
              <div className="location-dropdown-panel" data-lenis-prevent>
                <label className="location-search">
                  <Search size={16} />
                  <input
                    type="text"
                    value={countryQuery}
                    onChange={(event) => setCountryQuery(event.target.value)}
                    placeholder={t('location.searchCountry')}
                    autoFocus
                    data-testid="country-search-input"
                  />
                </label>
                <div className="location-dropdown-list location-dropdown-list-countries" role="listbox">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.isoCode}
                      type="button"
                      role="option"
                      className="location-dropdown-option"
                      onClick={() => pickCountry(country)}
                      data-testid="country-option"
                    >
                      <span className="location-flag">{country.flag}</span>
                      <span>{country.name}</span>
                    </button>
                  ))}
                  {countryQuery.trim() && filteredCountries.length === 0 && (
                    <p className="location-dropdown-hint">{t('location.noMatches')}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="location-field" ref={cityDropdownRef}>
            <span className="location-label">{t('location.city')}</span>
            <button
              type="button"
              className={`location-dropdown-trigger ${cityOpen ? 'open' : ''}`}
              disabled={!selectedCountry}
              onClick={() => {
                if (!selectedCountry) return
                setCityOpen((open) => !open)
                setCountryOpen(false)
              }}
              data-testid="city-dropdown-trigger"
            >
              <span className="location-dropdown-value">
                {selectedCity || t('location.selectCityOptional')}
              </span>
              <ChevronDown size={18} />
            </button>
            {cityOpen && selectedCountry && (
              <div className="location-dropdown-panel location-dropdown-panel-cities" data-lenis-prevent>
                <label className="location-search">
                  <Search size={16} />
                  <input
                    type="text"
                    value={cityQuery}
                    onChange={(event) => setCityQuery(event.target.value)}
                    placeholder={t('location.searchCity')}
                    autoFocus
                    data-testid="city-search-input"
                  />
                </label>
                <div className="location-dropdown-list location-dropdown-list-cities" role="listbox">
                  {filteredCities.map((cityName) => (
                    <button
                      key={cityName}
                      type="button"
                      role="option"
                      className={`location-dropdown-option ${selectedCity === cityName ? 'selected' : ''}`}
                      onClick={() => pickCity(cityName)}
                      data-testid="city-option"
                    >
                      {cityName}
                    </button>
                  ))}
                  {filteredCities.length === 0 && (
                    <p className="location-dropdown-hint">{t('location.noMatches')}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="location-continue-btn"
            disabled={!selectedCountry}
            onClick={confirmLocation}
            data-testid="confirm-location-btn"
          >
            {t('location.continue')}
          </button>
        </motion.div>
      </section>
      </ClickSpark>
    )
  }

  // STEP 1-30: Render 30-Question RIASEC Assessment Screen
  return (
    <ClickSpark sparkColor="#2563eb" sparkRadius={28} sparkSize={12} duration={650} sparkCount={10}>
      <section className="assessment section-wrap max-w-4xl mx-auto py-8 px-4">
        {/* Progress stays mounted — only questions/options remount on change */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-600 mb-2">
            <span>{t('quiz.questionOf', { current: currentIndex + 1, total: questionsList.length })}</span>
            <span>{t('quiz.percentComplete', { percent: Math.round(progress) })}</span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-blue-600 rounded-full transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{t('quiz.title')}</h1>
          <p className="text-sm text-slate-500">{t('quiz.subtitle')}</p>
        </div>

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
                  <div className="choice-card-wrap border-2 rounded-3xl p-6 bg-white transition-all flex flex-col justify-between border-slate-200">
                    <div
                      onClick={(e) => selectOptionAndRating(optionKey, null, e.timeStamp)}
                      onDoubleClick={(e) => {
                        selectOptionAndRating(optionKey, null, e.timeStamp)
                        if (response?.rating) moveNext()
                      }}
                      className="cursor-pointer"
                    >
                      <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-[#fcfcfc] flex items-center justify-center">
                        <img
                          src={optionImage(question?.id || 1, idx === 0 ? 'a' : 'b')}
                          alt={opt.text || ''}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                      <h3 className="font-bold text-slate-800 text-base mb-3">{opt.text}</h3>
                    </div>

                    {/* Reaction GIF Options */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                      {REACTION_KEYS.map((cfg) => (
                        <ReactionCard
                          key={cfg.value}
                          config={cfg}
                          label={t(cfg.labelKey)}
                          isSelected={isSelected && response?.rating === cfg.value}
                        onClick={(e) => {
                          selectOptionAndRating(optionKey, cfg.value, e.timeStamp)
                        }}
                        onDoubleClick={(e) => {
                          selectOptionAndRating(optionKey, cfg.value, e.timeStamp)
                          if (currentIndex < questionsList.length - 1) {
                            onUpdateState({
                              ...assessmentState,
                              responses: upsertResponse(assessmentState.responses || [], {
                                questionId: question.id,
                                selectedCode: opt.code,
                                rating: cfg.value,
                                timestamp: e.timeStamp,
                              }),
                              currentQuestionIndex: currentIndex + 1,
                            })
                          } else {
                            onComplete({ ...assessmentState, isCompleted: true })
                          }
                        }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom Controls */}
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
