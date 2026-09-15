import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Eye, Sparkles, ArrowRight, Shield, Truck, Headphones, Award, Star } from 'lucide-react'
import './ServiceCatalog.css'

function ServiceCatalog({ services = [], categories = [], onPurchaseClick }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('all')
  const [hoveredCard, setHoveredCard] = useState(null)

  // Category icons mapping
  const categoryIcons = {
    capcut: '🎬',
    facebook: '📘',
    upgrade: '⬆️',
    ads: '📢',
    default: '📦'
  }

  const categoryColors = {
    capcut: 'var(--color-primary-500)',
    facebook: '#1877F2',
    upgrade: 'var(--color-secondary-500)',
    ads: 'var(--color-warning)',
    default: 'var(--color-neutral-500)'
  }

  // Format all services consistently for display
  const formattedServices = useMemo(() => {
    return services.map((s) => {
      let categorySlug = 'default'
      const nameLower = (s.categoryName || s.type || s.category || '').toLowerCase()
      if (nameLower.includes('capcut')) categorySlug = 'capcut'
      else if (nameLower.includes('facebook')) categorySlug = 'facebook'
      else if (nameLower.includes('nâng cấp') || nameLower.includes('upgrade')) categorySlug = 'upgrade'
      else if (nameLower.includes('quảng cáo') || nameLower.includes('ads') || nameLower.includes('advertising')) categorySlug = 'ads'

      let formattedPrice = s.price
      if (typeof s.price === 'number') {
        formattedPrice = `${Number(s.price).toLocaleString('vi-VN')}đ`
      } else if (s.price && !s.price.includes('đ') && !isNaN(Number(s.price))) {
        formattedPrice = `${Number(s.price).toLocaleString('vi-VN')}đ`
      } else if (!s.price) {
        formattedPrice = s.priceText || t('services.buyNow', { defaultValue: 'Báo giá' })
      }

      const computedSlug = s.slug || (s.name || '').toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

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
        icon: categoryIcons[categorySlug] || categoryIcons.default,
        categoryColor: categoryColors[categorySlug] || categoryColors.default,
      }
    })
  }, [services, t])

  // Get unique categories from services
  const serviceCategories = useMemo(() => {
    const cats = [...new Set(formattedServices.map(s => s.category))]
    return cats.map(cat => ({
      id: cat,
      label: formattedServices.find(s => s.category === cat)?.categoryLabel || cat,
      icon: categoryIcons[cat] || categoryIcons.default,
      color: categoryColors[cat] || categoryColors.default
    }))
  }, [formattedServices])

  // Filter services by category
  const filteredServices = activeCategory === 'all'
    ? formattedServices
    : formattedServices.filter(s => s.category === activeCategory)

  // Display max 6 services on homepage (3 per row on desktop)
  const displayServices = filteredServices.slice(0, 6)

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId)
  }

  const handleViewDetail = (service) => {
    navigate(`/product/${service.slug}`)
  }

  const handleBuyNow = (service) => {
    onPurchaseClick?.(service)
  }

  if (displayServices.length === 0) {
    return (
      <section className="service-catalog" id="services" aria-labelledby="catalog-title">
        <div className="container">
          <div className="service-catalog__empty">
            <div className="service-catalog__empty-icon">
              <Box size={48} strokeWidth={1.5} />
            </div>
            <h3 className="service-catalog__empty-title">{t('services.emptyTitle', { defaultValue: 'Chưa có dịch vụ nào' })}</h3>
            <p className="service-catalog__empty-desc">{t('services.emptyDesc', { defaultValue: 'Hiện tại chưa có dịch vụ nào trong danh mục này. Vui lòng quay lại sau.' })}</p>
            <Button variant="primary" onClick={() => navigate('/catalog')}>
              <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
              {t('common.viewAll', { defaultValue: 'Xem tất cả dịch vụ' })}
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="service-catalog" id="services" aria-labelledby="catalog-title">
      <div className="container">
        {/* Header */}
        <header className="service-catalog__header">
          <div className="service-catalog__header-content">
            <span className="eyebrow">{t('services.catalogEyebrow', { defaultValue: 'Dịch vụ nổi bật' })}</span>
            <h2 id="catalog-title" className="service-catalog__title text-heading-1">
              {t('services.catalogTitle', { defaultValue: 'Top Dịch Vụ Bán Chạy Nhất' })}
            </h2>
            <p className="service-catalog__description text-body-lg">
              {t('services.catalogDesc', { defaultValue: 'Các gói dịch vụ tối ưu, giá cả minh bạch, thời gian xử lý nhanh và được nhiều khách hàng tin dùng nhất' })}
            </p>
          </div>

          {/* Category Tabs */}
          <div className="service-catalog__categories" role="tablist" aria-label="Danh mục dịch vụ">
            <button
              role="tab"
              aria-selected={activeCategory === 'all'}
              aria-controls="catalog-panel"
              className={`service-catalog__category-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('all')}
            >
              <span className="service-catalog__category-icon" aria-hidden="true">🏷️</span>
              <span>{t('services.allCategories', { defaultValue: 'Tất cả' })}</span>
            </button>
            {serviceCategories.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCategory === cat.id}
                aria-controls="catalog-panel"
                className={`service-catalog__category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
                style={{ '--category-color': cat.color }}
              >
                <span className="service-catalog__category-icon" aria-hidden="true">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="service-catalog__view-all">
            <Button variant="outline" className="btn-view-all" onClick={() => navigate('/catalog')}>
              <span>{t('common.viewAll', { defaultValue: 'Xem tất cả dịch vụ' })}</span>
              <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
            </Button>
          </div>
        </header>

        {/* Services Grid */}
        <div className="service-catalog__grid" role="tabpanel" id="catalog-panel" aria-label="Danh sách dịch vụ">
          {displayServices.map((service, index) => {
            const isOutOfStock = service.status === 'OUT_OF_STOCK' || service.stockStatus === 'OUT_OF_STOCK'
            const isFeatured = service.featured || service.badge === t('status.NEW') || service.badge === 'Nổi bật'

            return (
              <article
                key={service.id || index}
                className={`service-card ${isFeatured ? 'service-card--featured' : ''} ${isOutOfStock ? 'service-card--out-of-stock' : ''}`}
                onMouseEnter={() => setHoveredCard(service.id || index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Featured Badge */}
                {isFeatured && (
                  <div className="service-card__badge">
                    <Sparkles size={12} strokeWidth={2.5} aria-hidden="true" />
                    <span>{service.badge || t('status.NEW')}</span>
                  </div>
                )}

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                  <div className="service-card__oos-badge">
                    {t('services.outOfStock', { defaultValue: 'Hết hàng' })}
                  </div>
                )}

                {/* Category Tag */}
                <div className="service-card__category" style={{ '--category-color': service.categoryColor }}>
                  <span className="service-card__category-icon" aria-hidden="true">{service.icon}</span>
                  <span>{service.categoryLabel}</span>
                </div>

                {/* Main Content */}
                <div className="service-card__content">
                  <h3 className="service-card__title">{service.name}</h3>

                  {/* Features/Highlights */}
                  <ul className="service-card__features" aria-label="Đặc điểm nổi bật">
                    {service.processingTime && (
                      <li className="service-card__feature">
                        <Truck size={14} strokeWidth={2} aria-hidden="true" />
                        <span>{service.processingTime}</span>
                      </li>
                    )}
                    {service.warranty && (
                      <li className="service-card__feature">
                        <Shield size={14} strokeWidth={2} aria-hidden="true" />
                        <span>{service.warranty}</span>
                      </li>
                    )}
                    <li className="service-card__feature">
                      <Headphones size={14} strokeWidth={2} aria-hidden="true" />
                      <span>{t('services.feature.support', { defaultValue: 'Hỗ trợ sau mua' })}</span>
                    </li>
                  </ul>

                  {/* Price & Actions */}
                  <div className="service-card__footer">
                    <div className="service-card__price">
                      <span className="service-card__price-label">{t('checkout.servicePrice', { defaultValue: 'Giá trọn gói' })}</span>
                      <span className="service-card__price-value">{service.price}</span>
                    </div>

                    <div className="service-card__actions">
                      <button
                        type="button"
                        className="service-card__btn service-card__btn--detail btn btn-ghost btn-sm"
                        onClick={() => handleViewDetail(service)}
                        aria-label={t('common.details', { defaultValue: 'Xem chi tiết' })}
                        disabled={isOutOfStock}
                      >
                        <Eye size={16} strokeWidth={2} aria-hidden="true" />
                        <span>{t('common.details', { defaultValue: 'Chi tiết' })}</span>
                      </button>
                      <button
                        type="button"
                        className="service-card__btn service-card__btn--buy btn btn-primary btn-sm"
                        onClick={() => handleBuyNow(service)}
                        disabled={isOutOfStock}
                        aria-label={isOutOfStock ? t('services.outOfStock') : t('services.buyNow')}
                      >
                        <ShoppingCart size={16} strokeWidth={2} aria-hidden="true" />
                        <span>{isOutOfStock ? t('services.outOfStock', { defaultValue: 'Hết hàng' }) : t('services.buyNow', { defaultValue: 'Mua ngay' })}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="service-card__trust">
                  <div className="service-card__trust-item">
                    <Award size={14} strokeWidth={2} aria-hidden="true" />
                    <span>{t('services.trust.genuine', { defaultValue: 'Chính hãng' })}</span>
                  </div>
                  <div className="service-card__trust-item">
                    <Star size={14} strokeWidth={2} aria-hidden="true" />
                    <span>{t('services.trust.warranty', { defaultValue: 'Bảo hành' })}</span>
                  </div>
                  <div className="service-card__trust-item">
                    <Truck size={14} strokeWidth={2} aria-hidden="true" />
                    <span>{t('services.trust.fast', { defaultValue: 'Nhanh chóng' })}</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Button({ variant = 'primary', className = '', onClick, children, disabled, ...props }) {
  const variantClasses = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    accent: 'btn btn-accent',
    ghost: 'btn btn-ghost',
    outline: 'btn btn-outline',
  }

  return (
    <button
      type="button"
      className={`${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

function Box({ size = 24, strokeWidth = 2, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  )
}

export default ServiceCatalog