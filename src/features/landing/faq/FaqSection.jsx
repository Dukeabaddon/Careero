import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CAREER_COUNT } from '../../../data/careers.js'
import { scrollRevealProps } from '../shared/scrollReveal.js'
import './FaqSection.css'

const FAQ_KEYS = [0, 1, 2, 3]

export default function FaqSection() {
  const { t } = useTranslation()
  const [activeFaq, setActiveFaq] = useState(null)

  return (
    <section className="faq-section section-wrap mt-12" id="faq">
      <motion.div className="section-heading text-center" {...scrollRevealProps}>
        <h2>{t('faq.title')}</h2>
        <p className="text-center mx-auto">{t('faq.subtitle')}</p>
      </motion.div>
      <motion.div className="faq-list" {...scrollRevealProps}>
        {FAQ_KEYS.map((idx) => {
          const isOpen = activeFaq === idx
          return (
            <div
              key={idx}
              className={`faq-item ${isOpen ? 'open' : ''}`}
              onClick={() => setActiveFaq(isOpen ? null : idx)}
            >
              <div className="faq-question">
                <h3>{t(`faq.items.${idx}.q`)}</h3>
                <ChevronDown size={18} className={`faq-chevron transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className="faq-answer mt-3 text-slate-600 text-sm leading-relaxed">{t(`faq.items.${idx}.a`, { count: CAREER_COUNT })}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </motion.div>
    </section>
  )
}
