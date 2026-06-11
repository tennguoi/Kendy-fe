import { Clock3, Star } from 'lucide-react'
import StatusBadge from '../../../../components/status/StatusBadge'
import { money } from '../../../../utils/currency'

function ServiceCatalogCard({
  isFavorite,
  onPurchase,
  onToggleFavorite,
  service,
}) {
  const isDisabled = service.status !== 'ACTIVE' || service.stockStatus === 'OUT_OF_STOCK'

  return (
    <article className="service-card">
      <div className="service-head">
        <span>{service.categoryName || service.type || 'Dịch vụ'}</span>
        <StatusBadge status={service.status} />
      </div>
      <h2>{service.name}</h2>
      <p>{service.shortDescription || service.description || 'Dịch vụ đang được cập nhật mô tả.'}</p>
      <div className="service-detail-list">
        <span>
          <Clock3 size={15} strokeWidth={2} aria-hidden="true" />
          {service.processingTime || service.time || 'Theo quy trình'}
        </span>
        <StatusBadge status={service.stockStatus || 'AVAILABLE'} />
      </div>
      <div className="service-meta">
        <strong>{service.priceText || money.format(service.price)}</strong>
        <span>{service.pricingBadge || service.type || 'Chuẩn'}</span>
      </div>
      <div className="service-actions">
        <button type="button" disabled={isDisabled} onClick={() => onPurchase(service)}>
          Mua dịch vụ
        </button>
        <button
          type="button"
          className={isFavorite ? 'favorite active' : 'favorite'}
          title={isFavorite ? 'Bỏ ghim dịch vụ' : 'Ghim dịch vụ'}
          onClick={() => onToggleFavorite?.(service)}
        >
          <Star size={17} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

export default ServiceCatalogCard
