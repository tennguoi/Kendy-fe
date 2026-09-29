import { useTranslation } from 'react-i18next'
import { catalogTabs, getServiceStatusLabel, getServiceTypeLabel } from '../services.constants'
import SearchField from '../../../../components/SearchField/SearchField'
import BaseSelect from '../../../../components/ui/BaseSelect'

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
      <BaseSelect
        name="typeFilter"
        value={typeFilter}
        onChange={(value) => onTypeFilterChange(value)}
        placeholder={t('services.typeAll', { defaultValue: 'Tất cả loại' })}
        options={serviceTypes.map((type) => ({
          value: type,
          label: getServiceTypeTranslation(type),
        }))}
      />
      <BaseSelect
        name="statusFilter"
        value={statusFilter}
        onChange={(value) => onStatusFilterChange(value)}
        placeholder={t('services.statusAll', { defaultValue: 'Tất cả trạng thái' })}
        options={serviceStatuses.map((status) => ({
          value: status,
          label: getServiceStatusTranslation(status),
        }))}
      />
    </div>
  )
}

export default CatalogControls
