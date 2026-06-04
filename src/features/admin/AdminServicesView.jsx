import { Plus, RefreshCw, Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import { adminApi } from '../../api/admin.api'

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
  categories,
  error,
  loading,
  onReload,
  onSetError,
  onSetNotice,
  onUpdateCategories,
  onUpdateServices,
  services,
  token,
}) {
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)
  const [query, setQuery] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [serviceForm, setServiceForm] = useState(emptyServiceForm)
  const [statusFilter, setStatusFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filteredServices = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return services.filter((service) => {
      const matchesStatus = !statusFilter || service.status === statusFilter
      const matchesQuery =
        !keyword ||
        service.name?.toLowerCase().includes(keyword) ||
        service.slug?.toLowerCase().includes(keyword) ||
        service.categoryName?.toLowerCase().includes(keyword)
      return matchesStatus && matchesQuery
    })
  }, [query, services, statusFilter])

  const updateServiceForm = (field, value) => {
    setServiceForm((current) => ({ ...current, [field]: value }))
  }

  const updateCategoryForm = (field, value) => {
    setCategoryForm((current) => ({ ...current, [field]: value }))
  }

  const startCreateService = () => {
    setSelectedServiceId(null)
    setServiceForm(emptyServiceForm)
  }

  const selectService = (service) => {
    setSelectedServiceId(service.id)
    setServiceForm(serviceToForm(service))
  }

  const submitCategory = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    onSetError('')
    try {
      const created = await adminApi.createServiceCategory({
        description: categoryForm.description || undefined,
        name: categoryForm.name.trim(),
        parentId: categoryForm.parentId ? Number(categoryForm.parentId) : undefined,
        slug: categoryForm.slug.trim(),
        sortOrder: Number(categoryForm.sortOrder) || 0,
      }, token)
      onUpdateCategories((items) => [...items, created].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)))
      setCategoryForm(emptyCategoryForm)
      onSetNotice(`Đã tạo nhóm ${created.name}.`)
    } catch (err) {
      onSetError(err.message || 'Không tạo được nhóm dịch vụ.')
    } finally {
      setSubmitting(false)
    }
  }

  const submitService = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    onSetError('')
    try {
      const isEditing = Boolean(selectedServiceId)
      const payload = buildServicePayload(serviceForm, isEditing)
      const saved = isEditing 
        ? await adminApi.updateService(selectedServiceId, payload, token)
        : await adminApi.createService(payload, token)
      onUpdateServices((items) => {
        const next = isEditing ? items.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...items]
        return next.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      })
      setSelectedServiceId(saved.id)
      setServiceForm(serviceToForm(saved))
      await onReload()
      onSetNotice(`Đã lưu dịch vụ ${saved.name}.`)
    } catch (err) {
      onSetError(err.message || 'Không lưu được dịch vụ.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">Service management</span>
          <h2>Quản lý dịch vụ và nhóm dịch vụ</h2>
        </div>
        <button type="button" className="admin-icon-button" onClick={onReload} disabled={loading}>
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
              <article key={category.id}>
                <strong>{category.name}</strong>
                <span>/{category.slug}</span>
              </article>
            ))}
          </div>

          <form className="admin-form compact" onSubmit={submitCategory}>
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
              <span>Thêm nhóm</span>
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
          <div className="admin-service-list">
            {filteredServices.map((service) => (
              <button
                key={service.id}
                type="button"
                className={selectedServiceId === service.id ? 'selected' : ''}
                onClick={() => selectService(service)}
              >
                <strong>{service.name}</strong>
                <span>{service.categoryName || 'Chưa phân nhóm'} · {service.status} · {service.priceText || service.price}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <form className="admin-form service-editor" onSubmit={submitService}>
        <div className="admin-panel-head">
          <h3>{selectedServiceId ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới'}</h3>
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
      </form>
    </section>
  )
}

export default AdminServicesView
