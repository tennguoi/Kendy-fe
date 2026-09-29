import { percent } from '../overview.utils'

function Donut({ value, total, label, tone = 'blue' }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const pct = percent(value, total)
  const dash = (pct / 100) * circumference

  return (
    <div className={`ov-donut ov-chart-${tone}`}>
      <svg viewBox="0 0 112 112" aria-hidden="true">
        <circle cx="56" cy="56" r={radius} className="ov-donut-track" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          className="ov-donut-fill"
          style={{ strokeDasharray: `${dash} ${circumference}` }}
        />
        <text x="56" y="52">{pct}%</text>
        <text x="56" y="70" className="ov-donut-label">{label}</text>
      </svg>
    </div>
  )
}

export default Donut
