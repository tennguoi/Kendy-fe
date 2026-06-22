import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ShoppingCart,
  AlertTriangle,
} from 'lucide-react'
import { publicApi } from '../../../../api/public.api'
import {
  featuredServices as staticFeatured,
  serviceTableRows as staticRows,
} from '../../data/services.public'
import Button from '../../../../components/Button/Button'
import './ProductDetail.css'

function ProductDetail({ onLoginClick }) {
  const { t } = useTranslation()
  const { slug } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    setService(null)

    publicApi.getServices()
      .then((services) => {
        const list = Array.isArray(services) ? services : []
        const found = list.find(
          (s) => s.slug === slug || String(s.id) === slug || s.name === decodeURIComponent(slug)
        )
        if (found) {
          setService(found)
        } else {
          setError(t('public.productDetail.notFoundExact'))
        }
        setLoading(false)
      })
      .catch(() => {
        const decoded = decodeURIComponent(slug)
        const found = staticFeatured.find((s) => s.name === decoded)
          || staticRows.find((s) => s.name === decoded)
        if (found) {
          setService(found)
        } else {
          setError(t('public.productDetail.notFound'))
        }
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-loading">
          <div className="product-detail-spinner" />
          <p>{t('public.productDetail.loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-error">
          <AlertTriangle size={48} strokeWidth={1.5} />
          <h3>{error || t('public.productDetail.notFound')}</h3>
          <Button variant="ghost" className="product-detail-back-btn" onClick={() => navigate('/catalog')}>
            <ArrowLeft size={18} strokeWidth={2} />
            <span>{t('public.productDetail.backToCatalog')}</span>
          </Button>
        </div>
      </div>
    )
  }

  const price = service.priceText || `Từ ${Number(service.price).toLocaleString('vi-VN')}đ`
  const categoryName = service.categoryName || service.type || t('public.productDetail.defaultCategory')
  const stockStatus = service.stockStatus === 'OUT_OF_STOCK' ? t('public.productDetail.outOfStock') : service.stockStatus === 'CONSULTING_ONLY' ? t('public.productDetail.consulting') : t('public.productDetail.inStock')
  const isOutOfStock = service.stockStatus === 'OUT_OF_STOCK'

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        
        {/* Nút quay lại */}
        <Button variant="ghost" className="product-detail-back-btn" onClick={() => navigate('/catalog')}>
          <ArrowLeft size={18} strokeWidth={2} />
          <span>{t('public.productDetail.backToCatalog')}</span>
        </Button>

        {/* Banner hết hàng */}
        {isOutOfStock && (
          <div className="product-oos-banner">
            <AlertTriangle size={18} />
            <span>{t('public.productDetail.outOfStockBanner')}</span>
          </div>
        )}

        {/* PHẦN TRÊN: Thông tin mua hàng (2 cột) */}
        <div className="product-main-card">
          {/* Cột trái: Ảnh minh họa lớn */}
          <div className="product-image-column">
            {service.iconUrl ? (
              <img src={service.iconUrl} alt={service.name} className="product-main-img" />
            ) : (
              <div className="product-image-fallback">
                <span>{service.name}</span>
              </div>
            )}
            <span className="image-zoom-hint">{t('public.productDetail.imageHint')}</span>
          </div>

          {/* Cột phải: Thông tin & nút mua */}
          <div className="product-info-column">
            <span className="product-category-tag">{categoryName}</span>
            <h1 className="product-title-main">{service.name}</h1>
            
            <div className="product-meta-rows">
              <div className="meta-item-row">
                <span className="meta-label">{t('public.productDetail.statusLabel')}</span>
                <span className={`meta-value stock-status ${isOutOfStock ? 'out' : 'in'}`}>
                  {stockStatus}
                </span>
              </div>
              <div className="meta-item-row">
                <span className="meta-label">{t('public.productDetail.productCodeLabel')}</span>
                <span className="meta-value code">{service.slug || service.id}</span>
              </div>
              <div className="meta-item-row">
                <span className="meta-label">{t('public.productDetail.categoryLabel')}</span>
                <span className="meta-value category">{categoryName}</span>
              </div>
            </div>

            <div className="product-price-section">
              <div className="price-main-row">
                <span className="price-actual">{price}</span>
              </div>
            </div>

            <div className="product-purchase-action">
              <Button
                variant="primary"
                className="btn-buy-now-detail"
                disabled={isOutOfStock}
                onClick={onLoginClick}
              >
                <ShoppingCart size={20} />
                <span>{isOutOfStock ? t('public.productDetail.outOfStock') : t('public.productDetail.buyNow')}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* PHẦN DƯỚI: Lưu ý & Chi tiết (Layout Layout Divine Shop) */}
        
        {/* Khung Lưu ý */}
        {(service.usageNotes || service.requirements) && (
          <div className="product-notice-box">
            <div className="notice-title">
              <AlertTriangle size={18} />
              <span>{t('public.productDetail.importantNote')}</span>
            </div>
            <div className="notice-content">
              {service.usageNotes ? (
                <div className="notice-text">{service.usageNotes}</div>
              ) : (
                <ul className="notice-list">
                  {parseListContent(service.requirements).map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Khối Chi tiết sản phẩm (Layout 2 cột) */}
        <div className="product-detail-layout-row">
          <div className="layout-left-title">
            <h3>{t('public.productDetail.detailTitle')}</h3>
          </div>
          <div className="layout-right-content">
            {/* Quy trình nhận hàng */}
            {service.requirements && (
              <div className="content-subsection">
                <h4>{t('public.productDetail.deliveryProcess')}</h4>
                <ol className="processing-steps-list">
                  {parseListContent(service.requirements).map((step, idx) => (
                    <li key={idx}>
                      <span className="step-num">{idx + 1}.</span>
                      <span className="step-text">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Mô tả chi tiết */}
            {service.description && (
              <div className="content-subsection">
                <h4>{t('public.productDetail.description')}</h4>
                <div className="formatted-desc-text">{service.description}</div>
              </div>
            )}

            {/* Tính năng nổi bật */}
            {service.benefits && (
              <div className="content-subsection">
                <h4>{t('public.productDetail.features')}</h4>
                <ul className="benefits-bullet-list">
                  {parseListContent(service.benefits).map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Khối Chính sách bảo hành (Layout 2 cột) */}
        {(service.warrantyPolicy || service.nonWarrantyCases) && (
          <div className="product-detail-layout-row border-top">
            <div className="layout-left-title">
              <h3>{t('public.productDetail.warrantyPolicy')}</h3>
            </div>
            <div className="layout-right-content">
              {service.warrantyPolicy && (
                <div className="content-subsection">
                  <h4>{t('public.productDetail.warrantyDuration')}</h4>
                  <div className="warranty-duration-text">{service.warrantyPolicy}</div>
                </div>
              )}

              {service.nonWarrantyCases && (
                <div className="content-subsection">
                  <h4>{t('public.productDetail.nonWarrantyCases')}</h4>
                  <ul className="non-warranty-list">
                    {parseListContent(service.nonWarrantyCases).map((caseItem, i) => (
                      <li key={i}>{caseItem}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

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

export default ProductDetail
