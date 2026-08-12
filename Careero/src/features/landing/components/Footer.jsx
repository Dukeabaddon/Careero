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
    <footer className="mt-12 border-t border-slate-200/80 bg-gradient-to-b from-slate-100/45 to-white py-12 md:py-14">
      <div className="section-wrap flex flex-col gap-7">
        <div className="grid items-start gap-7 text-center md:grid-cols-[minmax(220px,1.2fr)_minmax(180px,1fr)_auto] md:text-left">
          <div>
            <div className="brand inline-flex items-center gap-0">
              <img src="/logo.png" alt="" aria-hidden="true" className="brand-logo-img" width="32" height="32" />
              <span className="brand-text">Careero</span>
            </div>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600 md:mx-0">{t('footer.tagline')}</p>
          </div>

          <nav className="grid grid-cols-2 justify-items-center gap-2.5 gap-x-4 md:justify-items-start" aria-label="Footer">
            {FOOTER_LINK_KEYS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-bold text-slate-900 transition-colors hover:text-blue-600">
                {t(`footer.${link.key}`)}
              </a>
            ))}
          </nav>

          <button
            className="mx-auto min-h-11 self-start rounded-full border border-blue-600/45 bg-blue-600 px-5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(37,99,235,0.2)] transition hover:bg-blue-700 md:mx-0 md:justify-self-end"
            type="button"
            onClick={onStart}
          >
            {t('footer.startAssessment')}
          </button>
        </div>

        <div className="border-t border-slate-200/80 pt-4 text-center md:text-left">
          <p className="m-0 text-sm text-slate-600">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
