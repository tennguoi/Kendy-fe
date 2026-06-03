import StatusBadge from '../../components/status/StatusBadge'
import { money } from '../../utils/currency'

function ServicesView({ services, onPurchase }) {
  return (
    <section className="service-grid">
      {services.map((service) => (
        <article className="service-card" key={service.id}>
          <div className="service-head">
            <span>{service.type}</span>
            <StatusBadge status={service.status} />
          </div>
          <h2>{service.name}</h2>
          <p>{service.description}</p>
          <div className="service-meta">
            <strong>{money.format(service.price)}</strong>
            <span>{service.processingTime || service.time || 'Theo quy trình'}</span>
          </div>
          <button type="button" disabled={service.status !== 'ACTIVE'} onClick={() => onPurchase(service)}>
            Mua dịch vụ
          </button>
        </article>
      ))}
    </section>
  )
}

export default ServicesView
