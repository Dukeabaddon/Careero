import { useTranslation } from 'react-i18next'

const FOOTER_LINK_KEYS = [
  { href: '#features', key: 'features' },
  { href: '#how-it-works', key: 'howItWorks' },
  { href: '#dimensions', key: 'dimensions' },
  { href: '#faq', key: 'faq' },
]

export default function Footer({ onStart }) {
  const { t } = useTranslation()

  return (
    <footer className="footer-wrap">
      <div className="section-wrap footer-shell">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand">
              <img src="/logo.png" alt="C" className="brand-logo-img" width="32" height="32" />
              <span className="brand-text">areero</span>
            </div>
            <p>{t('footer.tagline')}</p>
          </div>

          <nav className="footer-links" aria-label="Footer">
            {FOOTER_LINK_KEYS.map((link) => (
              <a key={link.href} href={link.href} className="footer-link">
                {t(`footer.${link.key}`)}
              </a>
            ))}
          </nav>

          <button className="footer-cta" type="button" onClick={onStart}>
            {t('footer.startAssessment')}
          </button>
        </div>

        <div className="footer-bottom">
          <p className="copyright">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
