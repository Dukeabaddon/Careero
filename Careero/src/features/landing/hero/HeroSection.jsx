import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import heroEllipse from '../../../assets/hero/hero-ellipse.svg'
import heroStudentFemale from '../../../assets/hero/hero-student-female.webp'
import heroStudentMale from '../../../assets/hero/hero-student-male.webp'
import './HeroSection.css'

export default function HeroSection({ onStart }) {
  const { t } = useTranslation()

  return (
    <section className="hero hero-100dvh">
      <motion.div
        className="hero-copy section-wrap"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="hero-badge">{t('hero.badge')}</span>
        <h1 className="hero-heading">{t('hero.title')}</h1>
        <p className="hero-description">{t('hero.description')}</p>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={onStart} data-testid="start-assessment-btn">
            {t('hero.start')} <ArrowRight size={19} />
          </button>
        </div>
      </motion.div>

      <img className="hero-ellipse" src={heroEllipse} alt="" aria-hidden="true" />

      <div className="hero-stage" aria-hidden="true">
        <div className="hero-characters">
          <img className="hero-student hero-student-female" src={heroStudentFemale} alt="" />
          <img className="hero-student hero-student-male" src={heroStudentMale} alt="" />
        </div>
      </div>
    </section>
  )
}
