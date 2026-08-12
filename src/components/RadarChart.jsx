import { useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { RIASEC_CODES } from '../utils/riasecScoring.js'

function point(index, radius, center = 120) {
  const angle = (Math.PI * 2 * index) / RIASEC_CODES.length - Math.PI / 2
  return [center + Math.cos(angle) * radius, center + Math.sin(angle) * radius]
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

export default function RadarChart({
  scores,
  strokeColor = '#2563eb',
  fillColor = 'rgba(37, 99, 235, 0.12)',
  duration = 1400,
}) {
  const rootRef = useRef(null)
  const inView = useInView(rootRef, { once: true, amount: 0.35 })
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!inView) return undefined

    let frameId = 0
    let start = 0

    const tick = (timestamp) => {
      if (!start) start = timestamp
      const next = easeOutCubic(Math.min(1, (timestamp - start) / duration))
      setProgress(next)
      if (next < 1) frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [inView, duration, scores])

  const maxScore = Math.max(33, ...Object.values(scores))
  const animatedScores = useMemo(
    () => Object.fromEntries(
      RIASEC_CODES.map((code) => [code, Number(scores?.[code] ?? 0) * progress]),
    ),
    [scores, progress],
  )

  const valuePoints = RIASEC_CODES
    .map((code, index) => point(index, (animatedScores[code] / maxScore) * 88).join(','))
    .join(' ')

  return (
    <div ref={rootRef} className="radar-chart-wrap">
      <svg
        className="radar-chart"
        viewBox="0 0 240 240"
        role="img"
        aria-label="RIASEC score radar chart"
      >
        {[22, 44, 66, 88].map((radius) => (
          <polygon
            key={radius}
            points={RIASEC_CODES.map((_, index) => point(index, radius).join(',')).join(' ')}
            className="radar-grid"
            fill="none"
            stroke="rgba(148, 163, 184, 0.45)"
            strokeWidth="1"
          />
        ))}
        {RIASEC_CODES.map((code, index) => {
          const [x, y] = point(index, 88)
          const [labelX, labelY] = point(index, 106)
          return (
            <g key={code}>
              <line x1="120" y1="120" x2={x} y2={y} className="radar-axis" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="1" />
              <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" className="radar-label">{code}</text>
            </g>
          )
        })}
        <polygon
          points={valuePoints}
          className="radar-value"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {RIASEC_CODES.map((code, index) => {
          const [x, y] = point(index, (animatedScores[code] / maxScore) * 88)
          return (
            <circle
              key={code}
              cx={x}
              cy={y}
              r={progress > 0.02 ? 4 : 0}
              className="radar-point"
              fill={strokeColor}
              stroke="#fff"
              strokeWidth="1.5"
            />
          )
        })}
      </svg>
    </div>
  )
}
