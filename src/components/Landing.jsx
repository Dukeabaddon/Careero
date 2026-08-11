import Footer from './Footer.jsx'
import '../features/landing/shared/index.js'
import HeroStack from '../features/landing/hero/HeroStack.jsx'
import HowItWorksSection from '../features/landing/how-it-works/HowItWorksSection.jsx'
import DimensionsSection from '../features/landing/dimensions/DimensionsSection.jsx'
import FaqSection from '../features/landing/faq/FaqSection.jsx'

export default function Landing({ onStart }) {
  return (
    <>
      <HeroStack onStart={onStart} />
      <HowItWorksSection />
      <DimensionsSection />
      <FaqSection />
      <Footer onStart={onStart} />
    </>
  )
}
