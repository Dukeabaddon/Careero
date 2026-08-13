import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { resolveArchetype } from '@/features/results/utils/archetypeTheme.js'
import { RIASEC_CODES } from '@/utils/riasecScoring.js'
import { scrollRevealProps } from '../shared/scrollReveal.js'
import DimensionGrid from './DimensionGrid.jsx'
import { getExampleCareersForDimension } from './dimensionExamples.js'
import { dimensionDetailImage } from './dimensionDetailImages.js'
import './DimensionsSection.css'

const ROTATE_MS = 3000
const PAUSE_RESUME_MS = 12000
const DETAIL_FADE_MS = 600
const DETAIL_FADE_EASE = [0.42, 0, 0.18, 1]

function detailTransition() {
  if (prefersReducedMotion()) return { duration: 0 }
  return { duration: DETAIL_FADE_MS / 1000, ease: DETAIL_FADE_EASE }
}

function prefersReducedMotion() {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

export default function DimensionsSection() {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const pauseTimerRef = useRef(null)
  const activeCode = RIASEC_CODES[activeIndex]

  const activeArchetype = useMemo(() => resolveArchetype(activeCode), [activeCode])
  const detailImage = useMemo(() => dimensionDetailImage(activeCode), [activeCode])
  const archetypeTitle = t(activeArchetype.titleKey)

  const exampleCareers = useMemo(
    () => getExampleCareersForDimension(activeCode),
    [activeCode],
  )

  const scheduleResume = useCallback(() => {
    if (pauseTimerRef.current) window.clearTimeout(pauseTimerRef.current)
    pauseTimerRef.current = window.setTimeout(() => {
      setPaused(false)
    }, PAUSE_RESUME_MS)
  }, [])

  const handleSelect = useCallback((index) => {
    setActiveIndex(index)
    setPaused(true)
    scheduleResume()
  }, [scheduleResume])

  useEffect(() => {
    if (paused || prefersReducedMotion()) return undefined

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % RIASEC_CODES.length)
    }, ROTATE_MS)

    return () => window.clearInterval(interval)
  }, [paused])

  useEffect(() => {
    for (const code of RIASEC_CODES) {
      const src = dimensionDetailImage(code)
      if (!src) continue
      const img = new Image()
      img.src = src
    }
  }, [])

  useEffect(() => () => {
    if (pauseTimerRef.current) window.clearTimeout(pauseTimerRef.current)
  }, [])

  return (
    <section className="dimensions" id="dimensions">
      <div className="dimensions-shell">
        <div className="dimensions-split-bg" aria-hidden="true" />

        <div className="dimensions-inner section-wrap relative z-10">
        <motion.div
          className="dimension-explorer"
          id="dimension-detail-panel"
          role="tabpanel"
          aria-labelledby={`dimension-tab-${activeCode}`}
          {...scrollRevealProps}
        >
          <header className="dimension-section-heading">
            <h2 className="dimension-section-title">{t('dimensions.title')}</h2>
            <p className="dimension-section-subtitle">{t('dimensions.subtitle')}</p>
          </header>

          <DimensionGrid
            activeIndex={activeIndex}
            onSelect={handleSelect}
          />

          <div className="dimension-detail-panel">
            <div className="dimension-detail-visual">
              <AnimatePresence mode="sync">
                <motion.img
                  key={activeCode}
                  className={`dimension-detail-image dimension-detail-image--${activeCode.toLowerCase()}`}
                  src={detailImage}
                  alt=""
                  loading="eager"
                  decoding="async"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={detailTransition()}
                />
              </AnimatePresence>
            </div>

            <div className="dimension-detail-copy">
              <AnimatePresence mode="sync">
                <motion.div
                  key={activeCode}
                  className="dimension-detail-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={detailTransition()}
                >
                  <p
                    className="dimension-detail-archetype"
                    style={{ color: activeArchetype.stroke }}
                  >
                    {archetypeTitle}
                  </p>
                  <h3 className="dimension-detail-name">{t(`dimensions.${activeCode}.name`)}</h3>
                  <p className="dimension-detail-description">{t(`dimensions.${activeCode}.description`)}</p>
                  <div className="dimension-detail-examples">
                    <p className="dimension-detail-examples-label">{t('dimensions.examplesLabel')}</p>
                    <ul>
                      {exampleCareers.map((title) => (
                        <li key={title}>{title}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  )
}
