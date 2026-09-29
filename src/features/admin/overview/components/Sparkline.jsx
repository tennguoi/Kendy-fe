import { pickNumber, safeArray } from '../overview.utils'

function Sparkline({ rows = [], keys = ['value'], tone = 'blue' }) {
  const data = safeArray(rows)
  const values = data.map((row) => pickNumber(row, keys))
  if (!values.length) return <div className="ov-sparkline-empty" />
  const max = Math.max(1, ...values)
  const points = values
    .map((value, index) => {
      const x = values.length <= 1 ? 50 : (index / (values.length - 1)) * 100
      const y = 84 - (value / max) * 70
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      className={`ov-sparkline ov-chart-${tone}`}
      viewBox="0 0 100 90"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline points={points} />
    </svg>
  )
}

export default Sparkline
