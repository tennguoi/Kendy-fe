import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Clapperboard, Megaphone, PackageCheck, Search, ShieldCheck, ShoppingCart, Users } from 'lucide-react'
import { publicApi } from '../../../../api/public.api'
import { serviceTableRows as staticRows } from '../../data/services.public'
import './Catalog.css'

const categoryIcons = {
  capcut: Clapperboard,
  facebook: Users,
  upgrade: PackageCheck,
  ads: Megaphone,
  advertising: Megaphone,
  default: ShieldCheck,
}

function pickCategorySlug(categoryName) {
  const name = (categoryName || '').toLowerCase()
  if (name.includes('capcut')) return 'capcut'
  if (name.includes('facebook')) return 'facebook'
  if (name.includes('nâng cấp') || name.includes('upgrade')) return 'upgrade'
  if (name.includes('quảng cáo') || name.includes('ads') || name.includes('advertising')) return 'ads'
  return 'default'
}

function buildFilters(apiCategories) {
  const cats = Array.isArray(apiCategories) ? apiCategories : []
  if (cats.length === 0) return [{ id: 'all', label: 'Tất cả' }]
  return [
    { id: 'all', label: 'Tất cả' },
    ...cats.map((cat) => ({
      id: cat.slug || String(cat.id),
      label: cat.name,
    })),
  ]
}

function mapServiceToCard(service) {
  const slug = pickCategorySlug(service.categoryName || service.type)
  const categorySlug = service.categorySlug || (service.categoryName ? service.categoryName.toLowerCase().replace(/[^a-z0-9-]/g, '-') : slug)
  const badgeLower = (service.pricingBadge || '').toLowerCase()
  const isOnSale = badgeLower.includes('khuyến mãi') || badgeLower.includes('giảm') || badgeLower.includes('sale') || badgeLower.includes('discount')
  return {
    id: service.id,
    slug: service.slug || service.id,
    name: service.name,
    description: service.shortDescription || service.description || '',
    category: slug,
    categoryId: service.categoryId,
    categorySlug: categorySlug,
    categoryLabel: service.categoryName || service.type || 'Dịch vụ',
    price: service.priceText || `Từ ${Number(service.price).toLocaleString('vi-VN')}đ`,
    priceVal: service.price,
    featured: service.featured,
    sortOrder: service.sortOrder,
    iconUrl: service.iconUrl,
    processingTime: service.processingTime || 'Theo quy trình',
    warranty: service.warrantyPolicy || 'Theo điều kiện',
    status: service.stockStatus === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Còn hàng',
    stockStatus: service.stockStatus,
    pricingBadge: service.pricingBadge,
    _onSale: isOnSale,
    _outOfStock: service.stockStatus === 'OUT_OF_STOCK',
    icon: categoryIcons[slug] || ShieldCheck,
  }
}

