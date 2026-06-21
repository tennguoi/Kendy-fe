import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CatalogControls from './components/CatalogControls'
import CatalogToolbar from './components/CatalogToolbar'
import ServiceCatalogCard from './components/ServiceCatalogCard'
import Pagination from '../../../components/Pagination/Pagination'
import { mergeServiceLists, normalizeServiceText, uniqueServiceOptions } from './services.utils'

function ServicesView({
  favoriteServices = [],
  onPurchase,
  onToggleFavorite,
  recentServices = [],
  services = [],
}) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const itemsPerPage = 12

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

  const totalPages = Math.max(1, Math.ceil(visibleServices.length / itemsPerPage))
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return visibleServices.slice(start, start + itemsPerPage)
  }, [visibleServices, currentPage])

  // Reset to page 1 when filters change
  const filterKey = `${activeTab}-${query}-${statusFilter}-${typeFilter}`
  useMemo(() => { setCurrentPage(1) }, [filterKey])

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
        {paginatedServices.map((service) => {
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
          <p className="admin-empty-state">{t('services.noServicesMatch', { defaultValue: 'Không có dịch vụ phù hợp bộ lọc hiện tại.' })}</p>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      {services.length === 0 && (
        <p className="admin-empty-state">{t('services.noServicesAvailable', { defaultValue: 'Chưa có dịch vụ đang mở bán.' })}</p>
      )}
    </section>
  )
}

export default ServicesView
