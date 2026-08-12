import { ChevronDown, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import ClickSpark from '@/components/ClickSpark.jsx'
import { useLocationPicker } from '@/features/assessment/hooks/useLocationPicker.js'

export default function LocationSetup({ assessmentState, onUpdateState }) {
  const { t, i18n } = useTranslation()
  const {
    countryOpen,
    setCountryOpen,
    cityOpen,
    setCityOpen,
    countryQuery,
    setCountryQuery,
    cityQuery,
    setCityQuery,
    selectedCountry,
    selectedCity,
    countryDropdownRef,
    cityDropdownRef,
    filteredCountries,
    filteredCities,
    pickCountry,
    pickCity,
    confirmLocation,
  } = useLocationPicker({
    language: i18n.language,
    assessmentState,
    onUpdateState,
  })

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
