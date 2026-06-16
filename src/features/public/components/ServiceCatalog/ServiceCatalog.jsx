import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Eye, Sparkles } from 'lucide-react'
import './ServiceCatalog.css'

function ServiceCatalog({ categories = [], services = [], onPurchaseClick }) {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

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
        formattedPrice = s.priceText || 'Báo giá'
      }

      // Generate slug fallback for static/API services if they don't have it
      const computedSlug = s.slug || (s.name || '').toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese accents
        .replace(/[^a-z0-9\s-]/g, '') // remove special characters
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      return {
        ...s,
        category: s.category || categorySlug,
        categoryLabel: s.categoryLabel || s.categoryName || s.type || s.category || 'Dịch vụ',
        price: formattedPrice,
        slug: computedSlug,
        processingTime: s.processingTime || 'Theo quy trình',
        warranty: s.warranty || s.warrantyInfo || s.warrantyPolicy || 'Theo điều kiện',
        status: s.status || (s.stockStatus === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Còn hàng'),
        badge: s.badge || (s.featured ? 'Nổi bật' : ''),
      }
    })
  }, [services])

  // Filter services by category and search query
  const filteredServices = useMemo(() => {
    return formattedServices.filter((service) => {
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [formattedServices, selectedCategory, searchQuery])

  // Map category filter buttons (combining static and API categories)
  const filterCategories = useMemo(() => {
    const list = [{ id: 'all', title: 'Tất cả' }]
    categories.forEach((cat) => {
      if (cat.id && !list.some((item) => item.id === cat.id)) {
        list.push({
          id: cat.id,
          title: cat.title || cat.name,
        })
      }
    })
    return list
  }, [categories])

  return (
    <section className="service-catalog-section" id="service-catalog">
      <div className="catalog-container">
        {/* Section Title */}
        <div className="catalog-header">
          <div className="catalog-title-wrapper">
            <span className="eyebrow">Bảng giá dịch vụ</span>
            <h2 className="catalog-title">Danh Mục Dịch Vụ Nổi Bật</h2>
            <p className="catalog-description">
              Tìm kiếm và lựa chọn các gói dịch vụ tối ưu cho doanh nghiệp và cá nhân
            </p>
          </div>
          
          {/* Quick Search */}
          <div className="catalog-search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ nhanh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="catalog-search-input"
            />
          </div>
        </div>

        <div className="catalog-layout">
          {/* Sidebar Filters */}
          <aside className="catalog-sidebar">
            <h3 className="sidebar-title">Nhóm dịch vụ</h3>
            <ul className="category-list">
              {filterCategories.map((cat) => {
                const isActive = selectedCategory === cat.id
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      className={`category-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.title}
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          {/* Grid View */}
          <div className="catalog-grid-wrapper">
            {filteredServices.length > 0 ? (
              <div className="catalog-grid">
                {filteredServices.map((service, index) => {
                  const isOutOfStock = service.status === 'Hết hàng' || service.stockStatus === 'OUT_OF_STOCK'
                  const isFeatured = service.featured || service.badge === 'Nổi bật'
                  
                  return (
                    <div className={`service-card ${isFeatured ? 'featured' : ''}`} key={service.id || index}>
                      {isFeatured && (
                        <div className="service-card-badge">
                          <Sparkles size={12} /> {service.badge || 'Nổi bật'}
                        </div>
                      )}
                      
                      <div className="service-card-content">
                        <span className="service-card-category">{service.categoryLabel}</span>
                        <h4 className="service-card-title">{service.name}</h4>
                        
                        <div className="service-card-footer">
                          <div className="service-card-price-container">
                            <span className="price-label">Giá trọn gói</span>
                            <span className="price-val">{service.price}</span>
                          </div>
                          
                          <div className="service-card-actions">
                            <button
                              type="button"
                              className="btn-action btn-detail"
                              onClick={() => navigate(`/service/${service.slug}`)}
                              title="Xem chi tiết dịch vụ"
                            >
                              <Eye size={16} />
                              <span>Chi tiết</span>
                            </button>
                            <button
                              type="button"
                              className="btn-action btn-buy"
                              disabled={isOutOfStock}
                              onClick={() => onPurchaseClick(service)}
                            >
                              <ShoppingCart size={16} />
                              <span>{isOutOfStock ? 'Hết hàng' : 'Mua ngay'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="catalog-empty">
                <p>Không tìm thấy dịch vụ nào phù hợp với yêu cầu tìm kiếm của bạn.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceCatalog
