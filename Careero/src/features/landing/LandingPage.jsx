import Footer from './components/Footer.jsx'
import './shared/index.js'
import HeroStack from './hero/HeroStack.jsx'
import HowItWorksSection from './how-it-works/HowItWorksSection.jsx'
import DimensionsSection from './dimensions/DimensionsSection.jsx'
import FaqSection from './faq/FaqSection.jsx'

export default function LandingPage({ onStart }) {
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
