import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../i18n.js'
import { useScrollNavbar, NAV_MODES } from '../hooks/useScrollNavbar.js'

export default function Navbar({ onLanguageChange, onStart }) {
  const { i18n } = useTranslation()
  const { mode } = useScrollNavbar()
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

  return (
    <header className={`navbar nav-mode-${mode}`}>
      <a className="brand" href="/" aria-label="Careero home">
        <img src="/logo.png" alt="C" className="brand-logo-img" width="48" height="48" />
        <span className="brand-text">areero</span>
      </a>

      {/* Centered Navlinks */}
      <nav className="nav-links-center hidden md:flex items-center gap-7">
        <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">How It Works</a>
        <a href="#dimensions" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Dimensions</a>
        <a href="#faq" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">FAQ</a>
      </nav>

      {/* Language Selector + Start Assessment Button */}
      <div className="nav-actions flex items-center gap-3">
        <div className="custom-language-control" ref={dropdownRef}>
          <button
            type="button"
            className="language-trigger-pill px-3.5 h-9.5 flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 shadow-sm text-xs font-semibold text-slate-700 hover:border-blue-500 hover:bg-slate-50 transition-all cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            data-testid="language-dropdown"
          >
            <span className="flag-icon text-sm">{currentLang.flag}</span>
            <span className="lang-name">{currentLang.short}</span>
            <ChevronDown size={13} className={`chevron transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
          </button>

          {isOpen && (
            <div className="language-menu">
              <div className="language-search">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search language..."
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
                      onClick={() => {
                        i18n.changeLanguage(lang.code)
                        if (onLanguageChange) onLanguageChange(lang.code)
                        setIsOpen(false)
                        setSearchTerm('')
                      }}
                    >
                      <span className="flag-icon">{lang.flag}</span>
                      <span className="lang-full-name">{lang.name}</span>
                      <span className="lang-code-badge">{lang.code.toUpperCase()}</span>
                    </button>
                  ))
                ) : (
                  <div className="no-lang-found">No language found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Start Assessment Button with 1.2s smooth color transition */}
        <button
          type="button"
          className="nav-start-btn"
          onClick={onStart}
          data-testid="nav-start-assessment-btn"
        >
          Start Assessment
        </button>
      </div>
    </header>
  )
}
