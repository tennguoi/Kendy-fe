function TrustStats({ stats }) {
  return (
    <section className="trust-stats" aria-label="Thống kê tin cậy">
      {stats.map((item) => (
        <article className="trust-stat-card" key={item.label}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
          <p>{item.detail}</p>
        </article>
      ))}
    </section>
  )
}

export default TrustStats
