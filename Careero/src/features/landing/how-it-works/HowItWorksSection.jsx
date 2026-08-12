import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CAREER_COUNT } from '../../../data/careers.js'
import { scrollRevealProps } from '../shared/scrollReveal.js'
import { sectionHeadingClass, sectionSubtitleClass, sectionTitleClass } from '../shared/sectionHeading.js'
import './HowItWorksSection.css'

export default function HowItWorksSection() {
  const { t } = useTranslation()

  return (
    <section className="section-wrap py-20 md:py-20" id="how-it-works">
      <div className={sectionHeadingClass}>
        <h2 className={sectionTitleClass}>{t('howItWorks.title')}</h2>
        <p className={sectionSubtitleClass}>{t('howItWorks.subtitle')}</p>
      </div>
      <motion.div className="mt-12 grid gap-6 md:grid-cols-3" {...scrollRevealProps}>
        <div className="step-card">
          <div className="step-number">01</div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" id="color-combination" width="38" height="38" className="step-custom-svg mb-4">
            <path fill="#662D91" d="M176.723 186.431c7.1 8.462 6.058 21.298-3.689 26.494a96 96 0 0 1-25.3 9.21c-10.806 2.285-19.856-6.878-19.857-17.923l-.003-37.148c0-5.552 4.632-9.891 9.849-11.789 5.216-1.899 11.554-1.554 15.122 2.699z"></path>
            <path fill="#C1272D" d="M127.871 204.212c0 11.045-9.049 20.209-19.856 17.924a96 96 0 0 1-25.3-9.208c-9.748-5.195-10.79-18.031-3.691-26.493l23.876-28.459c3.568-4.253 9.905-4.599 15.122-2.701s9.849 6.237 9.849 11.789z"></path>
            <path fill="#E86110" d="M53.026 141.409c-10.878 1.918-21.473-5.403-21.1-16.442A96 96 0 0 1 36.6 98.452c3.424-10.501 15.885-13.758 25.45-8.236l32.173 18.572c4.808 2.776 6.25 8.957 5.286 14.424s-4.432 10.782-9.9 11.746z"></path>
            <path fill="#F5921E" d="M62.054 90.212c-9.566-5.523-12.977-17.942-5.595-26.158a96 96 0 0 1 20.624-17.307c9.373-5.844 21.011-.33 24.79 10.05l12.708 34.907c1.899 5.216-.97 10.878-5.223 14.446-4.252 3.569-10.326 5.412-15.133 2.636z"></path>
            <path fill="#39B54A" d="M153.865 56.795c3.778-10.38 15.416-15.895 24.789-10.052A96 96 0 0 1 199.28 64.05c7.382 8.216 3.972 20.635-5.593 26.158l-32.17 18.576c-4.808 2.777-10.881.934-15.134-2.634s-7.122-9.23-5.223-14.446z"></path>
            <path fill="#00A99D" d="M193.689 90.212c9.566-5.523 22.027-2.268 25.451 8.234a96 96 0 0 1 4.677 26.514c.374 11.04-10.221 18.361-21.099 16.444l-36.584-6.448c-5.468-.964-8.936-6.279-9.9-11.746s.476-11.648 5.284-14.424z"></path>
            <path fill="#0071BC" d="M202.717 141.409c10.878 1.918 18.33 12.421 14.204 22.667a96 96 0 0 1-13.461 23.317c-6.81 8.698-19.632 7.496-26.733-.965l-23.88-28.456c-3.569-4.252-2.809-10.553-.034-15.361s7.853-8.617 13.32-7.653z"></path>
            <path fill="#FF421D" d="M79.02 186.431c-7.1 8.462-19.923 9.664-26.733.968a96 96 0 0 1-13.462-23.317c-4.128-10.245 3.324-20.749 14.202-22.668l36.583-6.453c5.467-.964 10.544 2.844 13.32 7.652s3.536 11.108-.032 15.361z"></path>
            <path fill="#FDB62F" d="M101.878 56.795c-3.778-10.38 1.592-22.085 12.528-23.634a96 96 0 0 1 26.924-.001c10.937 1.548 16.307 13.254 12.53 23.633l-12.703 34.909c-1.898 5.217-7.735 7.71-13.287 7.71-5.551 0-11.388-2.492-13.287-7.71z"></path>
          </svg>
          <h3>{t('howItWorks.step1.title')}</h3>
          <p>{t('howItWorks.step1.description')}</p>
        </div>

        <div className="step-card">
          <div className="step-number">02</div>
          <svg xmlns="http://www.w3.org/2000/svg" id="flowchart" viewBox="0 0 48 48" width="38" height="38" className="step-custom-svg mb-4">
            <path d="M40,23h-15v-15c0-.552-.447-1-1-1s-1,.448-1,1v15h-15c-1.103,0-2,.897-2,2v15c0,.552.447,1,1,1s1-.448,1-1v-15h15v15c0,.552.447,1,1,1s1-.448,1-1v-15h15v15c0,.552.447,1,1,1s1-.448,1-1v-15c0-1.103-.897-2-2-2Z" fill="#cfe0f3"></path>
            <rect width="14" height="9" y="36" rx="1" ry="1" fill="#05e594"></rect>
            <path d="M14,43v1c0,.55-.45,1-1,1H1c-.55,0-1-.45-1-1v-7c0-.55.45-1,1-1h1v6c0,.55.45,1,1,1h11Z" fill="#00ca85"></path>
            <rect width="14" height="9" x="17" y="36" rx="1" ry="1" fill="#05e594"></rect>
            <path d="M31,43v1c0,.55-.45,1-1,1h-12c-.55,0-1-.45-1-1v-7c0-.55.45-1,1-1h1v6c0,.55.45,1,1,1h11Z" fill="#00ca85"></path>
            <rect width="14" height="9" x="34" y="36" rx="1" ry="1" fill="#05e594"></rect>
            <path d="M48,43v1c0,.55-.45,1-1,1h-12c-.55,0-1-.45-1-1v-7c0-.55.45-1,1-1h1v6c0,.55.45,1,1,1h11Z" fill="#00ca85"></path>
            <path d="M23.137,18.913l-8.751,4.185c-.758.363-.758,1.442,0,1.804l8.751,4.185c.546.261,1.18.261,1.726,0l8.751-4.185c.758-.363.758-1.442,0-1.804l-8.751-4.185c-.546-.261-1.18-.261-1.726,0Z" fill="#ff3b65"></path>
            <path d="M26.48,28.31l-1.62.78c-.54.26-1.18.26-1.72,0l-8.75-4.19c-.76-.36-.76-1.44,0-1.8l.99-.47c-.03.29.11.59.41.73l9.83,4.7c.28.13.56.22.86.25Z" fill="#d82b50" opacity=".75"></path>
            <rect width="16" height="9" x="16" y="3" rx="1" ry="1" fill="#0ca0f2"></rect>
            <path d="M32,10v1c0,.55-.45,1-1,1h-14c-.55,0-1-.45-1-1v-7c0-.55.45-1,1-1h1v6c0,.55.45,1,1,1h13Z" fill="#0588e2"></path>
          </svg>
          <h3>{t('howItWorks.step2.title')}</h3>
          <p>{t('howItWorks.step2.description', { count: CAREER_COUNT })}</p>
        </div>

        <div className="step-card">
          <div className="step-number">03</div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" id="book" width="38" height="38" className="step-custom-svg mb-4">
            <g>
              <rect width="58" height="40" x="3" y="15" fill="#007579"></rect>
              <path fill="#ff6243" d="M32,55a4,4,0,0,0-4-4H7V11H18V47h6A8,8,0,0,1,32,55Z"></path>
              <path fill="#ffa733" d="M57,11V51H36a4,4,0,0,0-4,4V15a4,4,0,0,1,4-4Z"></path>
              <polygon fill="#006df0" points="17 51 17 59 14 56 11 59 11 51 17 51"></polygon>
            </g>
          </svg>
          <h3>{t('howItWorks.step3.title')}</h3>
          <p>{t('howItWorks.step3.description')}</p>
        </div>
      </motion.div>
    </section>
  )
}
