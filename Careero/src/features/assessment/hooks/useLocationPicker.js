import { useEffect, useMemo, useRef, useState } from 'react'
import { Country, City } from 'country-state-city'

export function useLocationPicker({ language, assessmentState, onUpdateState }) {
  const [countryOpen, setCountryOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [countryQuery, setCountryQuery] = useState('')
  const [cityQuery, setCityQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const countryDropdownRef = useRef(null)
  const cityDropdownRef = useRef(null)

  const regionNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([language], { type: 'region' })
    } catch {
      return null
    }
  }, [language])

  const allCountries = useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      isoCode: c.isoCode,
      name: regionNames?.of(c.isoCode) || c.name,
      flag: c.flag || '🌐',
    })).sort((a, b) => a.name.localeCompare(b.name, language))
  }, [language, regionNames])

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase()
    if (!q) return allCountries
    return allCountries
      .filter((c) => c.name.toLowerCase().includes(q) || c.isoCode.toLowerCase().includes(q))
  }, [allCountries, countryQuery])

  const allCities = useMemo(() => {
    if (!selectedCountry) return []
    const rawCities = City.getCitiesOfCountry(selectedCountry.isoCode) || []
    const unique = [...new Set(rawCities.map((c) => c.name))]
    return unique.sort((a, b) => a.localeCompare(b, language))
  }, [selectedCountry, language])

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
    onUpdateState({
      version: 1,
      location: newLocation,
      language,
      currentQuestionIndex: 0,
      responses: assessmentState?.responses || [],
      isCompleted: false,
    })
  }

  return {
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
  }
}
