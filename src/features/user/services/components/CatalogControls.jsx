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
            {tab.label}
          </button>
        ))}
      </div>
      <SearchField className="catalog-search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm tên, nhóm hoặc mô tả" />
      <select value={typeFilter} onChange={(event) => onTypeFilterChange(event.target.value)}>
        <option value="">Tất cả loại</option>
        {serviceTypes.map((type) => <option value={type} key={type}>{getServiceTypeLabel(type)}</option>)}
      </select>
      <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
        <option value="">Tất cả trạng thái</option>
        {serviceStatuses.map((status) => <option value={status} key={status}>{getServiceStatusLabel(status)}</option>)}
      </select>
    </div>
  )
}

export default CatalogControls
