import { useState } from 'react'
import { ArrowRight, Clock3, LockKeyhole, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { RIASEC_CODES } from '../utils/riasecScoring.js'
import { CAREER_COUNT } from '../data/careers.js'
import Footer from './Footer.jsx'

const dimensionAssets = import.meta.glob('../assets/riasec/riasec_*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

function dimensionImage(code) {
  const suffix = `riasec_${code.toLowerCase()}.webp`
  return Object.entries(dimensionAssets).find(([path]) => path.endsWith(suffix))?.[1]
}

const FAQ_KEYS = [0, 1, 2, 3]

const scrollRevealProps = {
  initial: { opacity: 0, y: 44, scale: 0.97 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { amount: 0.2, margin: '0px 0px -15% 0px' },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
}

export default function Landing({ onStart }) {
  const { t } = useTranslation()
  const [activeFaq, setActiveFaq] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)

  return (
    <>
      {/* Hero Section */}
      <section className="hero section-wrap hero-100dvh">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="hero-heading">{t('hero.title')}</h1>
          <p className="hero-description">{t('hero.description')}</p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={onStart} data-testid="start-assessment-btn">
              {t('hero.start')} <ArrowRight size={19} />
            </button>
            <span><Clock3 size={16} /> {t('hero.duration')}</span>
          </div>
          <p className="privacy-line"><LockKeyhole size={14} /> {t('hero.privacy')}</p>
        </motion.div>

        {/* Clean Normal Circular Orbit */}
        <div className="orbit-stage" aria-label="Six RIASEC dimensions">
          <div className="orbit-ring ring-one" />
          <div className="orbit-ring ring-two" />
          <div className="orbit-core sun-core">
            <span>6</span>
            <small>{t('dimensions.signalsShort')}</small>
          </div>

          <div className={`clean-orbit-track ${hoveredNode !== null ? 'paused' : ''}`}>
            {RIASEC_CODES.map((code, index) => (
              <div key={code} className={`clean-orbit-card-wrapper node-pos-${index}`}>
                <div
                  className="clean-upright-card"
                  onMouseEnter={() => setHoveredNode(code)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <img src={dimensionImage(code)} alt={code} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Stats Bar */}
      <section className="stats-bar section-wrap" id="features">
        <motion.div className="stats-grid" {...scrollRevealProps}>
          <div className="stat-card">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96.928 124" id="engineer" width="42" height="54" preserveAspectRatio="xMidYMid meet" className="stat-custom-svg flex-shrink-0">
              <path fill="#f9b132" d="M81.508 18.59c-2.32-8.32-7.86-16.63-19.28-18.28h-8.6c-11.42 1.65-16.96 9.96-19.28 18.28l-.25.94 47.67.01.01-.01-.27-.94z"></path>
              <path fill="#ef9d26" d="M62.228.31v12.57c-1.02-.07-2.07-.1-3.17-.1-.23 0-.47 0-.7.01h-.84c-1.36-.02-2.65.02-3.89.1V.31c1.35-.21 2.78-.31 4.3-.31s2.95.1 4.3.31z"></path>
              <path fill="#ffc05a" d="M85.608 23.28c-.83-1.03-2.08-2.38-3.84-3.74-3.8-2.97-9.99-6.09-19.54-6.66-1.02-.07-2.07-.1-3.17-.1-.23 0-.47 0-.7.01h-.84c-1.36-.02-2.65.02-3.89.1-9.54.58-15.73 3.69-19.53 6.64-1.76 1.37-3.01 2.71-3.84 3.74-.78.97-.48 2.4.61 2.98l.06.03c.73.38 1.6.26 2.21-.27.09-.07.18-.16.26-.26h49.08c.08.1.16.19.25.26.61.54 1.49.65 2.22.26l.05-.02c1.09-.58 1.38-2 .61-2.97zM96.928 124h-14l6.32-26.32c3.5 6.7 6.31 15.29 7.68 26.32z"></path>
              <path fill="#fec4b9" d="M36.128 51.96c-2.7.32-5.51-1.6-6.68-4.78-1.35-3.67.01-7.63 3.04-8.83.29-.12.59-.2.89-.25 1.65 5.309 2.435 10.179 2.75 13.86z"></path>
              <path fill="#ffc05a" d="m69.478 77.55-.54-.27-22.11.04-.45.23c-6.56 3.27-14.6 9.52-20.44 21.45l-.35.76 9.32 24.24h48.02l6.32-26.32c-5.78-11.08-13.46-16.98-19.77-20.13z"></path>
              <path fill="#f9b132" d="m80.388 101.01.11 10.04-5.35 3.06h-1.02l-5.35-3.06.12-10.04z"></path>
              <path fill="#ef9d26" d="M81.358 97v4.01H67.918V97z"></path>
              <path fill="#ffd7d2" d="M51.718 65.93v7.34l6.21 8.9 6.21-8.92v-7.32z"></path>
              <path fill="#f9b132" d="M63.168 84.61v32.42h-10.48V84.57l5.24-3.4 5.24 3.43v.01zm-3.18 9.01c0-1.14-.92-2.07-2.06-2.07-1.14 0-2.06.93-2.06 2.07s.92 2.06 2.06 2.06c1.14 0 2.06-.92 2.06-2.06zm0 13.57c0-1.14-.92-2.06-2.06-2.06-1.14 0-2.06.92-2.06 2.06s.92 2.07 2.06 2.07c1.14 0 2.06-.93 2.06-2.07z"></path>
              <path fill="#ffd7d2" d="M48.683 17.497c-.01-.01-.01 0-.01 0-4.524 2.063-11.235 6.716-12.185 14.263v.881c.379 10.311 2.437 18.789 4.475 22.178 1.434 2.386 4.229 5.314 7.71 7.434 2.765 1.689 5.959 2.867 9.256 2.867 3.287 0 6.471-1.167 9.226-2.836 3.492-2.13 6.307-5.068 7.741-7.464 1.812-3.01 3.635-10.045 4.29-18.799l.082-.328c-1.785-8.364-20.345-20.61-30.585-18.196z"></path>
              <path fill="#d6eae8" d="M57.928 105.13c1.14 0 2.06.92 2.06 2.06s-.92 2.07-2.06 2.07c-1.14 0-2.06-.93-2.06-2.07s.92-2.06 2.06-2.06zm0-13.58c1.14 0 2.06.93 2.06 2.07s-.92 2.06-2.06 2.06c-1.14 0-2.06-.92-2.06-2.06s.92-2.07 2.06-2.07zM68.938 77.28l-2.06 9.76-3.71-2.43v-.01l-5.24-3.43 6.21-8.92 4.84 4.82zM46.828 77.32l-.04-.17 4.93-4.88 6.21 8.9-5.24 3.4-3.8 2.47z"></path>
              <path fill="#ffd7d2" d="M42.348 117.81c2.06.33 3.56 2.13 3.56 4.21V124h-7.83l2.85-3.8c.67-.69 1.04-1.55 1.1-2.43h.01s.12.01.31.04z"></path>
              <path fill="#9e4949" d="M93.048 44.6c.08-9.77-9.61-11.43-9.61-11.43l-.56-.02h-.04l-4.45 22.02-.34 3.19c-1.786 17.931 5.523 22.307 9.8 23.348.98.239 1.745-.798 1.238-1.67-4.168-7.177 3.826-20.928 3.962-35.438z"></path>
              <path fill="#ffd7d2" d="M38.078 124h-19.15l1.73-3.17.41-.75c.56-1.02 1.15-2.01 1.79-2.97 1.83-2.79 3.98-5.36 6.42-7.66l.24-.23c.22-.23.46-.42.72-.58 1.51-.96 3.54-.79 4.87.51 1.54 1.5 1.6 3.95.14 5.51l.01.01a3.972 3.972 0 0 1 5.6-.07c.88.86 1.28 2.03 1.17 3.17-.06.88-.43 1.74-1.1 2.43l-2.85 3.8z"></path>
              <path fill="#b8d3cf" d="m4.208 94.57 2.38 2.89-.57.22c-2.41 1-4.53 1.15-5.49.29l-.26-.29c-1.06-1.61 1.12-4.93 4.88-7.43 3.17-2.09 6.44-2.94 8.03-2.19l.27.15c-3.69 3.75-9.24 6.36-9.24 6.36z"></path>
              <path fill="#d6eae8" d="m21.068 120.08-.41.75-1.08-1.23L.528 97.97c.96.86 3.08.71 5.49-.29l.57-.22 16.15 19.57.12.08c-.64.96-1.23 1.95-1.79 2.97z"></path>
              <path fill="#e7f2f1" d="m25.588 99.76 4.65 8.88c-.26.16-.5.35-.72.58l-.24.23c-2.44 2.3-4.59 4.87-6.42 7.66l-.12-.08-16.15-19.57-2.38-2.89s5.55-2.61 9.24-6.36c1.65-1.67 2.92-3.56 3.18-5.55l8.96 17.1z"></path>
              <path fill="#fec4b9" d="M83.368 38.35c3.03 1.2 4.39 5.16 3.04 8.83-1.17 3.18-3.98 5.1-6.68 4.78-.029-4.044.304-9.1 2.75-13.86.3.05.6.13.89.25zm-31.65 27.66v3.6a22.902 22.902 0 0 0 12.42 2.282V65.93h-12.42v.08z"></path>
              <path fill="#504256" d="m68.968 64.6.02.04c-1.51.92-3.14 1.71-4.85 2.29-1.98.67-4.06 1.07-6.21 1.07-2.15 0-4.23-.4-6.21-1.07a24.06 24.06 0 0 1-4.91-2.33s-.29-2.47 2.08-3.4c2.7 1.65 5.82 2.8 9.04 2.8 3.21 0 6.32-1.14 9.01-2.77 2.31.94 2.03 3.37 2.03 3.37z"></path>
              <path fill="#655f68" d="M77.928 56c-1.67 2.78-4.87 6.17-8.94 8.64l-.02-.04s.28-2.43-2.03-3.37c3.41-2.08 6.16-4.95 7.56-7.29 1.77-2.94 3.55-9.81 4.19-18.36l.021-.33.059.01c1.17.19 2.36.35 3.59.46h.32c-.05.8-.12 1.6-.2 2.38-.52 5.3-1.48 10.18-2.75 13.86h-.01c-.4 1.21-.85 2.29-1.33 3.21-.15.29-.3.57-.46.83zm-41.8-4.04c-1.27-3.68-2.23-8.55-2.75-13.86-.08-.79-.15-1.58-.21-2.39-.04-.52-.07-1.04-.09-1.56.14-.1 1.75-1.11 3.91-2.73v.86c.37 10.07 2.38 18.35 4.37 21.66 1.4 2.33 4.13 5.19 7.53 7.26-2.37.93-2.08 3.4-2.08 3.4-4.04-2.46-7.22-5.84-8.88-8.6-.65-1.09-1.26-2.45-1.8-4.04z"></path>
              <path fill="#a35757" d="M82.688 35.71c-5.41-13.65-21.03-18.86-21.03-18.86 12.82.68 18.73 6.27 20.82 8.9.08.1.16.19.25.26l.15.99c.03.69.05 1.36.05 2 0 1.39-.03 2.78-.09 4.15-.04.86-.09 1.71-.15 2.56z"></path>
              <path fill="#9e4949" d="M82.678 35.72c-17.11-5.91-26.82-18.49-27.14-18.91.64-.02 1.29-.03 1.96-.02h.88c.22-.01.44-.01.66-.01.91 0 1.78.02 2.62.07 0 0 15.62 5.21 21.03 18.86v.01h-.01z"></path>
              <path fill="#a35757" d="M82.678 35.72h-.32c-1.23-.11-2.42-.27-3.59-.46-18.73-3.19-29.52-17.3-29.87-17.77 1.99-.38 4.19-.62 6.63-.68h.01c.32.42 10.03 13 27.14 18.91zm-33.79-18.23c-1.83 5.56-7.84 10.85-11.9 13.93-2.16 1.62-3.77 2.63-3.91 2.73-.1-1.7-.15-3.43-.15-5.15 0-.64.02-1.31.05-2l.16-.99c.09-.07.18-.16.26-.26 1.79-2.21 6.36-6.57 15.49-8.26z"></path>
              <path fill="#fec4b9" d="M30.597 122.06a1 1 0 0 1-.809-1.587l3.88-5.345a1 1 0 1 1 1.619 1.174l-3.88 5.345a.999.999 0 0 1-.81.413zm8.538 1.529a1 1 0 0 1-.799-1.6l1.792-2.389a1 1 0 1 1 1.599 1.2l-1.792 2.389a.996.996 0 0 1-.8.4z"></path>
              <path fill="#9e4949" d="M44.649 32.41a1 1 0 0 1-.576-1.818c2.501-1.76 5.801-1.203 5.939-1.177a1 1 0 0 1-.345 1.971c-.046-.009-2.637-.427-4.443.843a1.008 1.008 0 0 1-.575.181z"></path>
              <path fill="#ea8d81" d="M57.928 46.22c-1.117 0-2.222-.158-3.282-.471a1 1 0 0 1 .564-1.919 9.702 9.702 0 0 0 5.436 0 1 1 0 0 1 .564 1.919c-1.06.313-2.165.471-3.282.471z"></path>
              <path fill="#543927" d="M70.213 36.301c-.367.157-.782.223-1.185.242l-.01-.033c.245-.171.473-.367.665-.616a1 1 0 1 0-1.586-1.218c-.19.247-.44.344-.707.38a2.219 2.219 0 0 0-.485-.056 2.247 2.247 0 0 0 0 4.492 2.24 2.24 0 0 0 1.821-.94c.021 0 .041.003.063.003.736 0 1.516-.118 2.211-.417a.999.999 0 1 0-.787-1.837zM48.95 35c-.167 0-.328.021-.484.055-.267-.036-.517-.133-.707-.38a1.001 1.001 0 0 0-1.586 1.218c.191.249.42.445.665.615a.217.217 0 0 0-.007.024c-.423-.015-.846-.08-1.173-.226a1 1 0 1 0-.816 1.826c.648.29 1.431.406 2.186.406.03 0 .058-.004.088-.005a2.24 2.24 0 0 0 1.836.958A2.247 2.247 0 1 0 48.95 35z"></path>
            </svg>
            <div>
              <strong>{CAREER_COUNT}</strong>
              <span>{t('stats.occupations.label')}</span>
            </div>
          </div>

          <div className="stat-card">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16.933 16.933" id="compass" width="38" height="38" className="stat-custom-svg flex-shrink-0">
              <path fill="#e4eff8" d="m 8.4664092,0.7936219 c 0.5863384,0 1.0583725,0.4718148 1.0583725,1.0578808 0,0.5860659 -0.4720341,1.0578807 -1.0583725,1.0578807 -0.5863384,0 -1.0583725,-0.4718148 -1.0583725,-1.0578807 0,-0.586066 0.4720341,-1.0578808 1.0583725,-1.0578808 z"></path>
              <path fill="#ffca28" d="m 8.4664082,2.6524385 c -3.7962063,-3e-7 -6.8789085,3.080438 -6.8789085,6.8750888 1e-7,3.7946507 3.0827022,6.8766387 6.8789085,6.8766387 3.7962058,0 6.8794248,-3.081988 6.8794248,-6.8766387 0,-3.7946505 -3.083219,-6.8750888 -6.8794248,-6.8750888 z"></path>
              <path fill="#e4eff8" d="M 13.758274,9.5249434 A 5.2918658,5.2917109 0 0 1 8.4664078,14.816654 5.2918658,5.2917109 0 0 1 3.174542,9.5249434 5.2918658,5.2917109 0 0 1 8.4664078,4.2332325 5.2918658,5.2917109 0 0 1 13.758274,9.5249434 Z"></path>
              <path fill="#ff5151" d="m 11.279779,6.4424189 a 0.26461974,0.26461196 0 0 0 -0.02584,0.00103 0.26461974,0.26461196 0 0 0 -0.08992,0.025321 L 7.3434359,8.2790119 A 0.26461974,0.26461196 0 0 0 7.2183743,8.4040698 L 5.4173828,12.216788 a 0.26461974,0.26461196 0 0 0 0.35193,0.35347 L 9.580076,10.767769 A 0.26461974,0.26461196 0 0 0 9.7066892,10.642714 L 11.515432,6.8201769 a 0.26461974,0.26461196 0 0 0 -0.235653,-0.377758 z"></path>
            </svg>
            <div>
              <strong>{t('stats.dimensions.value')}</strong>
              <span>{t('stats.dimensions.label')}</span>
            </div>
          </div>

          <div className="stat-card">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="unlock" width="38" height="38" className="stat-custom-svg flex-shrink-0">
              <rect width="30" height="30" x="1" y="1" fill="#eef5fd" rx="5" ry="5"></rect>
              <path fill="#d7e2f2" d="M26,1H16V31H26a5,5,0,0,0,5-5V6A5,5,0,0,0,26,1Z"></path>
              <path fill="#c9c1f5" d="M21,15a1,1,0,0,1-1-1V11a4,4,0,0,0-4-4,4,4,0,0,0-3.92,3.2,1,1,0,0,1-2-.4A6,6,0,0,1,22,11v3A1,1,0,0,1,21,15Z"></path>
              <path fill="#afbdd6" d="M18.83,8.16A4,4,0,0,1,20,11v3a1,1,0,0,0,2,0V11a6,6,0,0,0-6-6V7A4,4,0,0,1,18.83,8.16Z"></path>
              <rect width="18" height="14" x="7" y="13" fill="#ffc661" rx="3" ry="3"></rect>
              <path fill="#e49f4e" d="M22,13H16V27h6a3,3,0,0,0,3-3V16A3,3,0,0,0,22,13Z"></path>
            </svg>
            <div>
              <strong>{t('stats.free.value')}</strong>
              <span>{t('stats.free.label')}</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works section-wrap" id="how-it-works">
        <div className="section-heading text-center">
          <h2>{t('howItWorks.title')}</h2>
          <p>{t('howItWorks.subtitle')}</p>
        </div>
        <motion.div className="steps-grid" {...scrollRevealProps}>
          {/* Task 40: Step 1 Color Combination SVG */}
          <div className="step-card">
            <div className="step-number">01</div>
            {/* Color Combination by Manojkumar Muthukumar https://iconscout.com/icons/color-combination */}
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

          {/* Task 41: Step 2 Flowchart SVG */}
          <div className="step-card">
            <div className="step-number">02</div>
            {/* Flowchart by Hillvector https://iconscout.com/icons/flowchart */}
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

      {/* RIASEC Dimensions Grid */}
      <section className="dimensions section-wrap relative pb-28 z-0" id="dimensions">
        <div className="section-heading">
          <h2>{t('dimensions.title')}</h2>
          <p>{t('dimensions.subtitle')}</p>
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

        {/* Static 3D Books PNG Asset */}
        <motion.div
          className="dimensions-book-asset"
          initial={{ opacity: 0, y: 60, scale: 0.92 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ amount: 0.2, margin: '0px 0px -15% 0px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src="/asset-book.png"
            alt=""
            aria-hidden="true"
          />
        </motion.div>
      </section>

      {/* FAQ Section (Task 42 & 43: Centered text & 1s smooth expandable accordion) */}
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

      <Footer onStart={onStart} />
    </>
  )
}
