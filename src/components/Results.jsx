import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  Award,
  BookOpen,
  ChevronDown,
  ExternalLink,
  MapPin,
  RefreshCcw,
  RotateCcw,
  Share2,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CAREER_VECTORS } from '../data/careers.js'
import { buildProfessionTags, coverageTag, rankCareerMatches, RIASEC_CODES } from '../utils/riasecScoring.js'
import { getRecommendations } from '../services/recommendations.js'
import RadarChart from './RadarChart.jsx'
import ShareResultModal from './ShareResultModal.jsx'
import ClickSpark from './ClickSpark.jsx'

const archetypeAssets = import.meta.glob('../assets/riasec/archetype_*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

const archetypes = {
  RI: ['pathfinder', '#f59e0b', 'rgba(245, 158, 11, 0.14)'],
  IR: ['pathfinder', '#f59e0b', 'rgba(245, 158, 11, 0.14)'],
  AS: ['creator', '#ec4899', 'rgba(236, 72, 153, 0.14)'],
  SA: ['creator', '#ec4899', 'rgba(236, 72, 153, 0.14)'],
  EC: ['strategist', '#7c3aed', 'rgba(124, 58, 237, 0.14)'],
  CE: ['strategist', '#7c3aed', 'rgba(124, 58, 237, 0.14)'],
  CI: ['visionary', '#0ea5e9', 'rgba(14, 165, 233, 0.14)', 'analyst'],
  IC: ['visionary', '#0ea5e9', 'rgba(14, 165, 233, 0.14)', 'analyst'],
  IA: ['visionary', '#0ea5e9', 'rgba(14, 165, 233, 0.14)'],
  AI: ['visionary', '#0ea5e9', 'rgba(14, 165, 233, 0.14)'],
  RC: ['builder', '#ea580c', 'rgba(234, 88, 12, 0.16)'],
  CR: ['builder', '#ea580c', 'rgba(234, 88, 12, 0.16)'],
  SE: ['guardian', '#059669', 'rgba(5, 150, 105, 0.14)'],
  ES: ['guardian', '#059669', 'rgba(5, 150, 105, 0.14)'],
}

const primaryFallback = {
  R: ['pathfinder', '#f59e0b', 'rgba(245, 158, 11, 0.14)'],
  I: ['visionary', '#0ea5e9', 'rgba(14, 165, 233, 0.14)'],
  A: ['creator', '#ec4899', 'rgba(236, 72, 153, 0.14)'],
  S: ['guardian', '#059669', 'rgba(5, 150, 105, 0.14)'],
  E: ['strategist', '#7c3aed', 'rgba(124, 58, 237, 0.14)'],
  C: ['builder', '#ea580c', 'rgba(234, 88, 12, 0.16)'],
}

function resolveArchetype(code) {
  const direct = archetypes[code] || archetypes[code.split('').reverse().join('')]
  const [asset, stroke, fill, title = asset] = direct || primaryFallback[code[0]]
  const image = Object.entries(archetypeAssets).find(([path]) => path.endsWith(`archetype_${asset}.webp`))?.[1]
  return { asset, titleKey: `results.archetypes.${title}`, image, stroke, fill }
}

function formatProfessionTag(tag, t) {
  if (tag.type === 'alignment') {
    return t('results.tagAlignment', { dimension: t(`dimensions.${tag.code}.name`) })
  }
  if (tag.type === 'campus') {
    return t('results.tagCampusFit', { dimension: t(`dimensions.${tag.code}.name`) })
  }
  if (tag.type === 'keywords') {
    return tag.count === 1
      ? t('results.tagKeywordsOne')
      : t('results.tagKeywords', { count: tag.count })
  }
  if (tag.type === 'flagship') return t('results.tagFlagship')
  if (tag.type === 'systems') return t('results.tagSystemsFit')
  return ''
}

function safeHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

function matchTone(percent) {
  if (percent >= 85) return 'top'
  if (percent >= 80) return 'strong'
  return 'good'
}

/** Rank accent: #1 blue, then RIASEC character colors cycling. */
const RANK_ACCENTS = [
  '#2563eb',
  '#0ea5e9',
  '#f59e0b',
  '#ec4899',
  '#059669',
  '#7c3aed',
  '#ea580c',
  '#0284c7',
  '#d97706',
  '#db2777',
]

export default function Results({ profile, onRetake }) {
  const { t } = useTranslation()
  const [expandedId, setExpandedId] = useState(null)
  const [insightByProfession, setInsightByProfession] = useState({})
  const [loadingId, setLoadingId] = useState(null)
  const [errorByProfession, setErrorByProfession] = useState({})
  const [shareOpen, setShareOpen] = useState(false)

  const localMatches = useMemo(
    () => rankCareerMatches(profile.normalizedScores, CAREER_VECTORS).slice(0, 10),
    [profile.normalizedScores],
  )
  const topProfession = localMatches[0]
  const archetype = resolveArchetype(profile.archetypeCode)
  const archetypeTitle = t(archetype.titleKey)
  const shareArchetype = { ...archetype, title: archetypeTitle }
  const locationLabel = [profile.location.city || profile.location.region, profile.location.country]
    .filter(Boolean)
    .join(', ')
  const topCombo = profile.topDimensions.map(({ code }) => code).join('')
  const shareTheme = {
    accent: archetype.stroke,
    accentSoft: archetype.fill,
    paper: '#ffffff',
    ink: '#0f172a',
    muted: '#475569',
    highlight: '#fbbf24',
    border: `${archetype.stroke}40`,
  }

  const loadProfessionInsights = useCallback(async (career, { forceRefresh = false } = {}) => {
    if (!career?.id) return
    setLoadingId(career.id)
    setErrorByProfession((prev) => ({ ...prev, [career.id]: '' }))
    try {
      const result = await getRecommendations(profile, career, { forceRefresh })
      setInsightByProfession((prev) => ({ ...prev, [career.id]: result }))
    } catch (requestError) {
      setErrorByProfession((prev) => ({ ...prev, [career.id]: requestError.message }))
    } finally {
      setLoadingId((current) => (current === career.id ? null : current))
    }
  }, [profile])

  // Prefetch #1 only. Do not auto-expand.
  useEffect(() => {
    if (!topProfession?.id) return undefined
    let active = true
    getRecommendations(profile, topProfession)
      .then((result) => {
        if (active) setInsightByProfession((prev) => ({ ...prev, [topProfession.id]: result }))
      })
      .catch((requestError) => {
        if (active) setErrorByProfession((prev) => ({ ...prev, [topProfession.id]: requestError.message }))
      })
    return () => { active = false }
  }, [profile, topProfession])

  const toggleProfession = (career) => {
    const nextId = expandedId === career.id ? null : career.id
    setExpandedId(nextId)
    if (nextId && !insightByProfession[career.id] && loadingId !== career.id) {
      loadProfessionInsights(career)
    }
  }

  return (
    <ClickSpark sparkColor="#2563eb" sparkRadius={28} sparkSize={12} duration={650} sparkCount={10}>
    <section className="results section-wrap">
      <motion.header
        className="results-heading"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <p className="eyebrow"><Sparkles size={15} /> {t('results.label')}</p>
          <h1>{t('results.title')}</h1>
        </div>
      </motion.header>

      <div className="results-hero" data-testid="archetype-hero">
        <motion.article
          className="archetype-card"
          style={{ '--accent': archetype.stroke }}
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="archetype-art">
            <img src={archetype.image} alt="" />
          </div>
          <div className="archetype-copy">
            <span className="archetype-kicker">{t('results.topProfile')}</span>
            <h2>{archetypeTitle}</h2>
            <p className="archetype-code">{profile.archetypeCode}</p>
            <p className="archetype-blurb">{t('results.archetypeBlurb', { code: topCombo })}</p>
            <div className="trait-row">
              {profile.topDimensions.map(({ code }) => (
                <span key={code} className="trait-pill">{t(`dimensions.${code}.name`)}</span>
              ))}
            </div>
          </div>
        </motion.article>

        <motion.article
          className="riasec-card"
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="riasec-card-head">
            <h3>{t('results.riasecScores')}</h3>
            <p>{t('results.patternNote', { combo: topCombo })}</p>
          </div>
          <RadarChart scores={profile.normalizedScores} strokeColor={archetype.stroke} fillColor={archetype.fill} />
          <div className="score-bars">
            {RIASEC_CODES.map((code, barIndex) => {
              const score = profile.normalizedScores[code]
              return (
                <motion.div
                  key={code}
                  className="score-bar-row"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.45 + barIndex * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span>{code}</span>
                  <div className="score-bar-track">
                    <motion.i
                      initial={{ width: 0 }}
                      animate={{ width: `${(score / 33) * 100}%` }}
                      transition={{ duration: 1.15, delay: 0.55 + barIndex * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      style={{ background: archetype.stroke }}
                    />
                  </div>
                  <strong>{score}</strong>
                </motion.div>
              )
            })}
          </div>
        </motion.article>
      </div>

      <section className="result-section profession-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">{t('results.matchesEyebrow')}</p>
            <h2>{t('results.professionMatches')}</h2>
            <p className="section-note">{t('results.matchesNote')}</p>
          </div>
          <span className="location-pill">
            <img
              src="/location-icon.gif"
              alt=""
              className="location-pill-gif"
              width="22"
              height="22"
              decoding="async"
            />
            {locationLabel}
          </span>
        </div>

        <div className="profession-list" data-testid="profession-list">
          {localMatches.map((career, index) => {
            const isOpen = expandedId === career.id
            const insight = insightByProfession[career.id]
            const schools = insight?.recommendations?.schools ?? []
            const programs = insight?.recommendations?.scholarshipsAndPrograms ?? []
            const isLoading = loadingId === career.id
            const error = errorByProfession[career.id]
            const tags = buildProfessionTags(profile.normalizedScores, career)
            const tone = matchTone(career.matchPercent)
            const rankAccent = RANK_ACCENTS[index % RANK_ACCENTS.length]

            return (
              <motion.article
                key={career.id}
                className={`profession-card tone-${tone} ${isOpen ? 'open' : ''}`}
                style={{ '--rank-accent': rankAccent }}
                data-testid={`profession-card-${career.id}`}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
                transition={{
                  duration: index === 0 ? 0.65 : 0.5,
                  delay: index === 0 ? 0.05 : Math.min(index * 0.09, 0.72),
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <button
                  type="button"
                  className="profession-card-header"
                  onClick={() => toggleProfession(career)}
                  aria-expanded={isOpen}
                >
                  <div className="profession-card-main">
                    <span className="profession-rank">
                      {index === 0 ? t('results.topMatchBadge') : `${t('results.professionLabel')} #${index + 1}`}
                    </span>
                    <h3>{career.title}</h3>
                    <p>{career.description}</p>
                  </div>
                  <div className="profession-card-meta">
                    <div className="profession-match-row">
                      <ChevronDown size={22} className={`profession-chevron ${isOpen ? 'open' : ''}`} />
                      <div className="match-track">
                        <i style={{ width: `${career.matchPercent}%` }} />
                      </div>
                    </div>
                    <span className="match-label">{t('results.match', { percent: career.matchPercent })}</span>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="profession-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28 }}
                    >
                      <div className="profession-panel-inner">
                        <div className="why-path">
                          <h4>{t('results.whyPath')}</h4>
                          <p>{career.description}</p>
                          <div className="tag-row tag-row-start">
                            {tags.map((tag, tagIndex) => (
                              <span key={tag.id} className={`fit-tag fit-tag-${tagIndex % 6}`}>
                                {formatProfessionTag(tag, t)}
                              </span>
                            ))}
                          </div>
                        </div>

                        {isLoading && (
                          <div className="loading-panel" data-testid={`profession-loading-${career.id}`}>
                            <span className="loader" /> {t('results.aiLoading')}
                          </div>
                        )}

                        {!isLoading && error && (
                          <div className="error-panel">
                            <p>{t('results.aiUnavailable')}</p>
                            <small>{error}</small>
                            <button className="text-button" type="button" onClick={() => loadProfessionInsights(career)}>
                              <RefreshCcw size={16} /> {t('results.retry')}
                            </button>
                          </div>
                        )}

                        {!isLoading && !error && insight && (
                          <div className="school-scholarship-grid">
                            <section>
                              <div className="panel-heading">
                                <BookOpen size={16} />
                                <h4>{t('results.topSchools')}</h4>
                                <span>{schools.length}</span>
                              </div>
                              {schools.length === 0 ? (
                                <p className="empty-hint">{t('results.noSchools')}</p>
                              ) : (
                                <div className="school-stack">
                                  {schools.map((school, schoolIndex) => {
                                    const href = safeHttpUrl(school.website)
                                    return (
                                      <article key={`${school.name}-${school.program}-${schoolIndex}`} className="school-card">
                                        <div className="school-card-top">
                                          <span>#{schoolIndex + 1} · {school.scope}</span>
                                          {href && (
                                            <a href={href} target="_blank" rel="noreferrer" className="school-link">
                                              {t('results.visitSchool')} <ExternalLink size={13} />
                                              <span className="sr-only"> {t('results.opensNewTab')}</span>
                                            </a>
                                          )}
                                        </div>
                                        <h5>{school.name}</h5>
                                        <b>{school.program}</b>
                                        <p>{school.whyStrong}</p>
                                        <footer><MapPin size={13} /> {school.location}</footer>
                                      </article>
                                    )
                                  })}
                                </div>
                              )}
                            </section>

                            <section>
                              <div className="panel-heading">
                                <Award size={16} />
                                <h4>{t('results.topScholarships')}</h4>
                                <span>{programs.length}</span>
                              </div>
                              {programs.length === 0 ? (
                                <p className="empty-hint">{t('results.noScholarships')}</p>
                              ) : (
                                <div className="scholarship-stack">
                                  {programs.map((item, programIndex) => {
                                    const href = safeHttpUrl(item.website)
                                    const fundTag = coverageTag(item.coverage)
                                    return (
                                      <article key={`${item.provider}-${item.name}-${programIndex}`} className="scholarship-card">
                                        <h5>{item.name}</h5>
                                        <p>{item.provider} · {item.coverage} · {item.locationScope}</p>
                                        <small>{item.eligibility}</small>
                                        {fundTag && <span className="fund-tag">{fundTag}</span>}
                                        {href && (
                                          <a href={href} target="_blank" rel="noreferrer" className="scholarship-link">
                                            {t('results.openScholarship')} <ArrowUpRight size={14} />
                                            <span className="sr-only"> {t('results.opensNewTab')}</span>
                                          </a>
                                        )}
                                      </article>
                                    )
                                  })}
                                </div>
                              )}
                            </section>
                          </div>
                        )}

                        {insight && (
                          <button
                            className="text-button refresh-button"
                            type="button"
                            onClick={() => loadProfessionInsights(career, { forceRefresh: true })}
                            disabled={isLoading}
                          >
                            <RefreshCcw size={16} /> {t('results.refresh')}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </div>
      </section>

      {topProfession && (
        <>
          <div className="results-footer">
            <div className="results-footer-copy">
              <h2 id="share-cta-title">{t('results.shareHeading')}</h2>
              <p>{t('results.shareDescription')}</p>
            </div>
            <div className="results-footer-actions">
              <button className="secondary-button" type="button" onClick={onRetake}>
                <RotateCcw size={17} /> {t('results.startAgain')}
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={() => setShareOpen(true)}
                data-testid="open-share-modal-btn"
              >
                <Share2 size={18} />
                {t('results.share')}
              </button>
            </div>
          </div>

          <ShareResultModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            archetype={shareArchetype}
            profile={profile}
            topProfession={topProfession}
            theme={shareTheme}
          />
        </>
      )}

      {!topProfession && (
        <div className="results-footer">
          <div className="results-footer-actions">
            <button className="secondary-button" type="button" onClick={onRetake}>
              <RotateCcw size={17} /> {t('results.startAgain')}
            </button>
          </div>
        </div>
      )}
    </section>
    </ClickSpark>
  )
}
