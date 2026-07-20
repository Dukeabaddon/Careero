import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../i18n.js'

export default function LanguageSelector({ onLanguageChange, compact = false }) {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0]

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectLanguage = (code) => {
    i18n.changeLanguage(code)
    onLanguageChange?.(code)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={`custom-language-control ${compact ? 'compact' : ''}`} ref={dropdownRef}>
      <button
        type="button"
        className="language-trigger-pill px-3.5 h-9.5 flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 shadow-sm text-xs font-semibold text-slate-700 hover:border-blue-500 hover:bg-slate-50 transition-all cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={t('nav.language')}
        data-testid="language-dropdown"
      >
        <span className="flag-icon text-sm">{currentLang.flag}</span>
        <span className="lang-name">{currentLang.short}</span>
        <ChevronDown size={13} className={`chevron transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
      </button>

      {isOpen && (
        <div className="language-menu" data-lenis-prevent>
          <div className="language-search">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder={t('nav.searchLanguage')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <div className="language-options-list">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`language-option ${lang.code === currentLang.code ? 'active' : ''}`}
                  onClick={() => selectLanguage(lang.code)}
                >
                  <span className="flag-icon">{lang.flag}</span>
                  <span className="lang-full-name">{lang.name}</span>
                  <span className="lang-code-badge">{lang.code.toUpperCase()}</span>
                </button>
              ))
            ) : (
              <div className="no-lang-found">{t('nav.noLanguageFound')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
