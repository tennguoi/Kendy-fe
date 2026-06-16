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
      id: pickCategorySlug(cat.name),
      label: cat.name,
    })),
  ]
}

function mapServiceToCard(service) {
  const slug = pickCategorySlug(service.categoryName || service.type)
  return {
    id: service.id,
    slug: service.slug || service.id,
    name: service.name,
    description: service.shortDescription || service.description || '',
    category: slug,
    categoryLabel: service.categoryName || service.type || 'Dịch vụ',
    price: service.priceText || `Từ ${Number(service.price).toLocaleString('vi-VN')}đ`,
    processingTime: service.processingTime || 'Theo quy trình',
    warranty: service.warrantyPolicy || 'Theo điều kiện',
    status: service.stockStatus === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Còn hàng',
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
  const [loading, setLoading] = useState(true)

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

  const visibleServices = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    return allServices
      .filter((s) => activeFilter === 'all' || s.category === activeFilter)
      .filter((s) => !keyword || s.name.toLowerCase().includes(keyword) || s.categoryLabel.toLowerCase().includes(keyword))
  }, [allServices, activeFilter, searchTerm])

  const displayServices = hasApiData ? visibleServices : staticRows

  const handleFilterChange = (id) => {
    setActiveFilter(id)
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
    setSearchParams(params)
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    const params = new URLSearchParams(searchParams)
    if (value.trim()) {
      params.set('q', value.trim())
    } else {
      params.delete('q')
    }
    setSearchParams(params)
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
      ) : displayServices.length === 0 ? (
        <div className="catalog-empty">
          <ShoppingCart size={48} strokeWidth={1.5} />
          <h3>Không tìm thấy dịch vụ</h3>
          <p>Thử tìm kiếm với từ khóa khác hoặc chọn nhóm dịch vụ khác</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {displayServices.map((service) => {
            const Icon = service.icon || ShieldCheck
            return (
              <article
                className="catalog-card"
                key={service.name + (service.id || '')}
                onClick={() => handleViewDetail(service)}
              >
                <div className="catalog-card-head">
                  <span className="catalog-card-icon">
                    <Icon size={22} strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span className="catalog-card-category">{service.categoryLabel}</span>
                </div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="catalog-card-meta">
                  <div className="catalog-card-price">{service.price}</div>
                  <div className="catalog-card-status">{service.status}</div>
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
      )}
    </div>
  )
}

export default Catalog
