import { Plus, RefreshCw, Save, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../api/admin.api'
import { AdminEmptyState } from './AdminShared'
import { formatAdminDate, formatAdminMoney } from './adminFormat'

const emptyServiceForm = {
  benefits: '',
  categoryId: '',
  clearCategory: false,
  costPrice: '',
  ctaType: 'BUY_NOW',
  description: '',
  featured: false,
  iconUrl: '',
  inputSchema: '',
  metaDescription: '',
  metaTitle: '',
  name: '',
  price: '',
  priceText: '',
  pricingBadge: '',
  processingTime: '',
  publicVisible: true,
  requirements: '',
  shortDescription: '',
  slug: '',
  sortOrder: '0',
  status: 'ACTIVE',
  stockStatus: 'AVAILABLE',
  type: 'MANUAL',
  usageNotes: '',
  warrantyPolicy: '',
}

const emptyCategoryForm = {
  description: '',
  name: '',
  parentId: '',
  slug: '',
  sortOrder: '0',
}

const serviceTypes = ['MANUAL', 'AUTO', 'SUBSCRIPTION', 'API_CREDIT']
const serviceStatuses = ['DRAFT', 'ACTIVE', 'INACTIVE', 'MAINTENANCE']
const stockStatuses = ['AVAILABLE', 'OUT_OF_STOCK', 'CONSULTING_ONLY']
const ctaTypes = ['BUY_NOW', 'CONTACT', 'CONSULT']
const facebookSchema = JSON.stringify({
  properties: {
    facebookUrl: { label: 'Link Facebook', type: 'string' },
    note: { label: 'Ghi chú xử lý', type: 'string' },
  },
  required: ['facebookUrl'],
  type: 'object',
}, null, 2)

function toMoney(value, fallback = undefined) {
  if (value === '' || value == null) {
    return fallback
  }

  return Number(value)
}

function serviceToForm(service) {
  return {
    benefits: service.benefits || '',
    categoryId: service.categoryId ? String(service.categoryId) : '',
    clearCategory: false,
    costPrice: service.costPrice ?? '',
    ctaType: service.ctaType || 'BUY_NOW',
    description: service.description || '',
    featured: Boolean(service.featured),
    iconUrl: service.iconUrl || '',
    inputSchema: service.inputSchema || '',
    metaDescription: service.metaDescription || '',
    metaTitle: service.metaTitle || '',
    name: service.name || '',
    price: service.price ?? '',
    priceText: service.priceText || '',
    pricingBadge: service.pricingBadge || '',
    processingTime: service.processingTime || '',
    publicVisible: service.publicVisible !== false,
    requirements: service.requirements || '',
    shortDescription: service.shortDescription || '',
    slug: service.slug || '',
    sortOrder: String(service.sortOrder ?? 0),
    status: service.status || 'ACTIVE',
    stockStatus: service.stockStatus || 'AVAILABLE',
    type: service.type || 'MANUAL',
    usageNotes: service.usageNotes || '',
    warrantyPolicy: service.warrantyPolicy || '',
  }
}

function buildServicePayload(form, isEditing) {
  return {
    benefits: form.benefits || undefined,
    categoryId: form.categoryId ? Number(form.categoryId) : undefined,
    clearCategory: isEditing && !form.categoryId ? true : undefined,
    costPrice: toMoney(form.costPrice),
    ctaType: form.ctaType,
    description: form.description || undefined,
    featured: form.featured,
    iconUrl: form.iconUrl || undefined,
    inputSchema: form.inputSchema || undefined,
    metaDescription: form.metaDescription || undefined,
    metaTitle: form.metaTitle || undefined,
    name: form.name.trim(),
    price: toMoney(form.price, 0),
    priceText: form.priceText || undefined,
    pricingBadge: form.pricingBadge || undefined,
    processingTime: form.processingTime || undefined,
    publicVisible: form.publicVisible,
    requirements: form.requirements || undefined,
    shortDescription: form.shortDescription || undefined,
    slug: form.slug.trim(),
    sortOrder: Number(form.sortOrder) || 0,
    status: form.status,
    stockStatus: form.stockStatus,
    type: form.type,
    usageNotes: form.usageNotes || undefined,
    warrantyPolicy: form.warrantyPolicy || undefined,
  }
}

function AdminServicesView({
  onSetError,
  onSetNotice,
  token,
}) {
  const [categories, setCategories] = useState([])
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [selectedServiceCategories, setSelectedServiceCategories] = useState([])
  const [serviceForm, setServiceForm] = useState(emptyServiceForm)
  const [serviceOrders, setServiceOrders] = useState([])
  const [services, setServices] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const setViewError = useCallback((message) => {
    setError(message)
    onSetError(message)
  }, [onSetError])

  const loadCategories = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setCategories(await adminApi.getServiceCategories(token))
    } catch (err) {
      setViewError(err.message || 'Không tải được nhóm dịch vụ.')
    }
  }, [setViewError, token])

  const loadServices = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setViewError('')
    try {
      const data = await adminApi.searchServices({ query: query.trim(), status: statusFilter }, token)
      setServices(data)
      setSelectedServiceId((current) => (current && data.some((item) => item.id === current) ? current : data[0]?.id || null))
    } catch (err) {
      setViewError(err.message || 'Không tải được dịch vụ.')
    } finally {
      setLoading(false)
    }
  }, [query, setViewError, statusFilter, token])

  const reloadAll = useCallback(async () => {
    await Promise.all([loadCategories(), loadServices()])
  }, [loadCategories, loadServices])

  useEffect(() => {
    const timer = window.setTimeout(loadCategories, 0)
    return () => window.clearTimeout(timer)
  }, [loadCategories])

  useEffect(() => {
    const timer = window.setTimeout(loadServices, 250)
    return () => window.clearTimeout(timer)
  }, [loadServices])

  const updateServiceForm = (field, value) => {
    setServiceForm((current) => ({ ...current, [field]: value }))
  }

  const updateCategoryForm = (field, value) => {
    setCategoryForm((current) => ({ ...current, [field]: value }))
  }

  const startCreateService = () => {
    setSelectedServiceId(null)
    setServiceForm(emptyServiceForm)
    setServiceOrders([])
    setSelectedServiceCategories([])
  }

  const selectService = async (service) => {
    setSelectedServiceId(service.id)
    setServiceForm(serviceToForm(service))
    try {
      const [orders, serviceCategories] = await Promise.all([
        adminApi.getServiceOrders(service.id, token),
        adminApi.getServiceCategoryLinks(service.id, token),
      ])
      setServiceOrders(orders)
      setSelectedServiceCategories(serviceCategories)
    } catch {
      setServiceOrders([])
      setSelectedServiceCategories([])
    }
  }

  const selectCategory = async (category) => {
    setSelectedCategoryId(category.id)
    try {
      const detail = await adminApi.getServiceCategory(category.id, token)
      setCategoryForm({
        description: detail.description || '',
        name: detail.name || '',
        parentId: detail.parentId ? String(detail.parentId) : '',
        slug: detail.slug || '',
        sortOrder: String(detail.sortOrder ?? 0),
      })
    } catch {
      setCategoryForm({
        description: category.description || '',
        name: category.name || '',
        parentId: category.parentId ? String(category.parentId) : '',
        slug: category.slug || '',
        sortOrder: String(category.sortOrder ?? 0),
      })
    }
  }

  const startCreateCategory = () => {
    setSelectedCategoryId(null)
    setCategoryForm(emptyCategoryForm)
  }

  const submitCategory = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setViewError('')
    try {
      const payload = {
        description: categoryForm.description || undefined,
        name: categoryForm.name.trim(),
        parentId: categoryForm.parentId ? Number(categoryForm.parentId) : undefined,
        slug: categoryForm.slug.trim(),
        sortOrder: Number(categoryForm.sortOrder) || 0,
      }
      const saved = selectedCategoryId
        ? await adminApi.updateServiceCategory(selectedCategoryId, payload, token)
        : await adminApi.createServiceCategory(payload, token)
      setCategories((items) => {
        const next = selectedCategoryId ? items.map((item) => (item.id === saved.id ? saved : item)) : [...items, saved]
        return next.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      })
      setSelectedCategoryId(saved.id)
      setCategoryForm(emptyCategoryForm)
      onSetNotice(`Đã lưu nhóm ${saved.name}.`)
    } catch (err) {
      setViewError(err.message || 'Không lưu được nhóm dịch vụ.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteCategory = async () => {
    if (!selectedCategoryId) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.deleteServiceCategory(selectedCategoryId, token)
      setCategories((items) => items.filter((item) => item.id !== selectedCategoryId))
      startCreateCategory()
      onSetNotice('Đã xóa nhóm dịch vụ.')
    } catch (err) {
      setViewError(err.message || 'Không xóa được nhóm dịch vụ.')
    } finally {
      setSubmitting(false)
    }
  }

  const submitService = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setViewError('')
    try {
      const isEditing = Boolean(selectedServiceId)
      const payload = buildServicePayload(serviceForm, isEditing)
      const saved = isEditing 
        ? await adminApi.updateService(selectedServiceId, payload, token)
        : await adminApi.createService(payload, token)
      setServices((items) => {
        const next = isEditing ? items.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...items]
        return next.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      })
      setSelectedServiceId(saved.id)
      setServiceForm(serviceToForm(saved))
      await reloadAll()
      onSetNotice(`Đã lưu dịch vụ ${saved.name}.`)
    } catch (err) {
      setViewError(err.message || 'Không lưu được dịch vụ.')
    } finally {
      setSubmitting(false)
    }
  }

  const bulkStatus = async (enabled) => {
    if (selectedIds.length === 0) {
      setViewError('Chọn ít nhất một dịch vụ để bulk update.')
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const payload = { ids: selectedIds, reason: enabled ? 'Bulk enable từ UI admin' : 'Bulk disable từ UI admin' }
      await (enabled ? adminApi.bulkEnableServices(payload, token) : adminApi.bulkDisableServices(payload, token))
      setSelectedIds([])
      await loadServices()
      onSetNotice(`Đã ${enabled ? 'bật' : 'tắt'} ${selectedIds.length} dịch vụ.`)
    } catch (err) {
      setViewError(err.message || 'Không bulk update được dịch vụ.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteService = async () => {
    if (!selectedServiceId) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.deleteService(selectedServiceId, token)
      setServices((items) => items.map((item) => (item.id === saved.id ? saved : item)))
      setServiceForm(serviceToForm(saved))
      onSetNotice(`Đã xóa/ẩn dịch vụ ${saved.name}.`)
    } catch (err) {
      setViewError(err.message || 'Không xóa được dịch vụ.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleSelected = (serviceId) => {
    setSelectedIds((items) => (items.includes(serviceId) ? items.filter((id) => id !== serviceId) : [...items, serviceId]))
  }

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">Service management</span>
          <h2>Quản lý dịch vụ và nhóm dịch vụ</h2>
        </div>
        <button type="button" className="admin-icon-button" onClick={reloadAll} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {(error || loading) && <p className={error ? 'admin-message error' : 'admin-message'}>{error || 'Đang tải dữ liệu admin...'}</p>}

      <div className="admin-grid two-columns">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Danh mục</h3>
            <span>{categories.length} nhóm</span>
          </div>
          <div className="admin-category-list">
            {categories.map((category) => (
              <article className={selectedCategoryId === category.id ? 'selected' : ''} key={category.id} onClick={() => selectCategory(category)}>
                <strong>{category.name}</strong>
                <span>/{category.slug}</span>
              </article>
            ))}
          </div>

          <form className="admin-form compact" onSubmit={submitCategory}>
            <div className="admin-panel-head compact-head">
              <h3>{selectedCategoryId ? 'Sửa nhóm' : 'Thêm nhóm'}</h3>
              <button type="button" onClick={startCreateCategory}>Mới</button>
            </div>
            <label>
              <span>Tên nhóm</span>
              <input value={categoryForm.name} onChange={(event) => updateCategoryForm('name', event.target.value)} required />
            </label>
            <label>
              <span>Slug</span>
              <input value={categoryForm.slug} onChange={(event) => updateCategoryForm('slug', event.target.value)} required />
            </label>
            <label>
              <span>Thứ tự</span>
              <input value={categoryForm.sortOrder} onChange={(event) => updateCategoryForm('sortOrder', event.target.value)} inputMode="numeric" />
            </label>
            <label>
              <span>Mô tả</span>
              <textarea value={categoryForm.description} onChange={(event) => updateCategoryForm('description', event.target.value)} rows="3" />
            </label>
            <button type="submit" className="admin-primary-button" disabled={submitting}>
              <Plus size={17} strokeWidth={2} aria-hidden="true" />
              <span>{selectedCategoryId ? 'Lưu nhóm' : 'Thêm nhóm'}</span>
            </button>
            <button type="button" className="admin-danger-button" disabled={!selectedCategoryId || submitting} onClick={deleteCategory}>
              <Trash2 size={17} strokeWidth={2} aria-hidden="true" />
              <span>Xóa nhóm</span>
            </button>
          </form>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Danh sách dịch vụ</h3>
            <button type="button" onClick={startCreateService}>Tạo mới</button>
          </div>
          <div className="admin-filters">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên, slug, nhóm" type="search" />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {serviceStatuses.map((status) => (
                <option value={status} key={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="admin-action-row">
            <button type="button" className="admin-icon-button" disabled={submitting || selectedIds.length === 0} onClick={() => bulkStatus(true)}>Bulk enable</button>
            <button type="button" className="admin-danger-button" disabled={submitting || selectedIds.length === 0} onClick={() => bulkStatus(false)}>Bulk disable</button>
          </div>
          <div className="admin-service-list">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                className={selectedServiceId === service.id ? 'selected' : ''}
                onClick={() => selectService(service)}
              >
                <input checked={selectedIds.includes(service.id)} onChange={() => toggleSelected(service.id)} onClick={(event) => event.stopPropagation()} type="checkbox" />
                <strong>{service.name}</strong>
                <span>{service.categoryName || 'Chưa phân nhóm'} · {service.status} · {service.priceText || service.price}</span>
              </button>
            ))}
            {services.length === 0 && <AdminEmptyState />}
          </div>
        </div>
      </div>

      <form className="admin-form service-editor" onSubmit={submitService}>
        <div className="admin-panel-head">
          <h3>{selectedServiceId ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới'}</h3>
          <button type="button" className="admin-danger-button" disabled={!selectedServiceId || submitting} onClick={deleteService}>
            <Trash2 size={17} strokeWidth={2} aria-hidden="true" />
            <span>Xóa dịch vụ</span>
          </button>
          <button type="submit" disabled={submitting}>
            <Save size={17} strokeWidth={2} aria-hidden="true" />
            <span>Lưu dịch vụ</span>
          </button>
        </div>

        <div className="admin-form-grid">
          <label>
            <span>Tên dịch vụ</span>
            <input value={serviceForm.name} onChange={(event) => updateServiceForm('name', event.target.value)} required />
          </label>
          <label>
            <span>Slug</span>
            <input value={serviceForm.slug} onChange={(event) => updateServiceForm('slug', event.target.value)} required />
          </label>
          <label>
            <span>Nhóm</span>
            <select value={serviceForm.categoryId} onChange={(event) => updateServiceForm('categoryId', event.target.value)}>
              <option value="">Chưa phân nhóm</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Loại xử lý</span>
            <select value={serviceForm.type} onChange={(event) => updateServiceForm('type', event.target.value)}>
              {serviceTypes.map((type) => <option value={type} key={type}>{type}</option>)}
            </select>
          </label>
          <label>
            <span>Trạng thái</span>
            <select value={serviceForm.status} onChange={(event) => updateServiceForm('status', event.target.value)}>
              {serviceStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
            </select>
          </label>
          <label>
            <span>Tình trạng kho</span>
            <select value={serviceForm.stockStatus} onChange={(event) => updateServiceForm('stockStatus', event.target.value)}>
              {stockStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
            </select>
          </label>
          <label>
            <span>CTA</span>
            <select value={serviceForm.ctaType} onChange={(event) => updateServiceForm('ctaType', event.target.value)}>
              {ctaTypes.map((type) => <option value={type} key={type}>{type}</option>)}
            </select>
          </label>
          <label>
            <span>Thứ tự</span>
            <input value={serviceForm.sortOrder} onChange={(event) => updateServiceForm('sortOrder', event.target.value)} inputMode="numeric" />
          </label>
          <label>
            <span>Giá số</span>
            <input value={serviceForm.price} onChange={(event) => updateServiceForm('price', event.target.value)} inputMode="decimal" required />
          </label>
          <label>
            <span>Giá hiển thị</span>
            <input value={serviceForm.priceText} onChange={(event) => updateServiceForm('priceText', event.target.value)} placeholder="Từ 390.000đ / Báo giá theo brief" />
          </label>
          <label>
            <span>Giá vốn</span>
            <input value={serviceForm.costPrice} onChange={(event) => updateServiceForm('costPrice', event.target.value)} inputMode="decimal" />
          </label>
          <label>
            <span>Badge bảng giá</span>
            <input value={serviceForm.pricingBadge} onChange={(event) => updateServiceForm('pricingBadge', event.target.value)} placeholder="Phổ biến, Bán chạy..." />
          </label>
          <label>
            <span>Thời gian xử lý</span>
            <input value={serviceForm.processingTime} onChange={(event) => updateServiceForm('processingTime', event.target.value)} />
          </label>
          <label>
            <span>Bảo hành</span>
            <input value={serviceForm.warrantyPolicy} onChange={(event) => updateServiceForm('warrantyPolicy', event.target.value)} />
          </label>
          <label className="wide">
            <span>Mô tả ngắn</span>
            <textarea value={serviceForm.shortDescription} onChange={(event) => updateServiceForm('shortDescription', event.target.value)} rows="2" />
          </label>
          <label className="wide">
            <span>Mô tả chi tiết</span>
            <textarea value={serviceForm.description} onChange={(event) => updateServiceForm('description', event.target.value)} rows="4" />
          </label>
          <label className="wide">
            <span>Điều kiện / cần chuẩn bị (JSON hoặc text)</span>
            <textarea value={serviceForm.requirements} onChange={(event) => updateServiceForm('requirements', event.target.value)} rows="3" />
          </label>
          <label className="wide">
            <span>Lợi ích</span>
            <textarea value={serviceForm.benefits} onChange={(event) => updateServiceForm('benefits', event.target.value)} rows="3" />
          </label>
          <label className="wide">
            <span>Lưu ý sử dụng</span>
            <textarea value={serviceForm.usageNotes} onChange={(event) => updateServiceForm('usageNotes', event.target.value)} rows="3" />
          </label>
          <label className="wide">
            <span>Input schema</span>
            <textarea value={serviceForm.inputSchema} onChange={(event) => updateServiceForm('inputSchema', event.target.value)} rows="6" placeholder='{"type":"object","required":["facebookUrl"],"properties":{...}}' />
          </label>
          <div className="wide admin-action-row">
            <button type="button" className="admin-icon-button" onClick={() => updateServiceForm('inputSchema', facebookSchema)}>Mẫu Facebook</button>
            <button type="button" className="admin-icon-button" onClick={() => updateServiceForm('inputSchema', '')}>Xóa schema</button>
          </div>
        </div>

        <div className="admin-check-row">
          <label>
            <input checked={serviceForm.featured} onChange={(event) => updateServiceForm('featured', event.target.checked)} type="checkbox" />
            <span>Hiển thị nổi bật</span>
          </label>
          <label>
            <input checked={serviceForm.publicVisible} onChange={(event) => updateServiceForm('publicVisible', event.target.checked)} type="checkbox" />
            <span>Hiển thị public</span>
          </label>
        </div>

        {selectedServiceId && (
          <div className="admin-panel-subsection">
            <div className="admin-panel-head compact-head">
              <h3>Đơn gần đây của dịch vụ</h3>
              <span>{serviceOrders.length} đơn</span>
            </div>
            <div className="admin-mini-list">
              {selectedServiceCategories.map((category) => (
                <article key={category.id}>
                  <strong>{category.name}</strong>
                  <span>/{category.slug} · sort {category.sortOrder}</span>
                </article>
              ))}
              {serviceOrders.map((order) => (
                <article key={order.id}>
                  <strong>{order.orderCode}</strong>
                  <span>User #{order.userId} · {formatAdminMoney(order.amount)} · {order.status} · {formatAdminDate(order.createdAt)}</span>
                </article>
              ))}
              {selectedServiceCategories.length === 0 && serviceOrders.length === 0 && <AdminEmptyState message="Chưa có danh mục hoặc đơn gần đây cho dịch vụ này." />}
            </div>
          </div>
        )}
      </form>
    </section>
  )
}

export default AdminServicesView
