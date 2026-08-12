import HeroSection from './HeroSection.jsx'
import StatsStrip from '../stats-strip/StatsStrip.jsx'
import './HeroSection.css'

export default function HeroStack({ onStart }) {
  return (
    <div className="hero-stack">
      <HeroSection onStart={onStart} />
      <StatsStrip />
    </div>
  )
}
