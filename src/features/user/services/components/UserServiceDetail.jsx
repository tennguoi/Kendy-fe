import { AlertTriangle, ArrowLeft, Clock3, ShoppingCart, Star, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import StatusBadge from '../../../../components/status/StatusBadge'
import { money } from '../../../../utils/currency'
import { getServiceTypeLabel } from '../services.constants'
import { isServiceOutOfStock } from '../services.utils'

function parseListContent(content) {
  if (typeof content === 'string') {
    return content
      .split('\n')
      .map((line) => line.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean)
  }
  if (Array.isArray(content)) return content
  return [String(content)]
}

function UserServiceDetail({
  isFavorite,
  onPurchase,
  onToggleFavorite,
  service,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const outOfStock = isServiceOutOfStock(service)
  const price = service.priceText || money.format(service.price)
  const categoryName = service.categoryName || getServiceTypeLabel(service.type) || t('common.service', { defaultValue: 'Dịch vụ' })

  if (!service) {
    return (
      <div className="user-service-detail">
        <div className="user-service-detail-error">
          <AlertTriangle size={48} strokeWidth={1.5} />
          <h3>{t('services.notFound', { defaultValue: 'Không tìm thấy dịch vụ' })}</h3>
          <button type="button" className="admin-icon-button" onClick={() => navigate('/services')} style={{ marginTop: '12px' }}>
            <ArrowLeft size={18} strokeWidth={2} />
            <span>{t('common.back', { defaultValue: 'Quay lại' })}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="user-service-detail">
      <div className="user-service-detail-container">
        <button type="button" className="admin-icon-button" onClick={() => navigate('/services')} style={{ marginBottom: '16px', height: '34px', minHeight: '34px', fontSize: '13px' }}>
          <ArrowLeft size={18} strokeWidth={2} />
          <span>{t('common.back', { defaultValue: 'Quay lại danh mục' })}</span>
        </button>

        {outOfStock && (
          <div className="user-service-oos-banner">
            <AlertTriangle size={18} />
            <span>{t('services.outOfStockBanner', { defaultValue: 'Dịch vụ này hiện đang hết hàng.' })}</span>
          </div>
        )}

        <div className="user-service-main-card">
          <div className="user-service-image-column">
            {service.iconUrl ? (
              <img src={service.iconUrl} alt={service.name} className="user-service-main-img" />
            ) : (
              <div className="user-service-image-fallback">
                <ShieldCheck size={48} strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className="user-service-info-column">
            <span className="user-service-category-tag">{categoryName}</span>
            <h1 className="user-service-title-main">{service.name}</h1>

            <div className="user-service-meta-rows">
              <div className="user-service-meta-item">
                <span className="user-service-meta-label">{t('common.status', { defaultValue: 'Tình trạng' })}:</span>
                <StatusBadge status={service.stockStatus || 'AVAILABLE'} />
              </div>
              <div className="user-service-meta-item">
                <span className="user-service-meta-label">{t('services.processingTime', { defaultValue: 'Xử lý' })}:</span>
                <span className="user-service-meta-value">
                  <Clock3 size={15} strokeWidth={2} />
                  {service.processingTime || service.time || t('services.defaultProcessingTime', { defaultValue: 'Theo quy trình' })}
                </span>
              </div>
              {service.warrantyPolicy && (
                <div className="user-service-meta-item">
                  <span className="user-service-meta-label">{t('common.warranty', { defaultValue: 'Bảo hành' })}:</span>
                  <span className="user-service-meta-value">{service.warrantyPolicy}</span>
                </div>
              )}
            </div>

            <div className="user-service-price-section">
              <div className="user-service-price-row">
                <span className="user-service-price-actual">{price}</span>
                {service.pricingBadge && (
                  <span className="badge-pricing">{service.pricingBadge}</span>
                )}
              </div>
            </div>

            <div className="user-service-purchase-actions">
              <button
                type="button"
                className="admin-primary-button"
                disabled={outOfStock || service.status !== 'ACTIVE'}
                onClick={() => onPurchase(service)}
                style={{ height: '40px', minHeight: '40px' }}
              >
                <ShoppingCart size={20} />
                <span>{outOfStock ? t('services.outOfStock', { defaultValue: 'Hết hàng' }) : t('services.buyNow', { defaultValue: 'Mua ngay' })}</span>
              </button>
              <button
                type="button"
                className={`admin-icon-button${isFavorite ? ' favorite-active' : ''}`}
                onClick={() => onToggleFavorite?.(service)}
                title={isFavorite ? t('services.unfavorite', { defaultValue: 'Bỏ ghim' }) : t('services.favorite', { defaultValue: 'Ghim' })}
                style={{ height: '40px', minHeight: '40px', width: '40px' }}
              >
                <Star size={18} strokeWidth={2} fill={isFavorite ? 'var(--kd-warning, #f59e0b)' : 'none'} />
              </button>
            </div>
          </div>
        </div>

        {service.shortDescription && (
          <div className="user-service-section">
            <p className="user-service-description-text">{service.shortDescription}</p>
          </div>
        )}

        {(service.usageNotes || service.requirements) && (
          <div className="user-service-section user-service-notice-box">
            <div className="user-service-notice-title">
              <AlertTriangle size={18} />
              <span>{t('services.importantNote', { defaultValue: 'Lưu ý quan trọng' })}</span>
            </div>
            <div className="user-service-notice-content">
              {service.usageNotes ? (
                <p>{service.usageNotes}</p>
              ) : (
                <ul>
                  {parseListContent(service.requirements).map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {service.description && (
          <div className="user-service-section">
            <h3>{t('common.description', { defaultValue: 'Mô tả chi tiết' })}</h3>
            <div className="user-service-description-text">{service.description}</div>
          </div>
        )}

        {service.benefits && (
          <div className="user-service-section">
            <h3>{t('services.features', { defaultValue: 'Tính năng nổi bật' })}</h3>
            <ul className="user-service-benefits-list">
              {parseListContent(service.benefits).map((benefit, i) => (
                <li key={i}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        {(service.warrantyPolicy || service.nonWarrantyCases) && (
          <div className="user-service-section">
            <h3>{t('common.warranty', { defaultValue: 'Chính sách bảo hành' })}</h3>
            {service.warrantyPolicy && (
              <div className="user-service-warranty-block">
                <strong>{t('services.warrantyDuration', { defaultValue: 'Thời hạn bảo hành' })}</strong>
                <p>{service.warrantyPolicy}</p>
              </div>
            )}
            {service.nonWarrantyCases && (
              <div className="user-service-warranty-block">
                <strong>{t('services.nonWarrantyCases', { defaultValue: 'Các trường hợp không bảo hành' })}</strong>
                <ul>
                  {parseListContent(service.nonWarrantyCases).map((caseItem, i) => (
                    <li key={i}>{caseItem}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserServiceDetail
