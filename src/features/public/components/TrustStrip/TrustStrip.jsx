import './TrustStrip.css'

function TrustStrip({ items }) {
  return (
    <section className="trust-strip" aria-label="Cam kết tạo niềm tin">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <article className="trust-strip-item" key={item.label}>
            <Icon size={22} strokeWidth={2} aria-hidden="true" />
            <div>
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </div>
          </article>
        )
      })}
    </section>
  )
}

export default TrustStrip
