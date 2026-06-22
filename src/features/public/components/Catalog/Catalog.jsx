import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Clapperboard, Megaphone, PackageCheck, Search, ShieldCheck, ShoppingCart, Users } from 'lucide-react'
import { publicApi } from '../../../../api/public.api'
import { serviceTableRows as staticRows } from '../../data/services.public'
import Button from '../../../../components/Button/Button'
import Pagination from '../../../../components/Pagination/Pagination'
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

function buildFilters(apiCategories, t) {
  const cats = Array.isArray(apiCategories) ? apiCategories : []
  if (cats.length === 0) return [{ id: 'all', label: t('public.catalog.filterAll') }]
  return [
    { id: 'all', label: t('public.catalog.filterAll') },
    ...cats.map((cat) => ({
      id: cat.slug || String(cat.id),
      label: cat.name,
    })),
  ]
}

function mapServiceToCard(service, t) {
  const slug = pickCategorySlug(service.categoryName || service.type)
  const categorySlug = service.categorySlug || (service.categoryName ? service.categoryName.toLowerCase().replace(/[^a-z0-9-]/g, '-') : slug)
  return {
    id: service.id,
    slug: service.slug || service.id,
    name: service.name,
    description: service.shortDescription || service.description || '',
    category: slug,
    categoryId: service.categoryId,
    categorySlug: categorySlug,
    categoryLabel: service.categoryName || service.type || t('public.catalog.defaultCategory'),
    price: service.priceText || `Từ ${Number(service.price).toLocaleString('vi-VN')}đ`,
    priceVal: service.price,
    featured: service.featured,
    sortOrder: service.sortOrder,
    iconUrl: service.iconUrl,
    processingTime: service.processingTime || t('public.catalog.defaultProcessing'),
    warranty: service.warrantyPolicy || t('public.catalog.defaultWarranty'),
    status: service.stockStatus === 'OUT_OF_STOCK' ? t('public.catalog.outOfStock') : t('public.catalog.inStock'),
    stockStatus: service.stockStatus,
    pricingBadge: service.pricingBadge,
    _outOfStock: service.stockStatus === 'OUT_OF_STOCK',
    icon: categoryIcons[slug] || ShieldCheck,
  }
}

function Catalog() {
  const { t } = useTranslation()
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
    const f = buildFilters(apiCategories, t)
    if (f.length > 1) return f
    return [
      { id: 'all', label: t('public.catalog.filterAll') },
      { id: 'capcut', label: t('public.catalog.filterCapcut') },
      { id: 'facebook', label: t('public.catalog.filterFacebook') },
      { id: 'upgrade', label: t('public.catalog.filterUpgrade') },
      { id: 'ads', label: t('public.catalog.filterAds') },
    ]
  }, [apiCategories, t])

  const allServices = useMemo(() => {
    if (!hasApiData) return []
    return apiServices.map((svc) => mapServiceToCard(svc, t))
  }, [apiServices, hasApiData, t])

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
          <span className="eyebrow">{t('public.catalog.eyebrow')}</span>
          <h1>{t('public.catalog.title')}</h1>
          <p>{t('public.catalog.subtitle')}</p>
        </div>
      </div>

      <div className="catalog-toolbar">
        <div className="catalog-search">
          <Search size={20} strokeWidth={2} aria-hidden="true" />
          <input
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            type="search"
            placeholder={t('public.catalog.searchPlaceholder')}
          />
        </div>
        <div className="catalog-sort">
          <span className="sort-label">{t('public.catalog.sortLabel')}</span>
          <select value={activeSort} onChange={(e) => handleSortChange(e.target.value)} className="sort-select">
            <option value="popular">{t('public.catalog.sortPopular')}</option>
            <option value="name-asc">{t('public.catalog.sortNameAsc')}</option>
            <option value="name-desc">{t('public.catalog.sortNameDesc')}</option>
            <option value="price-asc">{t('public.catalog.sortPriceAsc')}</option>
            <option value="price-desc">{t('public.catalog.sortPriceDesc')}</option>
          </select>
        </div>
      </div>

      <div className="catalog-filters">
        {filters.map((f) => (
          <Button
            key={f.id}
            variant={activeFilter === f.id ? 'primary' : 'ghost'}
            className="filter-btn"
            onClick={() => handleFilterChange(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="catalog-loading">
          <div className="catalog-spinner" />
          <p>{t('public.catalog.loading')}</p>
        </div>
      ) : paginatedServices.length === 0 ? (
        <div className="catalog-empty">
          <ShoppingCart size={48} strokeWidth={1.5} />
          <h3>{t('public.catalog.emptyTitle')}</h3>
          <p>{t('public.catalog.emptyText')}</p>
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
                  {service._outOfStock && <span className="catalog-card-oos-badge">{t('public.catalog.outOfStock')}</span>}
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
                      <strong>{t('public.catalog.processing')}</strong> {service.processingTime}
                    </span>
                    <span className="catalog-card-info">
                      <strong>{t('public.catalog.warranty')}</strong> {service.warranty}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    className="catalog-card-cta"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewDetail(service)
                    }}
                  >
                    {t('public.catalog.viewDetail')}
                  </Button>
                </article>
              )
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}

export default Catalog
