import { RefreshCw, Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import { parseMoneyInput } from '../../../utils/moneyInput'
import CategoryEditor from './components/CategoryEditor'
import ServiceEditor from './components/ServiceEditor'
import ServiceListPanel from './components/ServiceListPanel'
import Loading from '../../../components/Loading/Loading'
import Modal from '../../../components/Modal/Modal'

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

  // Layout & Navigation States
  const [activeTab, setActiveTab] = useState('services')
  const [activeEditor, setActiveEditor] = useState('service') // 'service' | 'category' | null
  const [showCreateDropdown, setShowCreateDropdown] = useState(false)

  const activeServices = services.filter((service) => service.status === 'ACTIVE').length
  const visibleServices = services.filter((service) => service.publicVisible !== false).length
  const ungroupedServices = services.filter((service) => !service.categoryId && !service.categoryName).length

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

  // Setup initial editor selection when data loads
  useEffect(() => {
    if (services.length > 0 && selectedServiceId === null) {
      const matched = services.find((s) => s.id === services[0]?.id)
      if (matched) {
        selectService(matched)
      }
    }
  }, [services])

  // Close dropdown on click outside
  useEffect(() => {
    if (!showCreateDropdown) return
    const handleOutsideClick = () => setShowCreateDropdown(false)
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [showCreateDropdown])

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
    setActiveEditor('service')
  }

  const selectService = async (service) => {
    setSelectedServiceId(service.id)
    setServiceForm(serviceToForm(service))
    setActiveEditor('service')
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
    setActiveEditor('category')
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
    setActiveEditor('category')
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
      setActiveEditor(null)
      await reloadAll()
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
      setSelectedCategoryId(null)
      setCategoryForm(emptyCategoryForm)
      setActiveEditor(null)
      await loadServices()
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

  const handleCloseEditor = () => {
    setActiveEditor(null)
    setSelectedServiceId(null)
    setSelectedCategoryId(null)
  }

  const toggleSelected = (serviceId) => {
    setSelectedIds((items) => (items.includes(serviceId) ? items.filter((id) => id !== serviceId) : [...items, serviceId]))
  }

  // Quick Action Handlers for 3-dots menus
  const handleUpdateServiceQuick = async (serviceId, patch) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return
    setSubmitting(true)
    setViewError('')
    try {
      const currentForm = serviceToForm(service)
      const updatedForm = { ...currentForm, ...patch }
      const payload = buildServicePayload(updatedForm, true)
      const saved = await adminApi.updateService(serviceId, payload, token)
      setServices((items) => items.map((item) => (item.id === saved.id ? saved : item)))
      if (selectedServiceId === serviceId) {
        setServiceForm(serviceToForm(saved))
      }
      onSetNotice(`Đã cập nhật dịch vụ ${saved.name}.`)
    } catch (err) {
      setViewError(err.message || 'Không cập nhật nhanh được dịch vụ.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteServiceQuick = async (serviceId) => {
    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.deleteService(serviceId, token)
      setServices((items) => items.map((item) => (item.id === saved.id ? saved : item)))
      if (selectedServiceId === serviceId) {
        setServiceForm(serviceToForm(saved))
      }
      onSetNotice(`Đã ẩn/xóa dịch vụ ${saved.name}.`)
    } catch (err) {
      setViewError(err.message || 'Không xóa nhanh được dịch vụ.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCategoryQuick = async (categoryId) => {
    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.deleteServiceCategory(categoryId, token)
      setCategories((items) => items.filter((item) => item.id !== categoryId))
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null)
        setCategoryForm(emptyCategoryForm)
        setActiveEditor(null)
      }
      await loadServices()
      onSetNotice('Đã xóa danh mục.')
    } catch (err) {
      setViewError(err.message || 'Không xóa nhanh được danh mục.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">Dịch vụ</span>
          <h2>Quản lý dịch vụ & danh mục</h2>
        </div>
        <div className="admin-toolbar-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }}>
          <button type="button" className="admin-icon-button" onClick={reloadAll} disabled={loading}>
            <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
            <span>Tải lại</span>
          </button>

          <div className="admin-create-dropdown-container">
            <button
              type="button"
              className="admin-primary-button"
              onClick={(event) => {
                event.stopPropagation()
                setShowCreateDropdown((prev) => !prev)
              }}
            >
              <Plus size={18} strokeWidth={2} />
              <span>Tạo mới</span>
            </button>
            {showCreateDropdown && (
              <div className="admin-dropdown-menu">
                <button
                  type="button"
                  onClick={() => {
                    startCreateService()
                    setShowCreateDropdown(false)
                  }}
                >
                  Sản phẩm mới
                </button>
                <button
                  type="button"
                  onClick={() => {
                    startCreateCategory()
                    setShowCreateDropdown(false)
                  }}
                >
                  Danh mục mới
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <p className="admin-message error">{error}</p>}
      {!error && loading && <Loading fullScreen={false} message="Đang tải dữ liệu admin..." subMessage="" />}

      <div className="admin-services-summary" aria-label="Tổng quan dịch vụ">
        <div>
          <span>Danh mục</span>
          <strong>{categories.length}</strong>
        </div>
        <div>
          <span>Sản phẩm</span>
          <strong>{services.length}</strong>
        </div>
        <div>
          <span>Đang bán</span>
          <strong>{activeServices}</strong>
        </div>
        <div>
          <span>Public</span>
          <strong>{visibleServices}</strong>
        </div>
        <div>
          <span>Chưa phân nhóm</span>
          <strong>{ungroupedServices}</strong>
        </div>
      </div>

      <div className="admin-grid detail-layout">
        <ServiceListPanel
          activeTab={activeTab}
          onTabChange={setActiveTab}
          categories={categories}
          onBulkStatus={bulkStatus}
          onQueryChange={setQuery}
          onSelectService={selectService}
          onSelectCategory={selectCategory}
          onStartCreateService={startCreateService}
          onStatusFilterChange={setStatusFilter}
          onToggleSelected={toggleSelected}
          query={query}
          selectedIds={selectedIds}
          selectedServiceId={selectedServiceId}
          selectedCategoryId={selectedCategoryId}
          services={services}
          statusFilter={statusFilter}
          submitting={submitting}
          onUpdateServiceQuick={handleUpdateServiceQuick}
          onDeleteServiceQuick={handleDeleteServiceQuick}
          onDeleteCategoryQuick={handleDeleteCategoryQuick}
        />
      </div>

      <Modal isOpen={activeEditor === 'service'} onClose={handleCloseEditor} showHeader={false} maxWidth="1000px">
        <ServiceEditor
          key={selectedServiceId || 'new'}
          categories={categories}
          onDeleteService={deleteService}
          onSubmitService={submitService}
          onUpdateServiceForm={updateServiceForm}
          selectedServiceCategories={selectedServiceCategories}
          selectedServiceId={selectedServiceId}
          serviceForm={serviceForm}
          serviceOrders={serviceOrders}
          submitting={submitting}
          onClose={handleCloseEditor}
        />
      </Modal>

      <Modal isOpen={activeEditor === 'category'} onClose={handleCloseEditor} showHeader={false} maxWidth="800px">
        <CategoryEditor
          key={selectedCategoryId || 'new'}
          categories={categories}
          categoryForm={categoryForm}
          onCategoryFormChange={updateCategoryForm}
          onDeleteCategory={deleteCategory}
          onSubmitCategory={submitCategory}
          selectedCategoryId={selectedCategoryId}
          submitting={submitting}
          onClose={handleCloseEditor}
        />
      </Modal>
    </section>
  )
}

export default AdminServicesView
