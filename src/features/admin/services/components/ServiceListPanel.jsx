import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminMoney } from '../../adminFormat'
import { getServiceStatusLabel, serviceStatuses } from '../services.constants'
import SearchField from '../../../../components/SearchField/SearchField'

function ServiceListPanel({
  activeTab = 'services',
  onTabChange,
  categories = [],
  onBulkStatus,
  onQueryChange,
  onSelectService,
  onSelectCategory,
  onStatusFilterChange,
  onToggleSelected,
  query,
  selectedIds = [],
  selectedServiceId,
  selectedCategoryId,
  services = [],
  statusFilter,
  submitting,
  onUpdateServiceQuick,
  onDeleteServiceQuick,
  onDeleteCategoryQuick,
}) {
  const [openToolbarId, setOpenToolbarId] = useState(null)
  const selectedCount = selectedIds.length

  const handleToggleToolbar = (event, id) => {
    event.stopPropagation()
    setOpenToolbarId((current) => (current === id ? null : id))
  }

  const handleSelectService = (service) => {
    onSelectService(service)
    setOpenToolbarId(null)
  }

  const handleSelectCategory = (category) => {
    onSelectCategory(category)
    setOpenToolbarId(null)
  }

  const handleUpdateServiceQuick = (event, serviceId, patch) => {
    event.stopPropagation()
    onUpdateServiceQuick(serviceId, patch)
    setOpenToolbarId(null)
  }

  const handleDeleteServiceQuick = (event, serviceId) => {
    event.stopPropagation()
    if (window.confirm('Bạn có chắc chắn muốn xóa/ẩn dịch vụ này không?')) {
      onDeleteServiceQuick(serviceId)
    }
    setOpenToolbarId(null)
  }

  const handleDeleteCategoryQuick = (event, categoryId) => {
    event.stopPropagation()
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả sản phẩm thuộc danh mục này sẽ bị bỏ phân nhóm.')) {
      onDeleteCategoryQuick(categoryId)
    }
    setOpenToolbarId(null)
  }

  // Filter lists based on query
  const filteredServices = services.filter((service) => {
    const q = query.toLowerCase().trim()
    if (!q) return true
    return (
      service.name.toLowerCase().includes(q) ||
      (service.slug && service.slug.toLowerCase().includes(q)) ||
      (service.categoryName && service.categoryName.toLowerCase().includes(q))
    );
  });

  const filteredCategories = categories.filter((category) => {
    const q = query.toLowerCase().trim()
    if (!q) return true
    return (
      category.name.toLowerCase().includes(q) ||
      (category.slug && category.slug.toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-panel admin-service-catalog">
      <div className="admin-panel-head" style={{ borderBottom: '1px solid var(--kd-border)', paddingBottom: '12px' }}>
        <div className="admin-tabs">
          <button
            type="button"
            className={activeTab === 'services' ? 'active' : ''}
            onClick={() => {
              onTabChange('services')
              onQueryChange('')
            }}
          >
            Sản phẩm ({services.length})
          </button>
          <button
            type="button"
            className={activeTab === 'categories' ? 'active' : ''}
            onClick={() => {
              onTabChange('categories')
              onQueryChange('')
            }}
          >
            Danh mục ({categories.length})
          </button>
        </div>
      </div>

      <div className="admin-filters" style={{ marginTop: '14px' }}>
        <SearchField
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={activeTab === 'services' ? 'Tìm tên sản phẩm, slug, nhóm...' : 'Tìm tên danh mục, slug...'}
        />

        {activeTab === 'services' && (
          <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {serviceStatuses.map((status) => (
              <option value={status} key={status}>
                {getServiceStatusLabel(status)}
              </option>
            ))}
          </select>
        )}
      </div>

      {activeTab === 'services' && (
        <div className="admin-action-row service-bulk-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ marginRight: 'auto', fontSize: '13px', color: 'var(--kd-muted)', fontWeight: 600 }}>
            {selectedCount} đang chọn
          </span>
          <button
            type="button"
            className="admin-icon-button"
            style={{ height: '32px', minHeight: '32px', padding: '0 10px', fontSize: '13px' }}
            disabled={submitting || selectedCount === 0}
            onClick={() => onBulkStatus(true)}
          >
            Bật đã chọn
          </button>
          <button
            type="button"
            className="admin-danger-button slim"
            style={{ height: '32px', minHeight: '32px', padding: '0 10px', fontSize: '13px' }}
            disabled={submitting || selectedCount === 0}
            onClick={() => onBulkStatus(false)}
          >
            Tắt đã chọn
          </button>
        </div>
      )}

      <div className="admin-data-table">
        {activeTab === 'services' ? (
          <>
            <div className="admin-data-row head services">
              <span>Sản phẩm</span>
              <span>Danh mục</span>
              <span>Giá hiển thị</span>
              <span>Trạng thái</span>
              <span style={{ textAlign: 'right' }}>Thao tác</span>
            </div>
            {filteredServices.map((service) => (
              <div className="admin-user-row-wrap" key={service.id}>
                <div
                  className={`admin-data-row services ${selectedServiceId === service.id ? 'selected' : ''}`}
                  onClick={() => handleSelectService(service)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <input
                      checked={selectedIds.includes(service.id)}
                      onChange={() => onToggleSelected(service.id)}
                      onClick={(event) => event.stopPropagation()}
                      type="checkbox"
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="admin-row-user">
                      <strong>{service.name}</strong>
                      <small>/{service.slug}</small>
                    </div>
                  </div>
                  <span>{service.categoryName || <span style={{ color: 'var(--kd-muted)', fontStyle: 'italic' }}>Chưa phân nhóm</span>}</span>
                  <strong>{service.priceText || formatAdminMoney(service.price)}</strong>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <AdminStatusBadge status={service.status} />
                    {!service.publicVisible && (
                      <span className="admin-status locked" style={{ padding: '0 6px', height: '20px', minHeight: '20px', fontSize: '10px' }}>Ẩn</span>
                    )}
                  </div>
                  <span className="admin-row-actions">
                    <button
                      type="button"
                      className="admin-row-menu-button"
                      aria-expanded={openToolbarId === `service-${service.id}`}
                      aria-label="Thao tác nhanh"
                      onClick={(event) => handleToggleToolbar(event, `service-${service.id}`)}
                    >
                      <MoreHorizontal size={18} strokeWidth={2} />
                    </button>

                    {openToolbarId === `service-${service.id}` && (
                      <span className="admin-row-toolbar" style={{ right: '42px', top: '50%', transform: 'translateY(-50%)' }}>
                        <button type="button" onClick={() => handleSelectService(service)}>
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={(event) =>
                            handleUpdateServiceQuick(event, service.id, {
                              status: service.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                            })
                          }
                        >
                          {service.status === 'ACTIVE' ? 'Tắt bán' : 'Bật bán'}
                        </button>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={(event) =>
                            handleUpdateServiceQuick(event, service.id, {
                              publicVisible: !service.publicVisible,
                            })
                          }
                        >
                          {service.publicVisible ? 'Ẩn' : 'Hiện'}
                        </button>
                        <button
                          type="button"
                          className="danger"
                          disabled={submitting}
                          onClick={(event) => handleDeleteServiceQuick(event, service.id)}
                        >
                          Xóa
                        </button>
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
            {filteredServices.length === 0 && <AdminEmptyState />}
          </>
        ) : (
          <>
            <div className="admin-data-row head categories">
              <span>Danh mục</span>
              <span>Danh mục cha</span>
              <span>Thứ tự</span>
              <span style={{ textAlign: 'right' }}>Thao tác</span>
            </div>
            {filteredCategories.map((category) => {
              const parent = categories.find((cat) => cat.id === category.parentId)
              return (
                <div className="admin-user-row-wrap" key={category.id}>
                  <div
                    className={`admin-data-row categories ${selectedCategoryId === category.id ? 'selected' : ''}`}
                    onClick={() => handleSelectCategory(category)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="admin-row-user">
                      <strong>{category.name}</strong>
                      <small>/{category.slug}</small>
                    </div>
                    <span>{parent ? parent.name : <span style={{ color: 'var(--kd-muted)' }}>Không có</span>}</span>
                    <span>{category.sortOrder ?? 0}</span>
                    <span className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-row-menu-button"
                        aria-expanded={openToolbarId === `category-${category.id}`}
                        aria-label="Thao tác danh mục"
                        onClick={(event) => handleToggleToolbar(event, `category-${category.id}`)}
                      >
                        <MoreHorizontal size={18} strokeWidth={2} />
                      </button>

                      {openToolbarId === `category-${category.id}` && (
                        <span className="admin-row-toolbar" style={{ right: '42px', top: '50%', transform: 'translateY(-50%)' }}>
                          <button type="button" onClick={() => handleSelectCategory(category)}>
                            Chi tiết
                          </button>
                          <button
                            type="button"
                            className="danger"
                            disabled={submitting}
                            onClick={(event) => handleDeleteCategoryQuick(event, category.id)}
                          >
                            Xóa
                          </button>
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )
            })}
            {filteredCategories.length === 0 && <AdminEmptyState />}
          </>
        )}
      </div>
    </div>
  )
}

export default ServiceListPanel
