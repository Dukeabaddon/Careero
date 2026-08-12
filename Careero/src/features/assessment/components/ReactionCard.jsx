import { useState } from 'react'
import { useGifFirstFrame } from '@/features/assessment/hooks/useGifFirstFrame.js'

export default function ReactionCard({ config, label, isSelected, onClick, onDoubleClick }) {
  const [isHovered, setIsHovered] = useState(false)
  const posterSrc = useGifFirstFrame(config.gif)
  const allowHoverPlayback = config.value !== 1
  const shouldAnimate = isSelected || (allowHoverPlayback && isHovered)

  return (
    <button
      type="button"
      className={`reaction-gif-card ${isSelected ? 'active' : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`rating-${config.value}-btn`}
    >
      <div className="gif-rounded-thumb">
        <img
          src={shouldAnimate ? config.gif : (posterSrc || config.gif)}
          alt={label}
          className="reaction-gif-img"
        />
      </div>
      <span className="reaction-label">{label}</span>
    </button>
  )
}
