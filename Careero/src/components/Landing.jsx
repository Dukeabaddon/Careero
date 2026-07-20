import { ArrowRight, Clock3, LockKeyhole, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { RIASEC_CODES } from '../utils/riasecScoring.js'

const dimensionAssets = import.meta.glob('../assets/riasec/riasec_*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

function dimensionImage(code) {
  const suffix = `riasec_${code.toLowerCase()}.webp`
  return Object.entries(dimensionAssets).find(([path]) => path.endsWith(suffix))?.[1]
}

export default function Landing({ savedSession, onStart, onResume, onStartFresh }) {
  const { t } = useTranslation()

  return (
    <>
      <section className="hero section-wrap">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow"><Sparkles size={15} /> {t('hero.badge')}</p>
          <h1>{t('hero.title')} <em>{t('hero.titleAccent')}</em></h1>
          <p className="hero-description">{t('hero.description')}</p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={onStart} data-testid="start-assessment-btn">
              {t('hero.start')} <ArrowRight size={19} />
            </button>
            <span><Clock3 size={16} /> {t('hero.duration')}</span>
          </div>
          <p className="privacy-line"><LockKeyhole size={14} /> {t('hero.privacy')}</p>
        </motion.div>

        <div className="orbit-stage" aria-label="Six RIASEC dimensions">
          <div className="orbit-ring ring-one" />
          <div className="orbit-ring ring-two" />
          <div className="orbit-core"><span>6</span><small>{t('dimensions.signalsShort')}</small></div>
          {RIASEC_CODES.map((code, index) => (
            <motion.div
              className={`orbit-node node-${index + 1}`}
              key={code}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 + index * 0.08, type: 'spring', stiffness: 160 }}
            >
              <img src={dimensionImage(code)} alt="" />
              <b>{code}</b>
            </motion.div>
          ))}
        </div>
      </section>

      {savedSession && !savedSession.isCompleted && (
        <section className="resume-banner section-wrap" aria-labelledby="resume-title">
          <div>
            <p className="eyebrow">{t('quiz.sessionSaved')}</p>
            <h2 id="resume-title">{t('quiz.resumeTitle')}</h2>
            <p>{t('quiz.resumeBody', { question: savedSession.currentQuestionIndex + 1 })}</p>
          </div>
          <div className="resume-actions">
            <button className="primary-button" type="button" onClick={onResume}>{t('quiz.resume')}</button>
            <button className="text-button" type="button" onClick={onStartFresh}>{t('quiz.fresh')}</button>
          </div>
        </section>
      )}

      <section className="dimensions section-wrap">
        <div className="section-heading">
          <p className="eyebrow">{t('dimensions.label')}</p>
          <h2>{t('dimensions.title')}</h2>
          <p>{t('dimensions.subtitle')}</p>
        </div>
        <div className="dimension-grid">
          {RIASEC_CODES.map((code, index) => (
            <motion.article
              className={`dimension-card dimension-${code.toLowerCase()}`}
              key={code}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.05 }}
            >
              <img src={dimensionImage(code)} alt="" loading="lazy" />
              <div>
                <span>{code}</span>
                <h3>{t(`dimensions.${code}.name`)}</h3>
                <p>{t(`dimensions.${code}.description`)}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  )
}
