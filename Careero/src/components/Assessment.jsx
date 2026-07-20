import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, MapPin, Search, RotateCcw } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { countries, getEmojiFlag } from 'countries-list'
import { getLocalizedQuestion } from '../data/localizedQuestions.js'
import defaultQuestions from '../data/questions.json'

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
  { value: 2, key: 'like', label: 'Great!', gif: '/reactions/wow.gif' },
  { value: 3, key: 'love', label: 'Love It!', gif: '/reactions/love-it.gif' },
]

const MAJOR_CITIES = {
  AU: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
  BR: ['São Paulo', 'Rio de Janeiro', 'Brasília'],
  CA: ['Toronto', 'Vancouver', 'Montreal', 'Calgary'],
  CN: ['Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou', 'Chengdu'],
  DE: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
  ES: ['Madrid', 'Barcelona', 'Valencia', 'Seville'],
  FR: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
  GB: ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
  ID: ['Jakarta', 'Surabaya', 'Bandung', 'Medan'],
  IN: ['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai'],
  IT: ['Rome', 'Milan', 'Naples', 'Turin'],
  JP: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Fukuoka'],
  KR: ['Seoul', 'Busan', 'Incheon', 'Daejeon'],
  MX: ['Mexico City', 'Guadalajara', 'Monterrey'],
  MY: ['Kuala Lumpur', 'George Town', 'Johor Bahru'],
  NG: ['Lagos', 'Abuja', 'Kano'],
  NZ: ['Auckland', 'Wellington', 'Christchurch'],
  PH: ['Manila', 'Quezon City', 'Cebu City', 'Davao City', 'Baguio'],
  SG: ['Singapore'],
  TH: ['Bangkok', 'Chiang Mai', 'Phuket'],
  TR: ['Istanbul', 'Ankara', 'Izmir'],
  TW: ['Taipei', 'Kaohsiung', 'Taichung'],
  US: ['New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Seattle', 'Austin', 'Boston'],
  VN: ['Ho Chi Minh City', 'Hanoi', 'Da Nang'],
  ZA: ['Johannesburg', 'Cape Town', 'Pretoria', 'Durban'],
}

function ReactionCard({ config, isSelected, onClick }) {
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
          src={config.gif}
          alt={config.label}
          className={`reaction-gif-img ${isActive ? 'playing' : 'paused-thumb'}`}
        />
      </div>
      <span className="reaction-label">{config.label}</span>
    </button>
  )
}

