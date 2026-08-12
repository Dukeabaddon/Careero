import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { RIASEC_CODES } from '../../../utils/riasecScoring.js'
import { scrollRevealProps } from '../shared/scrollReveal.js'
import { sectionHeadingClass, sectionSubtitleClass, sectionTitleClass } from '../shared/sectionHeading.js'
import './DimensionsSection.css'

const dimensionAssets = import.meta.glob('../../../assets/riasec/riasec_*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

function dimensionImage(code) {
  const suffix = `riasec_${code.toLowerCase()}.webp`
  return Object.entries(dimensionAssets).find(([path]) => path.endsWith(suffix))?.[1]
}

export default function DimensionsSection() {
  const { t } = useTranslation()

  return (
    <section className="dimensions section-wrap relative pb-28 z-0" id="dimensions">
      <div className={sectionHeadingClass}>
        <h2 className={sectionTitleClass}>{t('dimensions.title')}</h2>
        <p className={sectionSubtitleClass}>{t('dimensions.subtitle')}</p>
      </div>

      <motion.div className="dimension-grid relative z-20" {...scrollRevealProps}>
        {RIASEC_CODES.map((code, index) => (
          <motion.article
            className={`dimension-card dimension-${code.toLowerCase()}`}
            key={code}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.2, margin: '0px 0px -15% 0px' }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
          >
            <img src={dimensionImage(code)} alt="" loading="lazy" />
            <div>
              <h3>{t(`dimensions.${code}.name`)}</h3>
              <p>{t(`dimensions.${code}.description`)}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>

      <motion.div
        className="dimensions-book-asset"
        initial={{ opacity: 0, y: 60, scale: 0.92 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ amount: 0.2, margin: '0px 0px -15% 0px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <img src="/asset-book.png" alt="" aria-hidden="true" />
      </motion.div>
    </section>
  )
}
