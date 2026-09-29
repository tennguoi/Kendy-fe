import { useTranslation } from 'react-i18next'
import { compactDate, pickNumber, safeArray } from '../overview.utils'
import EmptyState from './EmptyState'

function AreaChart({
  rows = [],
  keys = ['grossRevenue'],
  labelKey = 'date',
  valueFormatter = (v) => v,
  tone = 'blue',
}) {
  const { t } = useTranslation()
  const data = safeArray(rows)
  if (!data.length) return <EmptyState text="Chưa có dữ liệu biểu đồ." />

  const width = 720
  const height = 260
  const padding = { top: 20, right: 18, bottom: 42, left: 76 }
  const values = data.map((row) => pickNumber(row, keys))
  const max = Math.max(1, ...values)
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const points = data.map((row, index) => {
    const x = padding.left + (data.length <= 1 ? innerW / 2 : (index / (data.length - 1)) * innerW)
    const y = padding.top + (1 - values[index] / max) * innerH
    return { x, y, row, value: values[index] }
  })
  const linePath = points.map((p, index) => `${index === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${points.at(-1).x.toFixed(1)},${height - padding.bottom} L${points[0].x.toFixed(1)},${height - padding.bottom} Z`
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: padding.top + (1 - ratio) * innerH,
    value: Math.round(max * ratio),
  }))

  return (
    <svg
      className={`ov-area-chart ov-chart-${tone}`}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={t('admin.overview.revenueChart.title')}
    >
      {ticks.map((tick) => (
        <g key={tick.y}>
          <line x1={padding.left} x2={width - padding.right} y1={tick.y} y2={tick.y} />
          <text x={padding.left - 12} y={tick.y + 4}>
            {valueFormatter(tick.value)}
          </text>
        </g>
      ))}
      <path className="ov-area-fill" d={areaPath} />
      <path className="ov-area-line" d={linePath} />
      {points.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r="4.5">
          <title>{`${point.row?.[labelKey] || index + 1}: ${valueFormatter(point.value)}`}</title>
        </circle>
      ))}
      {points
        .filter((_, index) => index % 2 === 0 || index === points.length - 1)
        .map((point, index) => (
          <text className="ov-x-label" key={`${point.x}-${index}`} x={point.x} y={height - 12}>
            {compactDate(point.row?.[labelKey])}
          </text>
        ))}
    </svg>
  )
}

export default AreaChart
