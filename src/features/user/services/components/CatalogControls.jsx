import { useTranslation } from 'react-i18next'
import { catalogTabs, getServiceStatusLabel, getServiceTypeLabel } from '../services.constants'
import SearchField from '../../../../components/SearchField/SearchField'

function CatalogControls({
  activeTab,
  onActiveTabChange,
  onQueryChange,
  onStatusFilterChange,
  onTypeFilterChange,
  query,
  serviceStatuses = [],
  serviceTypes = [],
  statusFilter,
  typeFilter,
}) {
  const { t } = useTranslation()

  const getTabLabel = (tab) => {
    const keyMap = {
      all: 'services.tabAll',
      favorites: 'services.tabFavorites',
      recent: 'services.tabRecent'
    }
    return t(keyMap[tab.id], { defaultValue: tab.label })
  }

  const getServiceTypeTranslation = (type) => {
    const keyMap = {
      ACCOUNT_STOCK: 'services.typeAccountStock',
      MANUAL: 'services.typeManual',
    }
    return keyMap[type] ? t(keyMap[type]) : getServiceTypeLabel(type)
  }

  const getServiceStatusTranslation = (status) => {
    const keyMap = {
      ACTIVE: 'services.statusActive',
      INACTIVE: 'services.statusInactive',
      MAINTENANCE: 'services.statusMaintenance',
      DRAFT: 'services.statusDraft'
    }
    return keyMap[status] ? t(keyMap[status]) : getServiceStatusLabel(status)
  }

  return (
    <div className="catalog-controls">
      <div className="catalog-tabs">
        {catalogTabs.map((tab) => (
          <button
            className={activeTab === tab.id ? 'active' : ''}
            key={tab.id}
            type="button"
            onClick={() => onActiveTabChange(tab.id)}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>
      <SearchField
        className="catalog-search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={t('services.searchPlaceholder', { defaultValue: 'Tìm dịch vụ...' })}
      />
      <select value={typeFilter} onChange={(event) => onTypeFilterChange(event.target.value)}>
        <option value="">{t('services.typeAll', { defaultValue: 'Tất cả loại' })}</option>
        {serviceTypes.map((type) => (
          <option value={type} key={type}>
            {getServiceTypeTranslation(type)}
          </option>
        ))}
      </select>
      <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
        <option value="">{t('services.statusAll', { defaultValue: 'Tất cả trạng thái' })}</option>
        {serviceStatuses.map((status) => (
          <option value={status} key={status}>
            {getServiceStatusTranslation(status)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default CatalogControls
