import { useTranslation } from 'react-i18next'
import { RIASEC_CODES } from '@/utils/riasecScoring.js'
import { dimensionImage } from './dimensionAssets.js'

export default function DimensionGrid({ activeIndex, onSelect }) {
  const { t } = useTranslation()

  return (
    <div
      className="dimension-grid"
      role="tablist"
      aria-label={t('dimensions.carouselLabel')}
    >
      {RIASEC_CODES.map((code, index) => {
        const isActive = index === activeIndex
        const thumb = dimensionImage(code)

        return (
          <button
            key={code}
            type="button"
            role="tab"
            id={`dimension-tab-${code}`}
            aria-selected={isActive}
            aria-controls="dimension-detail-panel"
            className={`dimension-grid-item dimension-${code.toLowerCase()}${isActive ? ' is-active' : ''}`}
            onClick={() => onSelect(index)}
          >
            <div className="dimension-grid-media">
              {thumb && <img src={thumb} alt="" loading="lazy" />}
            </div>
            <span className="dimension-grid-name">{t(`dimensions.${code}.name`)}</span>
          </button>
        )
      })}
    </div>
  )
}