export default function Assessment({ questions = defaultQuestions, assessmentState, onUpdateState, onComplete, onReset }) {
  const { t, i18n } = useTranslation()

  // Location Step state if location is not set yet
  const [locStep, setLocStep] = useState(1)
  const [locQuery, setLocQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)

  const hasLocation = Boolean(assessmentState?.location?.country)

  const countryNames = useMemo(() => {
    const displayNames = new Intl.DisplayNames([i18n.language], { type: 'region' })
    return Object.entries(countries)
      .map(([isoCode, item]) => ({
        ...item,
        isoCode,
        flag: getEmojiFlag(isoCode),
        displayName: displayNames.of(isoCode) || item.name,
      }))
      .sort((left, right) => left.displayName.localeCompare(right.displayName, i18n.language))
  }, [i18n.language])

  const cities = useMemo(() => {
    if (!selectedCountry) return []
    return [...new Set([...(MAJOR_CITIES[selectedCountry.isoCode] || []), selectedCountry.capital].filter(Boolean))].map((name) => ({ name }))
  }, [selectedCountry])

  const filteredCountries = useMemo(() => {
    const normalized = locQuery.trim().toLocaleLowerCase(i18n.language)
    if (!normalized) return countryNames
    return countryNames.filter((item) =>
      item.displayName.toLocaleLowerCase(i18n.language).includes(normalized) ||
      item.name.toLocaleLowerCase(i18n.language).includes(normalized) ||
      item.isoCode.toLocaleLowerCase(i18n.language).includes(normalized)
    )
  }, [countryNames, i18n.language, locQuery])

  const confirmLocation = (cityObj = selectedCity) => {
    const newLocation = {
      country: selectedCountry.name,
      city: cityObj?.isRegion ? '' : cityObj?.name || '',
      ...(cityObj?.isRegion ? { region: cityObj.name } : {}),
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
  const currentIndex = assessmentState?.currentQuestionIndex || 0
  const question = getLocalizedQuestion(questions[currentIndex] || questions[0], i18n.language)
  const response = assessmentState?.responses?.find(({ questionId }) => questionId === question.id)
  const progress = ((currentIndex + 1) / questions.length) * 100

  const selectOption = (option, timestamp) => {
    const selected = question[option]
    const nextResponse = {
      questionId: question.id,
      selectedCode: selected.code,
      rating: response?.selectedCode === selected.code ? response.rating : null,
      timestamp,
    }
    onUpdateState({ ...assessmentState, responses: upsertResponse(assessmentState.responses || [], nextResponse) })
  }

  const selectRating = (rating, timestamp) => {
    if (!response) return
    onUpdateState({
      ...assessmentState,
      responses: upsertResponse(assessmentState.responses || [], { ...response, rating, timestamp }),
    })
  }

  const moveBack = () => {
    if (currentIndex === 0) return
    onUpdateState({ ...assessmentState, currentQuestionIndex: currentIndex - 1 })
  }

  const moveNext = () => {
    if (!response?.rating) return
    if (currentIndex === questions.length - 1) {
      onComplete({ ...assessmentState, isCompleted: true })
      return
    }
    onUpdateState({ ...assessmentState, currentQuestionIndex: currentIndex + 1 })
  }

  useEffect(() => {
    if (!hasLocation) return undefined
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

  // STEP 0: Render Page-Based Location Selection (No Modal!)
  if (!hasLocation) {
    return (
      <section className="location-page-wrap section-wrap max-w-2xl mx-auto py-12 px-4">
        <motion.div
          className="location-card bg-white border border-slate-200 rounded-3xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 text-blue-600 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin size={16} />
            <span>Step {locStep} of 2</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            {locStep === 1 ? 'Where are you building your future?' : `Select your city in ${selectedCountry?.displayName}`}
          </h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {locStep === 1
              ? 'Choose a country first. We use it only to localize careers, salaries, and learning paths.'
              : 'Pick your nearest city or region for targeted local university and scholarship matches.'}
          </p>

          {locStep === 1 && (
            <>
              <div className="relative mb-4">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                  placeholder="Search countries..."
                  value={locQuery}
                  onChange={(e) => setLocQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="country-scroll-list max-h-72 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                {filteredCountries.map((item) => {
                  const isSelected = selectedCountry?.isoCode === item.isoCode
                  return (
                    <button
                      key={item.isoCode}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(item)
                        setLocStep(2)
                        setLocQuery('')
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                        isSelected ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.flag}</span>
                        <span>{item.displayName}</span>
                      </div>
                      <span className="text-xs font-mono opacity-70 uppercase">{item.isoCode}</span>
                    </button>
                  )
                })}
                {filteredCountries.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    No country found matching "{locQuery}"
                  </div>
                )}
              </div>
            </>
          )}

          {locStep === 2 && (
            <div className="space-y-4">
              <div className="country-preview-pill flex items-center gap-3 p-3.5 bg-slate-100 rounded-2xl">
                <span className="text-2xl">{selectedCountry?.flag}</span>
                <span className="font-semibold text-slate-800 text-sm">{selectedCountry?.displayName}</span>
              </div>

              <div className="cities-grid grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                {cities.map((c) => {
                  const isSelected = selectedCity?.name === c.name
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedCity(c)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                        isSelected ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-400 text-slate-700'
                      }`}
                    >
                      <span>{c.name}</span>
                      {isSelected && <Check size={16} className="text-blue-600" />}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setLocStep(1); setLocQuery(''); }}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => confirmLocation(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Skip City
                  </button>

                  <button
                    type="button"
                    onClick={() => confirmLocation(selectedCity)}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all"
                  >
                    Start Assessment
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </section>
    )
  }

  // 30-Question Assessment Screen (KursoKo Style)
  return (
    <section className="assessment section-wrap max-w-4xl mx-auto py-8 px-4">
      {/* Header Progress */}
      <div className="flex items-center justify-between text-sm font-semibold text-slate-600 mb-2">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>

      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full bg-blue-600 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          className="question-container"
          key={question.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Which would you rather do?</h1>
            <p className="text-sm text-slate-500">Pick one activity and rate how much you'd enjoy it.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-10">
            {['optionA', 'optionB'].map((optionKey, idx) => {
              const opt = question[optionKey]
              const isSelected = response?.selectedCode === opt.code
              return (
                <div
                  key={optionKey}
                  onClick={(e) => selectOption(optionKey, e.timeStamp)}
                  className={`choice-card-wrap border-2 rounded-3xl p-6 bg-white transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected ? 'border-blue-600 shadow-xl bg-blue-50/20' : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100 flex items-center justify-center">
                      <img
                        src={optionImage(question.id, idx === 0 ? 'a' : 'b')}
                        alt={opt.text}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base mb-1">{opt.text}</h3>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-600 mb-4">
                      {opt.code} · {t(`dimensions.${opt.code}.name`)}
                    </span>
                  </div>

                  {/* Reaction GIF Options */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                    {REACTION_CONFIG.map((cfg) => (
                      <ReactionCard
                        key={cfg.value}
                        config={cfg}
                        isSelected={isSelected && response?.rating === cfg.value}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isSelected) selectOption(optionKey, e.timeStamp)
                          selectRating(cfg.value, e.timeStamp)
                        }}
                      />
                    ))}
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
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft size={16} /> Previous
            </button>

            <button
              type="button"
              onClick={moveNext}
              disabled={!response?.rating}
              className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
