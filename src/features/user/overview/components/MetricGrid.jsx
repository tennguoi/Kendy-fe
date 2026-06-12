import { Bell, Clock3, CreditCard, MessageSquareText } from 'lucide-react'

const metricIcons = {
  blue: MessageSquareText,
  green: CreditCard,
  orange: Clock3,
  red: Bell,
}

function MetricGrid({ metrics = [] }) {
  return (
    <section className="metric-grid">
      {metrics.map((metric) => (
        <article className={`metric ${metric.tone}`} key={metric.label}>
          <div className="metric-head">
            <span>{metric.label}</span>
            <MetricIcon tone={metric.tone} />
          </div>
          <strong>{metric.value}</strong>
          <small>{metric.detail}</small>
          <div className="metric-progress" aria-hidden="true">
            <span style={{ width: `${metric.progress ?? 42}%` }} />
          </div>
        </article>
      ))}
    </section>
  )
}

function MetricIcon({ tone }) {
  const Icon = metricIcons[tone] || CreditCard
  return (
    <span className="metric-icon">
      <Icon size={18} strokeWidth={2.2} />
    </span>
  )
}

export default MetricGrid
