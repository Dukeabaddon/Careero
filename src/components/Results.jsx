import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Award, BookOpen, BrainCircuit, MapPin, RefreshCcw, RotateCcw, Sparkles, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CAREER_VECTORS } from '../data/careers.js'
import { rankCareerMatches, RIASEC_CODES } from '../utils/riasecScoring.js'
import { getRecommendations } from '../services/recommendations.js'
import RadarChart from './RadarChart.jsx'
import ShareCard from './ShareCard.jsx'

const archetypeAssets = import.meta.glob('../assets/riasec/archetype_*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

const archetypes = {
  RI: ['pathfinder', 'The Pathfinder'],
  AS: ['creator', 'The Creator'],
  EC: ['strategist', 'The Strategist'],
  IA: ['visionary', 'The Visionary'],
  RC: ['builder', 'The Builder'],
  SE: ['guardian', 'The Guardian'],
}

const primaryFallback = {
  R: ['pathfinder', 'The Pathfinder'],
  I: ['visionary', 'The Visionary'],
  A: ['creator', 'The Creator'],
  S: ['guardian', 'The Guardian'],
  E: ['strategist', 'The Strategist'],
  C: ['builder', 'The Builder'],
}

function resolveArchetype(code) {
  const direct = archetypes[code] || archetypes[code.split('').reverse().join('')]
  const [asset, title] = direct || primaryFallback[code[0]]
  const image = Object.entries(archetypeAssets).find(([path]) => path.endsWith(`archetype_${asset}.webp`))?.[1]
  return { title, image }
}

function safeHttpUrl(value) {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

export default function Results({ profile, onRestart }) {
  const { t } = useTranslation()
  const [aiResult, setAiResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const localMatches = useMemo(() => rankCareerMatches(profile.normalizedScores, CAREER_VECTORS).slice(0, 4), [profile.normalizedScores])
  const topProfession = localMatches[0]
  const archetype = resolveArchetype(profile.archetypeCode)

  const loadInsights = useCallback(async (forceRefresh = false) => {
    setLoading(true)
    setError('')
    try {
      const result = await getRecommendations(profile, topProfession, { forceRefresh })
      setAiResult(result)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [profile, topProfession])

  useEffect(() => {
    let active = true
    getRecommendations(profile, topProfession)
      .then((result) => active && setAiResult(result))
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [profile, topProfession])

  const schools = aiResult?.recommendations?.schools ?? []
  const programs = aiResult?.recommendations?.scholarshipsAndPrograms ?? []
  const skills = aiResult?.recommendations?.skillDevelopment ?? []
  const sources = aiResult?.recommendations?.sources ?? []
  const locationLabel = [profile.location.city || profile.location.region, profile.location.country].filter(Boolean).join(', ')

  return (
    <section className="results section-wrap">
      <header className="results-heading">
        <div>
          <p className="eyebrow"><Sparkles size={15} /> {t('results.label')}</p>
          <h1>{t('results.title')}</h1>
        </div>
        <span className="location-pill"><MapPin size={15} /> {locationLabel}</span>
      </header>

      <motion.div className="archetype-panel" data-testid="archetype-hero" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className="archetype-art"><img src={archetype.image} alt="" /></div>
        <div className="archetype-copy">
          <span>{t('results.topProfile')}</span>
          <strong>{profile.archetypeCode}</strong>
          <h2>{archetype.title}</h2>
          <div className="top-signals">
            {profile.topDimensions.map(({ code, score }) => (
              <span key={code}>{t(`dimensions.${code}.name`)} <b>{score}</b></span>
            ))}
          </div>
        </div>
        <RadarChart scores={profile.normalizedScores} />
      </motion.div>

      <div className="score-strip">
        {RIASEC_CODES.map((code) => (
          <div key={code}>
            <span>{code}</span>
            <strong>{profile.normalizedScores[code]}</strong>
            <div><i style={{ width: `${(profile.normalizedScores[code] / 33) * 100}%` }} /></div>
          </div>
        ))}
      </div>

      <section className="result-section">
        <div className="section-title-row">
          <div><p className="eyebrow">Pearson 6-vector</p><h2>{t('results.localMatches')}</h2></div>
        </div>
        <div className="career-match-grid">
          {localMatches.map((career, index) => (
            <article className="career-match-card" key={career.id}>
              <span className="rank">0{index + 1}</span>
              <p>{t('results.match', { percent: career.matchPercent })}</p>
              <h3>{career.title}{index === 0 && <span className="top-match-label">{t('results.topProfession')}</span>}</h3>
              <p>{career.description}</p>
              <div>{career.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="result-section ai-section">
        <div className="section-title-row">
          <div><p className="eyebrow"><BrainCircuit size={15} /> Multi-LLM insight</p><h2>{t('results.aiTitle', { location: locationLabel, profession: topProfession.title })}</h2></div>
          {aiResult && (
            <span className="cache-pill" data-testid="cache-status-pill">
              {aiResult.meta?.cached ? <Zap size={14} /> : <Sparkles size={14} />}
              {t(aiResult.meta?.cached ? 'results.cached' : 'results.live')}
            </span>
          )}
        </div>

        {loading && <div className="loading-panel"><span className="loader" /> {t('results.aiLoading')}</div>}
        {!loading && error && (
          <div className="error-panel">
            <p>{t('results.aiUnavailable')}</p>
            <small>{error}</small>
            <button className="text-button" type="button" onClick={() => loadInsights()}><RefreshCcw size={16} /> {t('results.retry')}</button>
          </div>
        )}
        {!loading && schools.length > 0 && (
          <div className="school-grid">
            {schools.map((school, index) => (
              <article key={`${school.name}-${school.program}`}>
                <div><span>{String(index + 1).padStart(2, '0')} · {school.scope}</span><ArrowUpRight size={19} /></div>
                <h3>{safeHttpUrl(school.website) ? <a href={safeHttpUrl(school.website)} target="_blank" rel="noreferrer">{school.name}<span className="sr-only"> {t('results.opensNewTab')}</span></a> : school.name}</h3>
                <b>{school.program}</b>
                <p>{school.whyStrong}</p>
                <footer><MapPin size={14} /> {school.location}</footer>
              </article>
            ))}
          </div>
        )}
        {!loading && aiResult && (
          <div className="insight-columns">
            <article><h3><Zap size={18} /> {t('results.skills')}</h3><ul>{skills.map((skill) => <li key={skill}>{skill}</li>)}</ul></article>
            <article><h3><Award size={18} /> {t('results.programs')}</h3><ul>{programs.map((item) => <li key={`${item.provider}-${item.name}`}><b>{item.name}</b><span>{item.provider} · {item.coverage} · {item.locationScope}</span><small>{item.eligibility}</small></li>)}</ul></article>
          </div>
        )}
        {!loading && aiResult?.recommendations?.verificationNote && <p className="verification-note"><BookOpen size={15} /> {aiResult.recommendations.verificationNote}</p>}
        {!loading && sources.length > 0 && (
          <div className="source-list">
            <b>{t('results.sources')}</b>
            {sources.map((source) => safeHttpUrl(source.uri) && <a key={source.uri} href={safeHttpUrl(source.uri)} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={13} /><span className="sr-only"> {t('results.opensNewTab')}</span></a>)}
          </div>
        )}
        {aiResult && (
          <button className="text-button refresh-button" type="button" onClick={() => loadInsights(true)} disabled={loading}>
            <RefreshCcw size={16} /> {t('results.refresh')}
          </button>
        )}
      </section>

      <ShareCard archetype={archetype} profile={profile} topProfession={topProfession} />

      <div className="results-footer">
        <button className="secondary-button" type="button" onClick={onRestart}><RotateCcw size={17} /> {t('results.startAgain')}</button>
      </div>
    </section>
  )
}
