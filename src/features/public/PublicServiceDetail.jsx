import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Info,
  ShieldAlert,
  HelpCircle,
  ChevronRight,
  ShoppingCart,
  Sparkles,
} from 'lucide-react'
import heroImg from '../../assets/hero.png'
import { publicApi } from '../../api/public.api'
import PublicHeader from './components/PublicHeader/PublicHeader'
import PublicFooter from './components/PublicFooter/PublicFooter'
import { navItems } from './data/publicSiteContent'
import { footerGroups } from './data/policies.public'
import Loading from '../../components/Loading/Loading'
import Button from '../../components/Button/Button'
import './PublicServiceDetail.css'

function renderBulletPoints(text) {
  if (!text) return null
  return text
    .split('\n')
    .map((line) => line.trim().replace(/^-\s*/, ''))
    .filter(Boolean)
    .map((line, index) => (
      <li key={index} className="bullet-point-line">
        <CheckCircle2 size={15} className="bullet-icon-success" />
        <span>{line}</span>
      </li>
    ))
}

function PublicServiceDetail({ propSlug, notice, onLoginClick }) {
  const { slug: paramSlug } = useParams()
  const slug = propSlug || paramSlug
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [relatedServices, setRelatedServices] = useState([])

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!slug) return

    setLoading(true)
    setError(null)

    // Fetch single service details
    publicApi.getServiceBySlug(slug)
      .then((data) => {
        setService(data)
        
        // Fetch other active services for related section
        return publicApi.getServices({ limit: 12 })
      })
      .then((allServices) => {
        if (Array.isArray(allServices)) {
          // Filter out the current service and limit to 4 related services in same category if possible
          const filtered = allServices.filter((s) => s.slug !== slug)
          setRelatedServices(filtered.slice(0, 4))
        }
      })
      .catch((err) => {
        console.error('Error fetching service detail:', err)
        setError(err.message || t('services.noServicesMatch', { defaultValue: 'Không thể tìm thấy dịch vụ được yêu cầu.' }))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [slug, t])

  // Consolidate pricing display
  const formattedPrice = useMemo(() => {
    if (!service) return ''
    if (typeof service.price === 'number') {
      return `${Number(service.price).toLocaleString('vi-VN')}đ`
    } else if (service.price && !service.price.toString().includes('đ') && !isNaN(Number(service.price))) {
      return `${Number(service.price).toLocaleString('vi-VN')}đ`
    } else if (!service.price) {
      return service.priceText || t('services.buyNow', { defaultValue: 'Báo giá' })
    }
    return service.price
  }, [service, t])

  if (loading) {
    return (
      <div className="public-home">
        <PublicHeader logo={heroImg} navItems={navItems} onLoginClick={onLoginClick} />
        <main style={{ minHeight: 'calc(100svh - 200px)', paddingTop: '160px' }}>
          <Loading message={t('loading.loadingData')} />
        </main>
        <PublicFooter footerGroups={footerGroups} logo={heroImg} />
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="public-home">
        <PublicHeader logo={heroImg} navItems={navItems} onLoginClick={onLoginClick} />
        <main className="detail-error-container">
          <div className="error-card">
            <AlertCircle size={48} className="error-icon" />
            <h2>{t('services.noServicesMatch', { defaultValue: 'Dịch Vụ Không Tồn Tại' })}</h2>
            <p>{error || t('services.noServicesMatch', { defaultValue: 'Thông tin gói dịch vụ này không khả dụng hoặc đã bị ẩn.' })}</p>
            <div className="error-actions">
              <Button onClick={() => navigate('/services')} variant="" className="btn-back">
                <ArrowLeft size={16} /> {t('common.back', { defaultValue: 'Quay lại danh sách' })}
              </Button>
            </div>
          </div>
        </main>
        <PublicFooter footerGroups={footerGroups} logo={heroImg} />
      </div>
    )
  }

  const isOutOfStock = service.status === 'Hết hàng' || service.stockStatus === 'OUT_OF_STOCK'
  const isFeatured = service.featured || service.badge === 'Nổi bật'
  const categoryLabel = service.categoryName || service.type || 'Dịch vụ'

  return (
    <div className="public-home">
      <PublicHeader logo={heroImg} navItems={navItems} onLoginClick={onLoginClick} />

      <main className="detail-page-main">
        <div className="detail-container">
          {/* Breadcrumbs */}
          <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
            <a href="/">{t('auth.homePage', { defaultValue: 'Trang chủ' })}</a>
            <ChevronRight size={14} />
            <a href="/services">{t('nav.services', { defaultValue: 'Dịch vụ' })}</a>
            <ChevronRight size={14} />
            <span>{categoryLabel}</span>
            <ChevronRight size={14} />
            <span className="current">{service.name}</span>
          </nav>

          {/* Product Info Columns */}
          <div className="detail-layout">
            
            {/* Left Column: Product Info details */}
            <div className="detail-info-left">
              <div className="product-title-section">
                <span className="product-category">{categoryLabel}</span>
                <h1 className="product-name">{service.name}</h1>
                <div className="product-badges">
                  {isFeatured && <span className="pub-badge featured">{t('status.NEW', { defaultValue: 'Nổi bật' })}</span>}
                  <span className={`pub-badge ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                    {isOutOfStock ? t('services.outOfStock', { defaultValue: 'Hết hàng' }) : t('status.AVAILABLE', { defaultValue: 'Còn hàng' })}
                  </span>
                </div>
              </div>

              {/* Short Description */}
              {service.shortDescription && (
                <div className="product-summary-desc">
                  <p>{service.shortDescription}</p>
                </div>
              )}

              {/* Detailed Description */}
              {service.description && (
                <section className="detail-content-section">
                  <h3 className="section-title"><Info size={18} /> {t('common.details', { defaultValue: 'Mô tả chi tiết' })}</h3>
                  <div className="section-body text-block">
                    <p>{service.description}</p>
                  </div>
                </section>
              )}

              {/* Benefits */}
              {service.benefits && (
                <section className="detail-content-section">
                  <h3 className="section-title"><CheckCircle2 size={18} /> {t('services.benefitsTitle', { defaultValue: 'Lợi ích & Quyền lợi' })}</h3>
                  <div className="section-body">
                    <ul className="bullet-list-container">
                      {renderBulletPoints(service.benefits)}
                    </ul>
                  </div>
                </section>
              )}

              {/* Requirements */}
              {service.requirements && (
                <section className="detail-content-section">
                  <h3 className="section-title"><ShieldAlert size={18} /> {t('checkout.inputRequirements', { defaultValue: 'Yêu cầu khi mua dịch vụ' })}</h3>
                  <div className="section-body">
                    <ul className="bullet-list-container">
                      {renderBulletPoints(service.requirements)}
                    </ul>
                  </div>
                </section>
              )}

              {/* Usage Notes */}
              {service.usageNotes && (
                <section className="detail-content-section">
                  <h3 className="section-title"><HelpCircle size={18} /> {t('services.usageNotesTitle', { defaultValue: 'Lưu ý sử dụng quan trọng' })}</h3>
                  <div className="section-body">
                    <ul className="bullet-list-container">
                      {renderBulletPoints(service.usageNotes)}
                    </ul>
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Sticky Checkout box */}
            <div className="detail-checkout-right">
              <div className="sticky-checkout-pane">
                <span className="price-label">{t('checkout.servicePrice', { defaultValue: 'Giá trọn gói' })}</span>
                <div className="product-price-display">{formattedPrice}</div>

                <div className="checkout-spec-list">
                  <div className="spec-item">
                    <Clock size={18} className="spec-icon" />
                    <div className="spec-content">
                      <strong>{t('services.processingTimeLabel', { defaultValue: 'Thời gian xử lý dự kiến' })}</strong>
                      <span>{service.processingTime || '5 - 30 phút'}</span>
                    </div>
                  </div>

                  <div className="spec-item">
                    <ShieldCheck size={18} className="spec-icon" />
                    <div className="spec-content">
                      <strong>{t('nav.warranty', { defaultValue: 'Chế độ bảo hành' })}</strong>
                      <span>{service.warrantyInfo || service.warranty || t('status.WARRANTY', { defaultValue: 'Bảo hành đầy đủ' })}</span>
                    </div>
                  </div>
                </div>

                {service.refundPolicy && (
                  <div className="refund-policy-alert">
                    <AlertCircle size={16} />
                    <div className="alert-content">
                      <strong>{t('services.refundPolicyLabel', { defaultValue: 'Chính sách hoàn tiền:' })}</strong>
                      <span>{service.refundPolicy}</span>
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  onClick={() => onLoginClick(service)}
                  disabled={isOutOfStock}
                  className="btn-checkout-cta"
                >
                  <ShoppingCart size={18} />
                  <span>{isOutOfStock ? t('services.outOfStock', { defaultValue: 'Tạm hết hàng' }) : t('services.buyNow', { defaultValue: 'MUA NGAY' })}</span>
                </Button>

                <div className="checkout-guarantee-list">
                  <div className="guarantee-item">{t('services.guaranteeAuto', { defaultValue: '✓ Giao hàng tự động hoặc nhanh chóng' })}</div>
                  <div className="guarantee-item">{t('services.guaranteeSupport', { defaultValue: '✓ Hỗ trợ kỹ thuật qua ticket 24/7' })}</div>
                  <div className="guarantee-item">{t('services.guaranteeWarranty', { defaultValue: '✓ Bảo hành đúng cam kết chính sách' })}</div>
                </div>
              </div>
            </div>

          </div>

          {/* Related Products Section */}
          {relatedServices.length > 0 && (
            <section className="related-products-section">
              <h2 className="related-title">{t('services.relatedTitle', { defaultValue: 'Sản phẩm tương tự' })}</h2>
              <div className="related-grid">
                {relatedServices.map((item, idx) => {
                  const itemOutOfStock = item.status === 'Hết hàng' || item.stockStatus === 'OUT_OF_STOCK'
                  const itemPrice = typeof item.price === 'number'
                    ? `${Number(item.price).toLocaleString('vi-VN')}đ`
                    : item.priceText || t('services.buyNow', { defaultValue: 'Báo giá' })
                  const itemCategory = item.categoryLabel || item.categoryName || 'Dịch vụ'

                  return (
                    <div className="related-card" key={item.id || idx}>
                      <span className="related-card-category">{itemCategory}</span>
                      <h4 className="related-card-title">{item.name}</h4>
                      <div className="related-card-footer">
                        <div className="related-card-price">{itemPrice}</div>
                        <Button
                          variant=""
                          className="btn-related-action"
                          onClick={() => navigate(`/service/${item.slug}`)}
                        >
                          {t('common.details', { defaultValue: 'Chi tiết' })}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

        </div>
      </main>

      <PublicFooter footerGroups={footerGroups} logo={heroImg} />
    </div>
  )
}

export default PublicServiceDetail
