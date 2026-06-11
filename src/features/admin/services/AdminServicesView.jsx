import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import { parseMoneyInput } from '../../../utils/moneyInput'
import CategoryPanel from './components/CategoryPanel'
import ServiceEditor from './components/ServiceEditor'
import ServiceListPanel from './components/ServiceListPanel'

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

function slugify(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function toMoney(value, fallback = undefined) {
  const parsed = parseMoneyInput(value)
  if (parsed === '' || parsed == null) {
    return fallback
  }

  return Number(parsed)
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
    setServiceForm((current) => {
      const next = {
        ...current,
        [field]: field === 'price' || field === 'costPrice' ? parseMoneyInput(value) : value,
      }
      if (field === 'name' && (!current.slug || current.slug === slugify(current.name))) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const updateCategoryForm = (field, value) => {
    setCategoryForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'name' && (!current.slug || current.slug === slugify(current.name))) {
        next.slug = slugify(value)
      }
      return next
    })
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
        <CategoryPanel
          categories={categories}
          categoryForm={categoryForm}
          onCategoryFormChange={updateCategoryForm}
          onDeleteCategory={deleteCategory}
          onSelectCategory={selectCategory}
          onStartCreateCategory={startCreateCategory}
          onSubmitCategory={submitCategory}
          selectedCategoryId={selectedCategoryId}
          submitting={submitting}
        />
        <ServiceListPanel
          onBulkStatus={bulkStatus}
          onQueryChange={setQuery}
          onSelectService={selectService}
          onStartCreateService={startCreateService}
          onStatusFilterChange={setStatusFilter}
          onToggleSelected={toggleSelected}
          query={query}
          selectedIds={selectedIds}
          selectedServiceId={selectedServiceId}
          services={services}
          statusFilter={statusFilter}
          submitting={submitting}
        />
      </div>

      <ServiceEditor
        categories={categories}
        onDeleteService={deleteService}
        onSubmitService={submitService}
        onUpdateServiceForm={updateServiceForm}
        selectedServiceCategories={selectedServiceCategories}
        selectedServiceId={selectedServiceId}
        serviceForm={serviceForm}
        serviceOrders={serviceOrders}
        submitting={submitting}
      />
    </section>
  )
}

export default AdminServicesView