function Catalog() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [apiServices, setApiServices] = useState([])
  const [apiCategories, setApiCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [activeFilter, setActiveFilter] = useState(searchParams.get('category') || 'all')
  const [activeSort, setActiveSort] = useState(searchParams.get('sort') || 'popular')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 8

  useEffect(() => {
    Promise.allSettled([
      publicApi.getServices({ limit: 100 }),
      publicApi.getCategories(),
    ]).then((results) => {
      if (results[0].status === 'fulfilled') {
        setApiServices(Array.isArray(results[0].value) ? results[0].value : [])
      }
      if (results[1].status === 'fulfilled') {
        setApiCategories(Array.isArray(results[1].value) ? results[1].value : [])
      }
      setLoading(false)
    })
  }, [])

  const hasApiData = apiServices.length > 0

  const filters = useMemo(() => {
    const f = buildFilters(apiCategories)
    if (f.length > 1) return f
    return [
      { id: 'all', label: 'Tất cả' },
      { id: 'capcut', label: 'CapCut' },
      { id: 'facebook', label: 'Facebook' },
      { id: 'upgrade', label: 'Nâng cấp' },
      { id: 'ads', label: 'Quảng cáo' },
    ]
  }, [apiCategories])

  const allServices = useMemo(() => {
    if (!hasApiData) return []
    return apiServices.map(mapServiceToCard)
  }, [apiServices, hasApiData])

  // Lọc theo search và category
  const filteredServices = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    return allServices
      .filter((s) => activeFilter === 'all' || s.category === activeFilter || String(s.categoryId) === activeFilter || s.categorySlug === activeFilter)
      .filter((s) => !keyword || s.name.toLowerCase().includes(keyword) || s.categoryLabel.toLowerCase().includes(keyword))
  }, [allServices, activeFilter, searchTerm])

  // Sắp xếp
  const sortedServices = useMemo(() => {
    const list = [...filteredServices]
    if (activeSort === 'name-asc') {
      return list.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    }
    if (activeSort === 'name-desc') {
      return list.sort((a, b) => b.name.localeCompare(a.name, 'vi'))
    }
    if (activeSort === 'price-asc') {
      return list.sort((a, b) => {
        const priceA = typeof a.priceVal === 'number' ? a.priceVal : parseFloat(String(a.priceVal || a.price).replace(/[^0-9]/g, '')) || 0
        const priceB = typeof b.priceVal === 'number' ? b.priceVal : parseFloat(String(b.priceVal || b.price).replace(/[^0-9]/g, '')) || 0
        return priceA - priceB
      })
    }
    if (activeSort === 'price-desc') {
      return list.sort((a, b) => {
        const priceA = typeof a.priceVal === 'number' ? a.priceVal : parseFloat(String(a.priceVal || a.price).replace(/[^0-9]/g, '')) || 0
        const priceB = typeof b.priceVal === 'number' ? b.priceVal : parseFloat(String(b.priceVal || b.price).replace(/[^0-9]/g, '')) || 0
        return priceB - priceA
      })
    }
    // 'popular' hoặc mặc định: dịch vụ featured lên trước, sau đó theo sortOrder
    return list.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return (a.sortOrder || 0) - (b.sortOrder || 0)
    })
  }, [filteredServices, activeSort])

  const displayServices = hasApiData ? sortedServices : staticRows

  // Phân trang
  const totalPages = Math.ceil(displayServices.length / itemsPerPage)
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return displayServices.slice(startIndex, startIndex + itemsPerPage)
  }, [displayServices, currentPage, itemsPerPage])

  const handleFilterChange = (id) => {
    setActiveFilter(id)
    setCurrentPage(1)
    const params = new URLSearchParams(searchParams)
    if (id === 'all') {
      params.delete('category')
    } else {
      params.set('category', id)
    }
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim())
    } else {
      params.delete('q')
    }
    if (activeSort && activeSort !== 'popular') {
      params.set('sort', activeSort)
    } else {
      params.delete('sort')
    }
    setSearchParams(params)
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
    const params = new URLSearchParams(searchParams)
    if (value.trim()) {
      params.set('q', value.trim())
    } else {
      params.delete('q')
    }
    if (activeFilter !== 'all') {
      params.set('category', activeFilter)
    } else {
      params.delete('category')
    }
    if (activeSort && activeSort !== 'popular') {
      params.set('sort', activeSort)
    } else {
      params.delete('sort')
    }
    setSearchParams(params)
  }

  const handleSortChange = (sortType) => {
    setActiveSort(sortType)
    setCurrentPage(1)
    const params = new URLSearchParams(searchParams)
    if (sortType === 'popular') {
      params.delete('sort')
    } else {
      params.set('sort', sortType)
    }
    if (activeFilter !== 'all') {
      params.set('category', activeFilter)
    } else {
      params.delete('category')
    }
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim())
    } else {
      params.delete('q')
    }
    setSearchParams(params)
  }

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum)
    const toolbar = document.querySelector('.catalog-toolbar')
    if (toolbar) {
      toolbar.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleViewDetail = (service) => {
    const slug = service.slug || service.id || encodeURIComponent(service.name)
    navigate(`/product/${slug}`)
  }

  return (
    <div className="catalog-page">
      <div className="catalog-hero">
        <div className="catalog-hero-content">
          <span className="eyebrow">Danh mục dịch vụ</span>
          <h1>Tất cả dịch vụ tại Kendy Digital</h1>
          <p>Khám phá đầy đủ các gói dịch vụ CapCut, Facebook, nâng cấp tài khoản và quảng cáo</p>
        </div>
      </div>

      <div className="catalog-toolbar">
        <div className="catalog-search">
          <Search size={20} strokeWidth={2} aria-hidden="true" />
          <input
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            type="search"
            placeholder="Tìm kiếm dịch vụ..."
          />
        </div>
        <div className="catalog-sort">
          <span className="sort-label">Sắp xếp:</span>
          <select value={activeSort} onChange={(e) => handleSortChange(e.target.value)} className="sort-select">
            <option value="popular">Bán chạy & Nổi bật</option>
            <option value="name-asc">Tên dịch vụ (A - Z)</option>
            <option value="name-desc">Tên dịch vụ (Z - A)</option>
            <option value="price-asc">Giá (Thấp - Cao)</option>
            <option value="price-desc">Giá (Cao - Thấp)</option>
          </select>
        </div>
      </div>

      <div className="catalog-filters">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            className={activeFilter === f.id ? 'filter-btn active' : 'filter-btn'}
            onClick={() => handleFilterChange(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="catalog-loading">
          <div className="catalog-spinner" />
          <p>Đang tải danh sách dịch vụ...</p>
        </div>
      ) : paginatedServices.length === 0 ? (
        <div className="catalog-empty">
          <ShoppingCart size={48} strokeWidth={1.5} />
          <h3>Không tìm thấy dịch vụ</h3>
          <p>Thử tìm kiếm với từ khóa khác hoặc chọn nhóm dịch vụ khác</p>
        </div>
      ) : (
        <>
          <div className="catalog-grid">
            {paginatedServices.map((service) => {
              const Icon = service.icon || ShieldCheck
              return (
                <article
                  className={`catalog-card${service._outOfStock ? ' out-of-stock' : ''}`}
                  key={service.name + (service.id || '')}
                  onClick={() => handleViewDetail(service)}
                >
                  {service._onSale && <span className="catalog-card-sale-badge">Khuyến mãi</span>}
                  {service._outOfStock && <span className="catalog-card-oos-badge">Hết hàng</span>}
                  <div className="catalog-card-head">
                    <span className="catalog-card-icon">
                      {service.iconUrl ? (
                        <img 
                          src={service.iconUrl} 
                          alt="" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} 
                        />
                      ) : (
                        <Icon size={22} strokeWidth={2} aria-hidden="true" />
                      )}
                    </span>
                    <span className="catalog-card-category">{service.categoryLabel}</span>
                  </div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="catalog-card-meta">
                    <div className="catalog-card-price">{service.price}</div>
                    <div className={`catalog-card-status${service._outOfStock ? ' out' : ''}`}>{service.status}</div>
                  </div>
                  <div className="catalog-card-footer">
                    <span className="catalog-card-info">
                      <strong>Xử lý:</strong> {service.processingTime}
                    </span>
                    <span className="catalog-card-info">
                      <strong>Bảo hành:</strong> {service.warranty}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="catalog-card-cta"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewDetail(service)
                    }}
                  >
                    Xem chi tiết
                  </button>
                </article>
              )
            })}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="catalog-pagination">
              <button
                type="button"
                className="pagination-btn arrow"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Trang trước
              </button>
              
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, idx) => {
                  const pageNum = idx + 1
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      className={`pagination-btn num ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                className="pagination-btn arrow"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Catalog
