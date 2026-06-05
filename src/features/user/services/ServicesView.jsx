import { Clock3, Search, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import StatusBadge from '../../../components/status/StatusBadge'
import { money } from '../../../utils/currency'

const catalogTabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'favorites', label: 'Đã ghim' },
  { id: 'recent', label: 'Gần đây' },
]

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function uniqueOptions(services, field) {
  return Array.from(new Set(services.map((service) => service[field]).filter(Boolean)))
}

function mergeServiceLists(primary, fallback) {
  const byId = new Map()
  primary.forEach((service) => byId.set(service.id, service))
  fallback.forEach((service) => {
    if (byId.has(service.id)) {
      byId.set(service.id, { ...service, ...byId.get(service.id) })
    }
  })
  return Array.from(byId.values())
}

function ServicesView({
  favoriteServices = [],
  onPurchase,
  onToggleFavorite,
  recentServices = [],
  services = [],
}) {
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const favoriteIds = useMemo(() => new Set(favoriteServices.map((service) => service.id)), [favoriteServices])
  const sourceServices = useMemo(() => {
    if (activeTab === 'favorites') {
      return mergeServiceLists(favoriteServices, services)
    }

    if (activeTab === 'recent') {
      return mergeServiceLists(recentServices, services)
    }

    return services
  }, [activeTab, favoriteServices, recentServices, services])

  const serviceTypes = useMemo(() => uniqueOptions(services, 'type'), [services])
  const serviceStatuses = useMemo(() => uniqueOptions(services, 'status'), [services])
  const visibleServices = useMemo(() => {
    const searchText = normalizeText(query)

    return sourceServices.filter((service) => {
      const matchesQuery = !searchText || [
        service.name,
        service.shortDescription,
        service.description,
        service.categoryName,
        service.type,
      ].some((value) => normalizeText(value).includes(searchText))
      const matchesType = !typeFilter || service.type === typeFilter
      const matchesStatus = !statusFilter || service.status === statusFilter
      return matchesQuery && matchesType && matchesStatus
    })
  }, [query, sourceServices, statusFilter, typeFilter])

  return (
    <section className="services-catalog">
      <div className="catalog-toolbar">
        <div>
          <span className="eyebrow">Catalog</span>
          <h2>Dịch vụ Kendy Digital</h2>
        </div>
        <div className="catalog-summary">
          <strong>{visibleServices.length}</strong>
          <span>dịch vụ hiển thị</span>
        </div>
      </div>

      <div className="catalog-controls">
        <div className="catalog-tabs">
          {catalogTabs.map((tab) => (
            <button
              className={activeTab === tab.id ? 'active' : ''}
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <label className="catalog-search">
          <Search size={17} strokeWidth={2} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên, nhóm hoặc mô tả" type="search" />
        </label>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
          <option value="">Tất cả loại</option>
          {serviceTypes.map((type) => <option value={type} key={type}>{type}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {serviceStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
        </select>
      </div>

      <div className="service-grid">
        {visibleServices.map((service) => {
          const isFavorite = favoriteIds.has(service.id)
          const isDisabled = service.status !== 'ACTIVE' || service.stockStatus === 'OUT_OF_STOCK'

          return (
            <article className="service-card" key={service.id}>
              <div className="service-head">
                <span>{service.categoryName || service.type || 'Dịch vụ'}</span>
                <StatusBadge status={service.status} />
              </div>
              <h2>{service.name}</h2>
              <p>{service.shortDescription || service.description || 'Dịch vụ đang được cập nhật mô tả.'}</p>
              <div className="service-detail-list">
                <span>
                  <Clock3 size={15} strokeWidth={2} aria-hidden="true" />
                  {service.processingTime || service.time || 'Theo quy trình'}
                </span>
                <StatusBadge status={service.stockStatus || 'AVAILABLE'} />
              </div>
              <div className="service-meta">
                <strong>{service.priceText || money.format(service.price)}</strong>
                <span>{service.pricingBadge || service.type || 'Chuẩn'}</span>
              </div>
              <div className="service-actions">
                <button type="button" disabled={isDisabled} onClick={() => onPurchase(service)}>
                  Mua dịch vụ
                </button>
                <button
                  type="button"
                  className={isFavorite ? 'favorite active' : 'favorite'}
                  title={isFavorite ? 'Bỏ ghim dịch vụ' : 'Ghim dịch vụ'}
                  onClick={() => onToggleFavorite?.(service)}
                >
                  <Star size={17} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            </article>
          )
        })}
        {visibleServices.length === 0 && (
          <p className="admin-empty-state">Không có dịch vụ phù hợp bộ lọc hiện tại.</p>
        )}
      </div>
      {services.length === 0 && (
        <p className="admin-empty-state">Chưa có dịch vụ đang mở bán.</p>
      )}
    </section>
  )
}

export default ServicesView
