import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useScrollNavbar } from '../hooks/useScrollNavbar.js'
import LanguageSelector from './LanguageSelector.jsx'

export default function Navbar({ onLanguageChange, onStart, compact, onGoHome }) {
  const { t } = useTranslation()
  const { mode } = useScrollNavbar()

  if (compact) {
    return (
      <header className="navbar navbar-compact">
        <button
          type="button"
          onClick={onGoHome}
          className="quiz-nav-home flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
          data-testid="back-to-home-btn"
        >
          <ChevronLeft size={18} />
          <span>{t('nav.home')}</span>
        </button>

        <div className="quiz-nav-brand flex items-center gap-3">
          <a className="brand flex items-center gap-1" href="/" onClick={(e) => { e.preventDefault(); onGoHome(); }} aria-label="Careero home">
            <img src="/logo.png" alt="" aria-hidden="true" className="brand-logo-img" width="36" height="36" />
            <span className="brand-text font-bold text-slate-900 text-lg">Careero</span>
          </a>
          <LanguageSelector onLanguageChange={onLanguageChange} compact />
        </div>
      </header>
    )
  }

  return (
    <header className={`navbar nav-mode-${mode}`}>
      <a className="brand" href="/" aria-label="Careero home">
        <img src="/logo.png" alt="" aria-hidden="true" className="brand-logo-img" width="48" height="48" />
        <span className="brand-text">Careero</span>
      </a>

      <nav className="nav-links-center hidden md:flex items-center gap-7">
        <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">{t('nav.howItWorks')}</a>
        <a href="#dimensions" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">{t('nav.dimensions')}</a>
        <a href="#faq" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">{t('nav.faq')}</a>
      </nav>

      <div className="nav-actions flex items-center gap-3">
        <button
          type="button"
          className="nav-start-btn"
          onClick={onStart}
          data-testid="nav-start-assessment-btn"
        >
          {t('nav.startAssessment')}
        </button>

        <LanguageSelector onLanguageChange={onLanguageChange} />
      </div>
    </header>
  )
}
