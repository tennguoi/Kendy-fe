import { useMemo, useState } from 'react'
import CatalogControls from './components/CatalogControls'
import CatalogToolbar from './components/CatalogToolbar'
import ServiceCatalogCard from './components/ServiceCatalogCard'
import { mergeServiceLists, normalizeServiceText, uniqueServiceOptions } from './services.utils'

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

  const serviceTypes = useMemo(() => uniqueServiceOptions(services, 'type'), [services])
  const serviceStatuses = useMemo(() => uniqueServiceOptions(services, 'status'), [services])
  const visibleServices = useMemo(() => {
    const searchText = normalizeServiceText(query)

    return sourceServices.filter((service) => {
      const matchesQuery = !searchText || [
        service.name,
        service.shortDescription,
        service.description,
        service.categoryName,
        service.type,
      ].some((value) => normalizeServiceText(value).includes(searchText))
      const matchesType = !typeFilter || service.type === typeFilter
      const matchesStatus = !statusFilter || service.status === statusFilter
      return matchesQuery && matchesType && matchesStatus
    })
  }, [query, sourceServices, statusFilter, typeFilter])

  return (
    <section className="services-catalog">
      <CatalogToolbar count={visibleServices.length} />
      <CatalogControls
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
        onTypeFilterChange={setTypeFilter}
        query={query}
        serviceStatuses={serviceStatuses}
        serviceTypes={serviceTypes}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
      />

      <div className="service-grid">
        {visibleServices.map((service) => {
          const isFavorite = favoriteIds.has(service.id)

          return (
            <ServiceCatalogCard
              isFavorite={isFavorite}
              key={service.id}
              onPurchase={onPurchase}
              onToggleFavorite={onToggleFavorite}
              service={service}
            />
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
