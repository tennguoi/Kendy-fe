function MetricCard({ icon: Icon, label, value, hint, tone = 'blue', trend, onClick }) {
  return (
    <article
      className={`ov-card ov-metric ov-tone-${tone}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="ov-icon">
        <Icon size={21} strokeWidth={2.2} />
      </div>
      <div className="ov-metric-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
      {trend && <em>{trend}</em>}
    </article>
  )
}

export default MetricCard
