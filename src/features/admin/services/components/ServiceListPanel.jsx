import { AdminEmptyState } from '../../AdminShared'
import { serviceStatuses } from '../services.constants'

function ServiceListPanel({
  onBulkStatus,
  onQueryChange,
  onSelectService,
  onStartCreateService,
  onStatusFilterChange,
  onToggleSelected,
  query,
  selectedIds = [],
  selectedServiceId,
  services = [],
  statusFilter,
  submitting,
}) {
  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>Danh sách dịch vụ</h3>
        <button type="button" onClick={onStartCreateService}>Tạo mới</button>
      </div>
      <div className="admin-filters">
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm tên, slug, nhóm" type="search" />
        <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {serviceStatuses.map((status) => (
            <option value={status} key={status}>{status}</option>
          ))}
        </select>
      </div>
      <div className="admin-action-row">
        <button type="button" className="admin-icon-button" disabled={submitting || selectedIds.length === 0} onClick={() => onBulkStatus(true)}>Bulk enable</button>
        <button type="button" className="admin-danger-button" disabled={submitting || selectedIds.length === 0} onClick={() => onBulkStatus(false)}>Bulk disable</button>
      </div>
      <div className="admin-service-list">
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            className={selectedServiceId === service.id ? 'selected' : ''}
            onClick={() => onSelectService(service)}
          >
            <input checked={selectedIds.includes(service.id)} onChange={() => onToggleSelected(service.id)} onClick={(event) => event.stopPropagation()} type="checkbox" />
            <strong>{service.name}</strong>
            <span>{service.categoryName || 'Chưa phân nhóm'} · {service.status} · {service.priceText || service.price}</span>
          </button>
        ))}
        {services.length === 0 && <AdminEmptyState />}
      </div>
    </div>
  )
}

export default ServiceListPanel
