import { Languages, Orbit, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../i18n.js'

export default function Navbar({ onClearData, onLanguageChange }) {
  const { t, i18n } = useTranslation()

  return (
    <header className="navbar">
      <a className="brand" href="/" aria-label="Careero home">
        <span className="brand-mark"><Orbit size={21} /></span>
        <span>
          <strong>Careero</strong>
          <small>{t('brand.tagline')}</small>
        </span>
      </a>
      <div className="nav-actions">
        <button className="icon-button clear-data" type="button" onClick={onClearData} title={t('nav.clearData')}>
          <Trash2 size={17} />
          <span>{t('nav.clearData')}</span>
        </button>
        <label className="language-control">
          <Languages size={17} aria-hidden="true" />
          <span className="sr-only">{t('nav.language')}</span>
          <select
            value={i18n.language}
            onChange={(event) => onLanguageChange(event.target.value)}
            data-testid="language-dropdown"
            aria-label={t('nav.language')}
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <option key={language.code} value={language.code} data-testid={`lang-option-${language.code}`}>
                {language.short}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  )
}
