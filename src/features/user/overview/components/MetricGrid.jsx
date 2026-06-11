function MetricGrid({ metrics = [] }) {
  return (
    <section className="metric-grid">
      {metrics.map((metric) => (
        <article className={`metric ${metric.tone}`} key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </article>
      ))}
    </section>
  )
}

export default MetricGrid
