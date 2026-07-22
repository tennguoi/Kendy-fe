import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Eye, Sparkles, ArrowRight } from 'lucide-react'
import Button from '../../../../components/Button/Button'
import './ServiceCatalog.css'

function ServiceCatalog({ services = [], onPurchaseClick }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Format all services consistently for display and page details
  const formattedServices = useMemo(() => {
    return services.map((s) => {
      // Determine category slug from name or type
      let categorySlug = 'default'
      const nameLower = (s.categoryName || s.type || s.category || '').toLowerCase()
      if (nameLower.includes('capcut')) categorySlug = 'capcut'
      else if (nameLower.includes('facebook')) categorySlug = 'facebook'
      else if (nameLower.includes('nâng cấp') || nameLower.includes('upgrade')) categorySlug = 'upgrade'
      else if (nameLower.includes('quảng cáo') || nameLower.includes('ads') || nameLower.includes('advertising')) categorySlug = 'ads'

      // Unify price format (if number, convert to VND format)
      let formattedPrice = s.price
      if (typeof s.price === 'number') {
        formattedPrice = `${Number(s.price).toLocaleString('vi-VN')}đ`
      } else if (s.price && !s.price.includes('đ') && !isNaN(Number(s.price))) {
        formattedPrice = `${Number(s.price).toLocaleString('vi-VN')}đ`
      } else if (!s.price) {
        formattedPrice = s.priceText || t('services.buyNow', { defaultValue: 'Báo giá' })
      }

      // Generate slug fallback for static/API services if they don't have it
      const computedSlug = s.slug || (s.name || '').toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese accents
        .replace(/[^a-z0-9\s-]/g, '') // remove special characters
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      // Translate category labels if default
      let categoryLabel = s.categoryLabel || s.categoryName || s.type || s.category || 'Dịch vụ'
      if (categorySlug === 'capcut') {
        categoryLabel = t('public.policies.service.link1', { defaultValue: 'Tài khoản CapCut' })
      } else if (categorySlug === 'facebook') {
        categoryLabel = t('public.policies.service.link2', { defaultValue: 'Tài khoản Facebook' })
      } else if (categorySlug === 'upgrade') {
        categoryLabel = t('public.policies.service.link3', { defaultValue: 'Nâng cấp tài khoản' })
      } else if (categorySlug === 'ads') {
        categoryLabel = t('public.policies.service.link4', { defaultValue: 'Chạy quảng cáo Facebook' })
      }

      return {
        ...s,
        category: s.category || categorySlug,
        categoryLabel,
        price: formattedPrice,
        slug: computedSlug,
        processingTime: s.processingTime || t('services.defaultDescription'),
        warranty: s.warranty || s.warrantyInfo || s.warrantyPolicy || t('common.unknown'),
        status: s.status || (s.stockStatus === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : 'AVAILABLE'),
        badge: s.badge || (s.featured ? t('status.NEW') : ''),
      }
    })
  }, [services, t])

  // Lấy tối đa 4 dịch vụ nổi bật hiển thị ở trang chủ
  const displayServices = useMemo(() => {
    return formattedServices.slice(0, 4)
  }, [formattedServices])

  return (
    <section className="service-catalog-section" id="services">
      <div className="catalog-container">
        {/* Section Title */}
        <div className="catalog-header" style={{ borderBottom: 'none', paddingBottom: 0, alignItems: 'flex-end' }}>
          <div className="catalog-title-wrapper">
            <span className="eyebrow">{t('services.catalogTitle', { defaultValue: 'Dịch vụ nổi bật' })}</span>
            <h2 className="catalog-title">{t('services.catalogTitle', { defaultValue: 'Top Dịch Vụ Bán Chạy Nhất' })}</h2>
            <p className="catalog-description">
              {t('services.noServicesMatch', { defaultValue: 'Các gói dịch vụ tối ưu, giá cả minh bạch, thời gian xử lý nhanh và được nhiều khách hàng tin dùng nhất' })}
            </p>
          </div>
          <div className="catalog-header-action" style={{ flexShrink: 0 }}>
            <Button 
              variant="outline" 
              className="btn-view-all-catalog"
              onClick={() => navigate('/catalog')}
            >
              <span>{t('common.viewAll', { defaultValue: 'Xem tất cả dịch vụ' })}</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        {/* Grid View */}
        <div className="home-catalog-grid">
          {displayServices.map((service, index) => {
            const isOutOfStock = service.status === 'OUT_OF_STOCK' || service.stockStatus === 'OUT_OF_STOCK'
            const isFeatured = service.featured || service.badge === t('status.NEW')

            return (
              <div className={`service-card ${isFeatured ? 'featured' : ''}${isOutOfStock ? ' out-of-stock' : ''}`} key={service.id || index}>
                {isFeatured && (
                  <div className="service-card-badge">
                    <Sparkles size={12} /> {service.badge || t('status.NEW')}
                  </div>
                )}
                {isOutOfStock && (
                  <div className="service-card-oos-badge">{t('services.outOfStock', { defaultValue: 'Hết hàng' })}</div>
                )}
                
                <div className="service-card-content">
                  <span className="service-card-category">{service.categoryLabel}</span>
                  <h4 className="service-card-title">{service.name}</h4>
                  
                  <div className="service-card-footer">
                    <div className="service-card-price-container">
                      <span className="price-label">{t('checkout.servicePrice', { defaultValue: 'Giá trọn gói' })}</span>
                      <span className="price-val">{service.price}</span>
                    </div>
                    
                    <div className="service-card-actions">
                      <Button
                        variant="ghost"
                        className="btn-action btn-detail"
                        onClick={() => navigate(`/product/${service.slug}`)}
                        title={t('common.details', { defaultValue: 'Xem chi tiết dịch vụ' })}
                      >
                        <Eye size={16} />
                        <span>{t('common.details', { defaultValue: 'Chi tiết' })}</span>
                      </Button>
                      <Button
                        variant="primary"
                        className="btn-action btn-buy"
                        disabled={isOutOfStock}
                        onClick={() => onPurchaseClick(service)}
                      >
                        <ShoppingCart size={16} />
                        <span>{isOutOfStock ? t('services.outOfStock', { defaultValue: 'Hết hàng' }) : t('services.buyNow', { defaultValue: 'Mua ngay' })}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ServiceCatalog
