import { useTranslation } from 'react-i18next'

/**
 * Visual share card used for on-screen preview + transparent PNG export.
 * Accent colors come from the resolved RIASEC character theme.
 * Outer border matches results Top Profile card.
 */
export default function ShareCard({
  archetype,
  profile,
  topProfession,
  theme,
  className = '',
}) {
  const { t } = useTranslation()
  const accent = theme?.accent || '#2563eb'
  const accentSoft = theme?.accentSoft || 'rgba(37, 99, 235, 0.12)'
  const paper = theme?.paper || '#ffffff'
  const ink = theme?.ink || '#0f172a'
  const muted = theme?.muted || '#475569'
  const highlight = theme?.highlight || '#fbbf24'

  return (
    <div
      className={`share-card-export ${className}`.trim()}
      style={{
        width: 360,
        boxSizing: 'border-box',
        backgroundColor: paper,
        color: ink,
        ['--share-accent']: accent,
        ['--share-accent-soft']: accentSoft,
        ['--share-highlight']: highlight,
      }}
    >
      <div className="share-card-export__hero">
        <div className="share-card-export__portrait" style={{ ['--share-accent']: accent, ['--share-accent-soft']: accentSoft }}>
          {archetype.image ? (
            <img src={archetype.image} alt="" />
          ) : null}
        </div>

        <p className="share-card-export__brand">Careero</p>
        <h3 style={{ color: accent }}>{archetype.title}</h3>
        <p className="share-card-export__code" style={{ color: muted }}>
          RIASEC {profile.archetypeCode}
        </p>
      </div>

      {topProfession ? (
        <div className="share-card-export__match" style={{ backgroundColor: accent }}>
          <p className="share-card-export__match-label">{t('results.shareCardTopFit')}</p>
          <p className="share-card-export__match-title">{topProfession.title}</p>
          <p className="share-card-export__match-percent" style={{ color: highlight }}>
            {t('results.shareCardMatch', { percent: topProfession.matchPercent })}
          </p>
          <div
            className="share-card-export__bar"
            role="progressbar"
            aria-valuenow={topProfession.matchPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={topProfession.title}
          >
            <i style={{ width: `${topProfession.matchPercent}%`, background: highlight }} />
          </div>
        </div>
      ) : null}

      <p className="share-card-export__summary" style={{ color: muted }}>
        {t('results.shareCardSummary')}
      </p>

      <div className="share-card-export__footer" style={{ backgroundColor: accent }}>
        {t('results.shareCardFooter')}
      </div>
    </div>
  )
}
