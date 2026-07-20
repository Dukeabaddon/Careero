import { RIASEC_CODES } from '../utils/riasecScoring.js'

function point(index, radius, center = 120) {
  const angle = (Math.PI * 2 * index) / RIASEC_CODES.length - Math.PI / 2
  return [center + Math.cos(angle) * radius, center + Math.sin(angle) * radius]
}

export default function RadarChart({ scores }) {
  const maxScore = Math.max(33, ...Object.values(scores))
  const valuePoints = RIASEC_CODES.map((code, index) => point(index, (scores[code] / maxScore) * 88).join(',')).join(' ')

  return (
    <svg className="radar-chart" viewBox="0 0 240 240" role="img" aria-label="RIASEC score radar chart">
      {[22, 44, 66, 88].map((radius) => (
        <polygon key={radius} points={RIASEC_CODES.map((_, index) => point(index, radius).join(',')).join(' ')} className="radar-grid" />
      ))}
      {RIASEC_CODES.map((code, index) => {
        const [x, y] = point(index, 88)
        const [labelX, labelY] = point(index, 106)
        return (
          <g key={code}>
            <line x1="120" y1="120" x2={x} y2={y} className="radar-axis" />
            <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle">{code}</text>
          </g>
        )
      })}
      <polygon points={valuePoints} className="radar-value" />
      {RIASEC_CODES.map((code, index) => {
        const [x, y] = point(index, (scores[code] / maxScore) * 88)
        return <circle key={code} cx={x} cy={y} r="4" className="radar-point" />
      })}
    </svg>
  )
}
