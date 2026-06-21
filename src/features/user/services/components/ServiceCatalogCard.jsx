import { Clock3, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import StatusBadge from '../../../../components/status/StatusBadge'
import { money } from '../../../../utils/currency'
import { getServiceTypeLabel } from '../services.constants'
import { isServiceOutOfStock } from '../services.utils'

function ServiceCatalogCard({
  isFavorite,
  onPurchase,
  onToggleFavorite,
  service,
}) {
  const { t } = useTranslation()
  const isDisabled = service.status !== 'ACTIVE' || isServiceOutOfStock(service)
  const outOfStock = isServiceOutOfStock(service)

  const getServiceTypeTranslation = (type) => {
    const keyMap = {
      ACCOUNT_STOCK: 'services.typeAccountStock',
      MANUAL: 'services.typeManual',
      AUTO: 'services.typeAuto',
      SUBSCRIPTION: 'services.typeSubscription',
      API_CREDIT: 'services.typeApiCredit'
    }
    return keyMap[type] ? t(keyMap[type]) : getServiceTypeLabel(type)
  }

  const actionLabel = service.type === 'ACCOUNT_STOCK'
    ? t('services.buyAndReceive', { defaultValue: 'Mua và nhận ngay' })
    : service.type === 'MANUAL'
      ? t('services.orderService', { defaultValue: 'Đặt dịch vụ' })
      : t('services.buyNow', { defaultValue: 'Mua ngay' })

  return (
    <article className={`service-card${outOfStock ? ' out-of-stock' : ''}`}>
      {outOfStock && <span className="badge-out-of-stock">{t('services.outOfStock', { defaultValue: 'Hết hàng' })}</span>}
      <div className="service-head">
        <span>{service.categoryName || getServiceTypeTranslation(service.type) || t('common.service', { defaultValue: 'Dịch vụ' })}</span>
        <StatusBadge status={service.status} />
      </div>
      <h2>{service.name}</h2>
      <p>{service.shortDescription || service.description || t('services.defaultDescription', { defaultValue: 'Dịch vụ đang được cập nhật mô tả.' })}</p>
      <div className="service-detail-list">
        <span>
          <Clock3 size={15} strokeWidth={2} aria-hidden="true" />
          {service.processingTime || service.time || t('services.defaultProcessingTime', { defaultValue: 'Theo quy trình' })}
        </span>
        <StatusBadge status={service.stockStatus || 'AVAILABLE'} />
      </div>
      <div className="service-meta">
        <strong>{service.priceText || money.format(service.price)}</strong>
        <span className="badge-pricing">
          {service.pricingBadge || service.type || t('services.pricingStandard', { defaultValue: 'Chuẩn' })}
        </span>
      </div>
      <div className="service-actions">
        <button type="button" disabled={isDisabled} onClick={() => onPurchase(service)}>
          {actionLabel}
        </button>
        <button
          type="button"
          className={isFavorite ? 'favorite active' : 'favorite'}
          title={isFavorite ? t('services.unfavorite', { defaultValue: 'Bỏ ghim dịch vụ' }) : t('services.favorite', { defaultValue: 'Ghim dịch vụ' })}
          onClick={() => onToggleFavorite?.(service)}
        >
          <Star size={17} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

export default ServiceCatalogCard
