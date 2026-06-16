import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

function PublicServiceDetail({ slug: propSlug, notice, onLoginClick }) {
  const { slug: paramSlug } = useParams()
  const slug = propSlug || paramSlug
  const navigate = useNavigate()
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
        setError(err.message || 'Không thể tìm thấy dịch vụ được yêu cầu.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [slug])

  // Consolidate pricing display
  const formattedPrice = useMemo(() => {
    if (!service) return ''
    if (typeof service.price === 'number') {
      return `${Number(service.price).toLocaleString('vi-VN')}đ`
    } else if (service.price && !service.price.toString().includes('đ') && !isNaN(Number(service.price))) {
      return `${Number(service.price).toLocaleString('vi-VN')}đ`
    } else if (!service.price) {
      return service.priceText || 'Báo giá'
    }
    return service.price
  }, [service])

  if (loading) {
    return (
      <div className="public-home">
        <PublicHeader logo={heroImg} navItems={navItems} onLoginClick={onLoginClick} />
        <main style={{ minHeight: 'calc(100svh - 200px)', paddingTop: '160px' }}>
          <Loading message="Đang tải thông tin dịch vụ..." />
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
            <h2>Dịch Vụ Không Tồn Tại</h2>
            <p>{error || 'Thông tin gói dịch vụ này không khả dụng hoặc đã bị ẩn.'}</p>
            <div className="error-actions">
              <button onClick={() => navigate('/services')} className="btn-back">
                <ArrowLeft size={16} /> Quay lại danh sách
              </button>
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
            <a href="/">Trang chủ</a>
            <ChevronRight size={14} />
            <a href="/services">Dịch vụ</a>
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
                  {isFeatured && <span className="pub-badge featured">Nổi bật</span>}
                  <span className={`pub-badge ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                    {isOutOfStock ? 'Hết hàng' : 'Còn hàng'}
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
                  <h3 className="section-title"><Info size={18} /> Mô tả chi tiết</h3>
                  <div className="section-body text-block">
                    <p>{service.description}</p>
                  </div>
                </section>
              )}

              {/* Benefits */}
              {service.benefits && (
                <section className="detail-content-section">
                  <h3 className="section-title"><CheckCircle2 size={18} /> Lợi ích & Quyền lợi</h3>
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
                  <h3 className="section-title"><ShieldAlert size={18} /> Yêu cầu khi mua dịch vụ</h3>
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
                  <h3 className="section-title"><HelpCircle size={18} /> Lưu ý sử dụng quan trọng</h3>
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
                <span className="price-label">Giá trọn gói</span>
                <div className="product-price-display">{formattedPrice}</div>

                <div className="checkout-spec-list">
                  <div className="spec-item">
                    <Clock size={18} className="spec-icon" />
                    <div className="spec-content">
                      <strong>Thời gian xử lý dự kiến</strong>
                      <span>{service.processingTime || '5 - 30 phút'}</span>
                    </div>
                  </div>

                  <div className="spec-item">
                    <ShieldCheck size={18} className="spec-icon" />
                    <div className="spec-content">
                      <strong>Chế độ bảo hành</strong>
                      <span>{service.warrantyInfo || service.warranty || 'Bảo hành đầy đủ'}</span>
                    </div>
                  </div>
                </div>

                {service.refundPolicy && (
                  <div className="refund-policy-alert">
                    <AlertCircle size={16} />
                    <div className="alert-content">
                      <strong>Chính sách hoàn tiền:</strong>
                      <span>{service.refundPolicy}</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onLoginClick(service)}
                  disabled={isOutOfStock}
                  className="btn-checkout-cta"
                >
                  <ShoppingCart size={18} />
                  <span>{isOutOfStock ? 'Tạm hết hàng' : 'MUA NGAY'}</span>
                </button>

                <div className="checkout-guarantee-list">
                  <div className="guarantee-item">✓ Giao hàng tự động hoặc nhanh chóng</div>
                  <div className="guarantee-item">✓ Hỗ trợ kỹ thuật qua ticket 24/7</div>
                  <div className="guarantee-item">✓ Bảo hành đúng cam kết chính sách</div>
                </div>
              </div>
            </div>

          </div>

          {/* Related Products Section */}
          {relatedServices.length > 0 && (
            <section className="related-products-section">
              <h2 className="related-title">Sản phẩm tương tự</h2>
              <div className="related-grid">
                {relatedServices.map((item, idx) => {
                  const itemOutOfStock = item.status === 'Hết hàng' || item.stockStatus === 'OUT_OF_STOCK'
                  const itemPrice = typeof item.price === 'number'
                    ? `${Number(item.price).toLocaleString('vi-VN')}đ`
                    : item.priceText || 'Báo giá'
                  const itemCategory = item.categoryLabel || item.categoryName || 'Dịch vụ'

                  return (
                    <div className="related-card" key={item.id || idx}>
                      <span className="related-card-category">{itemCategory}</span>
                      <h4 className="related-card-title">{item.name}</h4>
                      <div className="related-card-footer">
                        <div className="related-card-price">{itemPrice}</div>
                        <button
                          type="button"
                          className="btn-related-action"
                          onClick={() => navigate(`/service/${item.slug}`)}
                        >
                          Chi tiết
                        </button>
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
