import StatusBadge from '../../../../components/status/StatusBadge'
import { money } from '../../../../utils/currency'

function QuickServicesPanel({
  onOpenServices,
  onPurchase,
  services = [],
}) {
  return (
    <section className="quick-services-panel">
      <div className="section-head">
        <div>
          <h2>Mua nhanh từ dịch vụ yêu thích và gần đây</h2>
        </div>
        <button type="button" onClick={onOpenServices}>Mở catalog</button>
      </div>
      <div className="quick-service-list">
        {services.map((service) => (
          <article className="quick-service-card" key={service.id}>
            <div>
              <span>{service.categoryName || service.type || 'Dịch vụ'}</span>
              <h3>{service.name}</h3>
            </div>
            <p>{service.shortDescription || service.description || 'Dịch vụ đang sẵn sàng xử lý theo quy trình Kendy Digital.'}</p>
            <div className="quick-service-meta">
              <strong>{service.priceText || money.format(service.price)}</strong>
              <StatusBadge status={service.stockStatus || service.status} />
            </div>
            <button
              type="button"
              disabled={service.status !== 'ACTIVE' || service.stockStatus === 'OUT_OF_STOCK'}
              onClick={() => onPurchase(service)}
            >
              Mua ngay
            </button>
          </article>
        ))}
        {services.length === 0 && <p className="admin-empty-state">Chưa có dịch vụ để gợi ý.</p>}
      </div>
    </section>
  )
}

export default QuickServicesPanel
