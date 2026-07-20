import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, MapPin, Search, X } from 'lucide-react'
import { countries, getEmojiFlag } from 'countries-list'
import { useTranslation } from 'react-i18next'

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
  AQ: ['McMurdo Station'],
}

export default function LocationModal({ open, onClose, onConfirm }) {
  const { t, i18n } = useTranslation()
  const [step, setStep] = useState(1)
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState(null)
  const [city, setCity] = useState(null)
  const modalRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const handleDialogKeys = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !modalRef.current) return
      const focusable = [...modalRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), [href]')]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleDialogKeys)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', handleDialogKeys)
      document.body.classList.remove('modal-open')
    }
  }, [open, onClose])

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
    if (!country) return []
    return [...new Set([...(MAJOR_CITIES[country.isoCode] || []), country.capital].filter(Boolean))].map((name) => ({ name }))
  }, [country])

  const items = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(i18n.language)
    const source = step === 1 ? countryNames : cities
    if (!normalized) return source.slice(0, 80)
    return source
      .filter((item) => (item.displayName || item.name).toLocaleLowerCase(i18n.language).includes(normalized))
      .slice(0, 80)
  }, [cities, countryNames, i18n.language, query, step])

  const selectCountry = (nextCountry) => {
    setCountry(nextCountry)
    setCity(null)
    setStep(2)
    setQuery('')
  }

  const moveListFocus = (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    const options = [...(listRef.current?.querySelectorAll('[role="option"]') || [])]
    if (!options.length) return
    event.preventDefault()
    const current = options.indexOf(document.activeElement)
    const next = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? options.length - 1
        : event.key === 'ArrowDown'
          ? Math.min(current + 1, options.length - 1)
          : Math.max(current - 1, 0)
    options[next < 0 ? 0 : next].focus()
  }

  const confirmLocation = (selectedCity = city) => onConfirm({
    country: country.name,
    city: selectedCity?.isRegion ? '' : selectedCity?.name || '',
    ...(selectedCity?.isRegion ? { region: selectedCity.name } : {}),
  })

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.section
            className="location-modal"
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-title"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button className="modal-close" type="button" onClick={onClose} aria-label={t('location.close')}><X /></button>
            <p className="eyebrow"><MapPin size={14} /> {t('location.step', { step })}</p>
            <h2 id="location-title">{t(step === 1 ? 'location.titleCountry' : 'location.titleCity')}</h2>
            <p className="modal-description">
              {step === 1
                ? t('location.descriptionCountry')
                : t('location.descriptionCity', { country: country.displayName })}
            </p>
            <label className="search-field">
              <Search size={18} />
              <span className="sr-only">{t(step === 1 ? 'location.searchCountry' : 'location.searchCity')}</span>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={moveListFocus}
                placeholder={t(step === 1 ? 'location.searchCountry' : 'location.searchCity')}
              />
            </label>
            <div ref={listRef} className="location-list" role="listbox" onKeyDown={moveListFocus} aria-label={step === 1 ? t('location.searchCountry') : t('location.searchCity')}>
              {items.map((item) => {
                const selected = step === 1 ? country?.isoCode === item.isoCode : city?.name === item.name
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={selected ? 'selected' : ''}
                    key={step === 1 ? item.isoCode : `${item.name}-${item.latitude}-${item.longitude}`}
                    onClick={() => (step === 1 ? selectCountry(item) : setCity(item))}
                    data-testid={step === 1 ? 'country-option' : 'city-option'}
                  >
                    <span>{step === 1 ? item.flag : '•'}</span>
                    <strong>{item.displayName || item.name}</strong>
                    {selected && <Check size={17} />}
                  </button>
                )
              })}
              {step === 2 && query.trim() && !items.some((item) => item.name.toLocaleLowerCase(i18n.language) === query.trim().toLocaleLowerCase(i18n.language)) && (
                <button type="button" role="option" aria-selected={city?.name === query.trim()} onClick={() => setCity({ name: query.trim(), isRegion: true })}>
                  <span>+</span><strong>{t('location.useRegion', { region: query.trim() })}</strong>
                  {city?.name === query.trim() && <Check size={17} />}
                </button>
              )}
              {items.length === 0 && <p className="empty-state">{t('location.noResults')}</p>}
            </div>
            <div className="modal-actions">
              {step === 2 && (
                <button className="text-button" type="button" onClick={() => { setStep(1); setQuery('') }}>
                  <ArrowLeft size={17} /> {t('location.back')}
                </button>
              )}
              {step === 2 && city && (
                <button
                  className="primary-button"
                  type="button"
                  data-testid="confirm-location-btn"
                  onClick={() => confirmLocation()}
                >
                  {t('location.confirm', { city: city.name, country: country.displayName })}
                </button>
              )}
              {step === 2 && !city && (
                <button className="secondary-button" type="button" onClick={() => confirmLocation(null)}>
                  {t('location.skipCity', { country: country.displayName })}
                </button>
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
