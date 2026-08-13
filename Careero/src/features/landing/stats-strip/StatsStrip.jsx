import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CAREER_COUNT } from '../../../data/careers.js'
import { CompassStatIcon, EngineerStatIcon, UnlockStatIcon } from './StatFeatureIcons.jsx'
import { scrollRevealProps } from '../shared/scrollReveal.js'
import { sectionSubtitleClass, sectionTitleClass } from '../shared/sectionHeading.js'
import './StatsStrip.css'

export default function StatsStrip() {
  const { t } = useTranslation()

  return (
    <section className="stats-showcase" id="features">
      <div className="stats-showcase-shell">
        <div className="stats-showcase-heading section-wrap">
          <h2 className={sectionTitleClass}>{t('stats.title')}</h2>
          <p className={sectionSubtitleClass}>{t('stats.subtitle')}</p>
        </div>

        <div
          className="stats-showcase-grid section-wrap"
          role="group"
          aria-label={t('stats.groupLabel')}
        >
          <motion.article className="stats-feature-card" tabIndex={0} {...scrollRevealProps}>
            <div className="stats-feature-head">
              <p className="stats-feature-value">{CAREER_COUNT}</p>
              <EngineerStatIcon />
            </div>
            <p className="stats-feature-label">{t('stats.occupations.label')}</p>
            <p className="stats-feature-copy">{t('stats.occupations.description')}</p>
          </motion.article>

          <motion.article className="stats-feature-card" tabIndex={0} {...scrollRevealProps}>
            <div className="stats-feature-head">
              <p className="stats-feature-value">{t('stats.dimensions.value')}</p>
              <CompassStatIcon />
            </div>
            <p className="stats-feature-label">{t('stats.dimensions.label')}</p>
            <p className="stats-feature-copy">{t('stats.dimensions.description')}</p>
          </motion.article>

          <motion.article className="stats-feature-card" tabIndex={0} {...scrollRevealProps}>
            <div className="stats-feature-head">
              <p className="stats-feature-value">{t('stats.free.value')}</p>
              <UnlockStatIcon />
            </div>
            <p className="stats-feature-label">{t('stats.free.label')}</p>
            <p className="stats-feature-copy">{t('stats.free.description')}</p>
          </motion.article>
        </div>
      </div>
    </section>
  )
}
