import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, MapPin, Search, Building2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Country, City } from 'country-state-city'
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

const REACTION_CONFIG = [
  { value: 1, key: 'okay', label: 'Just Okay', gif: '/reactions/just-okay.gif' },
  { value: 2, key: 'like', label: 'Great!', gif: '/reactions/wow.gif' },
  { value: 3, key: 'love', label: 'Love It!', gif: '/reactions/love-it.gif' },
]

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

export default function Assessment({ questions = defaultQuestions, assessmentState, onUpdateState, onComplete, onReset: _onReset }) {
  const { i18n } = useTranslation()

  // Location Step state if location is not set yet
  const [locStep, setLocStep] = useState(1)
  const [countrySearch, setCountrySearch] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const [customCityInput, setCustomCityInput] = useState('')

  const hasLocation = Boolean(assessmentState?.location?.country)

  // Load 250 Worldwide Countries using country-state-city library
  const allCountries = useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      isoCode: c.isoCode,
      name: c.name,
      flag: c.flag || '🌐',
    })).sort((a, b) => a.name.localeCompare(b.name, i18n.language))
  }, [i18n.language])

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase()
    if (!q) return allCountries
    return allCountries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.isoCode.toLowerCase().includes(q)
    )
  }, [allCountries, countrySearch])

  // Load cities for selected country using country-state-city library
  const allCities = useMemo(() => {
    if (!selectedCountry) return []
    const rawCities = City.getCitiesOfCountry(selectedCountry.isoCode) || []
    const unique = [...new Set(rawCities.map((c) => c.name))]
    return unique.sort((a, b) => a.localeCompare(b, i18n.language))
  }, [selectedCountry, i18n.language])

  // Filter cities by search query
  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase()
    if (!q) return allCities.slice(0, 100)
    return allCities.filter((c) => c.toLowerCase().includes(q)).slice(0, 100)
  }, [allCities, citySearch])

  const confirmLocation = (chosenCityName) => {
    if (!selectedCountry) return
    const finalCity = chosenCityName || customCityInput.trim() || ''
    const newLocation = {
      country: selectedCountry.name,
      city: finalCity,
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
    if (currentIndex === questionsList.length - 1) {
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

  // STEP 0: Render Page-Based Location Requirement View (No Modal!)
  if (!hasLocation) {
    return (
      <section className="location-page-wrap section-wrap max-w-2xl mx-auto py-10 px-4">
        <motion.div
          className="location-card bg-white border border-slate-200 rounded-3xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 text-blue-600 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin size={16} />
            <span>Required Location Setup · Step {locStep} of 2</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            {locStep === 1 ? 'Where are you building your future?' : `Select your city in ${selectedCountry?.name}`}
          </h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {locStep === 1
              ? 'Select your country first (Required). We use this to localize career matches, university suggestions, and regional salary projections.'
              : 'Pick your city or region (Optional). This helps prioritize local university campuses and regional scholarships first.'}
          </p>

          {locStep === 1 && (
            <>
              <div className="relative mb-4">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                  placeholder="Search 250+ countries (e.g. Philippines, Japan, United States)..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="country-scroll-list max-h-72 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-2xl p-2 bg-slate-50/50 mb-6">
                {filteredCountries.map((c) => {
                  const isSelected = selectedCountry?.isoCode === c.isoCode
                  return (
                    <button
                      key={c.isoCode}
                      type="button"
                      onClick={() => setSelectedCountry(c)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all text-left border ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/90 text-blue-900 shadow-sm font-bold'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.flag}</span>
                        <span>{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">{c.isoCode}</span>
                        {isSelected && <Check size={16} className="text-blue-600" />}
                      </div>
                    </button>
                  )
                })}

                {filteredCountries.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No country found matching "{countrySearch}". You can select any listed country above.
                  </div>
                )}
              </div>

              {/* Continue Button: Grayed out / disabled until country is selected */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-200">
                <button
                  type="button"
                  disabled={!selectedCountry}
                  onClick={() => setLocStep(2)}
                  className={`w-full sm:w-auto px-8 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    selectedCountry
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer'
                      : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                  }`}
                >
                  <span>Continue to City Selection</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {locStep === 2 && (
            <div className="space-y-5">
              <div className="country-preview-pill flex items-center justify-between p-4 bg-blue-50/60 border border-blue-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedCountry?.flag}</span>
                  <div>
                    <span className="text-xs text-blue-600 font-bold uppercase tracking-wider block">Selected Country</span>
                    <span className="font-bold text-slate-900 text-base">{selectedCountry?.name}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLocStep(1)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Change
                </button>
              </div>

              <div className="relative">
                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                  placeholder={`Search or type city in ${selectedCountry?.name}...`}
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value)
                    setCustomCityInput(e.target.value)
                  }}
                  autoFocus
                />
              </div>

              {allCities.length > 0 ? (
                <div className="cities-grid grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
                  {filteredCities.map((cityName) => {
                    const isSelected = selectedCity === cityName
                    return (
                      <button
                        key={cityName}
                        type="button"
                        onClick={() => {
                          setSelectedCity(cityName)
                          setCustomCityInput(cityName)
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white font-bold' : 'border-slate-200 bg-white hover:border-blue-400 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{cityName}</span>
                        {isSelected && <Check size={14} className="text-white shrink-0 ml-1" />}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No pre-listed cities found. Type your city or region name above, or skip to use country-wide recommendations.</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setLocStep(1)}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => confirmLocation('')}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Skip City (Country Only)
                  </button>

                  <button
                    type="button"
                    onClick={() => confirmLocation(selectedCity || customCityInput)}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>Start Assessment</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </section>
    )
  }

  // STEP 1-30: Render 30-Question RIASEC Assessment Screen
  return (
    <section className="assessment section-wrap max-w-4xl mx-auto py-8 px-4">
      {/* Header Progress */}
      <div className="flex items-center justify-between text-sm font-semibold text-slate-600 mb-2">
        <span>Question {currentIndex + 1} of {questionsList.length}</span>
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
          key={question?.id || currentIndex}
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
              const opt = question?.[optionKey] || {}
              const isSelected = response?.selectedCode === opt.code
              return (
                <div
                  key={optionKey}
                  className="choice-card-wrap border-2 rounded-3xl p-6 bg-white transition-all flex flex-col justify-between border-slate-200"
                >
                  <div
                    onClick={(e) => selectOption(optionKey, e.timeStamp)}
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
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 hover:font-bold hover:border-slate-400 flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft size={16} /> Previous
            </button>

            <button
              type="button"
              onClick={moveNext}
              disabled={!response?.rating}
              className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-extrabold shadow-md flex items-center gap-1.5 transition-all"
            >
              <span className="text-white font-extrabold">Next</span>
              <ArrowRight size={16} className="text-white" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
