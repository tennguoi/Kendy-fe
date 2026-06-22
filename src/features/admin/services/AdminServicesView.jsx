import { RefreshCw, Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../api/admin.api'
import { normalizePaged } from '../../../utils/pagination'
import { parseMoneyInput } from '../../../utils/moneyInput'
import CategoryEditor from './components/CategoryEditor'
import ServiceEditor from './components/ServiceEditor'
import ServiceListPanel from './components/ServiceListPanel'
import Pagination from '../../../components/Pagination/Pagination'
import Loading from '../../../components/Loading/Loading'
import Modal from '../../../components/Modal/Modal'

const emptyServiceForm = {
  accessDurationDays: '30',
  accessStrategy: 'MANUAL',
  benefits: '',
  categoryId: '',
  clearCategory: false,
  costPrice: '',
  ctaType: 'BUY_NOW',
  description: '',
  featured: false,
  iconUrl: '',
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
  microcopy: '',
  priceFrom: '',
  processingTime: '',
  warranty: '',
  requirements: '',
  cta: '',
}

const emptyCredentialForm = {
  expiresAt: '',
  internalNote: '',
  loginIdentifier: '',
  passwordSecret: '',
  recoveryInfo: '',
  twoFactorSecret: '',
  usageNote: '',
  warrantyUntil: '',
}

const emptyCredentialFilters = {
  createdFrom: '',
  createdTo: '',
  deliveredFrom: '',
  deliveredTo: '',
  expiresBefore: '',
  query: '',
  status: '',
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
    accessDurationDays: service.accessDurationDays ?? '30',
    accessStrategy: service.accessStrategy || (service.type === 'ACCOUNT_STOCK' ? 'DEDICATED_ACCOUNT' : 'MANUAL'),
    benefits: service.benefits || '',
    categoryId: service.categoryId ? String(service.categoryId) : '',
    clearCategory: false,
    costPrice: service.costPrice ?? '',
    ctaType: service.ctaType || 'BUY_NOW',
    description: service.description || '',
    featured: Boolean(service.featured),
    iconUrl: service.iconUrl || '',
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
    accessDurationDays: form.accessDurationDays ? Number(form.accessDurationDays) : undefined,
    accessStrategy: form.accessStrategy,
    benefits: form.benefits || undefined,
    categoryId: form.categoryId ? Number(form.categoryId) : undefined,
    clearCategory: isEditing && !form.categoryId ? true : undefined,
    costPrice: toMoney(form.costPrice),
    ctaType: form.ctaType,
    description: form.description || undefined,
    featured: form.featured,
    iconUrl: form.iconUrl || undefined,
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

function toInstant(value) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function toDateTimeInput(value) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localTime.toISOString().slice(0, 16)
}

function buildCredentialPayload(form) {
  return {
    expiresAt: toInstant(form.expiresAt),
    internalNote: form.internalNote || undefined,
    loginIdentifier: form.loginIdentifier.trim(),
    passwordSecret: form.passwordSecret.trim(),
    recoveryInfo: form.recoveryInfo || undefined,
    twoFactorSecret: form.twoFactorSecret || undefined,
    usageNote: form.usageNote || undefined,
    warrantyUntil: toInstant(form.warrantyUntil),
  }
}

function buildCredentialFilterParams(filters) {
  return {
    createdFrom: toInstant(filters.createdFrom),
    createdTo: toInstant(filters.createdTo),
    deliveredFrom: toInstant(filters.deliveredFrom),
    deliveredTo: toInstant(filters.deliveredTo),
    expiresBefore: toInstant(filters.expiresBefore),
    query: filters.query?.trim() || undefined,
    status: filters.status || undefined,
  }
}

function credentialToForm(credential) {
  return {
    expiresAt: toDateTimeInput(credential.expiresAt),
    internalNote: credential.internalNote || '',
    loginIdentifier: credential.loginIdentifier || '',
    passwordSecret: '',
    recoveryInfo: '',
    twoFactorSecret: '',
    usageNote: credential.usageNote || '',
    warrantyUntil: toDateTimeInput(credential.warrantyUntil),
  }
}

function AdminServicesView({
  onSetError,
  onSetNotice,
  token,
}) {
  const location = useLocation()
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [selectedServiceCategories, setSelectedServiceCategories] = useState([])
  const [serviceCredentials, setServiceCredentials] = useState([])
  const [revealedCredentials, setRevealedCredentials] = useState({})
  const [credentialForm, setCredentialForm] = useState(emptyCredentialForm)
  const [credentialFilters, setCredentialFilters] = useState(emptyCredentialFilters)
  const [editingCredentialId, setEditingCredentialId] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [serviceForm, setServiceForm] = useState(emptyServiceForm)
  const [serviceOrders, setServiceOrders] = useState([])
  const [services, setServices] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Layout & Navigation States
  const [activeTab, setActiveTab] = useState('services')
  const [activeEditor, setActiveEditor] = useState(null) // 'service' | 'category' | null
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
      setViewError(err.message || t('admin.services.loadCategoriesError'))
    }
  }, [setViewError, token])

  const loadServices = useCallback(async (page) => {
    if (!token) {
      return
    }

    const targetPage = page ?? currentPage
    setLoading(true)
    setViewError('')
    try {
      const data = await adminApi.searchServices({ query: query.trim(), status: statusFilter, page: targetPage }, token)
      const { items, totalPages: pages } = normalizePaged(data, 100)
      setServices(items)
      setTotalPages(pages)
      setCurrentPage(targetPage)
      setSelectedServiceId((current) => (current && items.some((item) => item.id === current) ? current : items[0]?.id || null))
    } catch (err) {
      setViewError(err.message || t('admin.services.loadServicesError'))
    } finally {
      setLoading(false)
    }
  }, [currentPage, query, setViewError, statusFilter, token])

  const reloadAll = useCallback(async () => {
    await Promise.all([loadCategories(), loadServices()])
  }, [loadCategories, loadServices])

  useEffect(() => {
    const timer = window.setTimeout(loadCategories, 0)
    return () => window.clearTimeout(timer)
  }, [loadCategories])

  useEffect(() => {
    setCurrentPage(0)
  }, [query, statusFilter])

  useEffect(() => {
    const timer = window.setTimeout(() => loadServices(), 250)
    return () => window.clearTimeout(timer)
  }, [loadServices])

  useEffect(() => {
    if (location.pathname !== '/admin/services') {
      setActiveEditor(null)
      setShowCreateDropdown(false)
    }
  }, [location.pathname])

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

  const updateCredentialForm = (field, value) => {
    setCredentialForm((current) => ({ ...current, [field]: value }))
  }

  const updateCredentialFilter = (field, value) => {
    setCredentialFilters((current) => ({ ...current, [field]: value }))
  }

  const startCreateService = (serviceType = 'MANUAL') => {
    setSelectedServiceId(null)
    setServiceForm({
      ...emptyServiceForm,
      ctaType: serviceType === 'ACCOUNT_STOCK' ? 'BUY_NOW' : emptyServiceForm.ctaType,
      stockStatus: serviceType === 'ACCOUNT_STOCK' ? 'AVAILABLE' : emptyServiceForm.stockStatus,
      type: serviceType,
    })
    setServiceOrders([])
    setSelectedServiceCategories([])
    setServiceCredentials([])
    setRevealedCredentials({})
    setCredentialForm(emptyCredentialForm)
    setCredentialFilters(emptyCredentialFilters)
    setEditingCredentialId(null)
    setActiveEditor('service')
  }

  const loadServiceCredentials = useCallback(async (serviceId = selectedServiceId, filters = credentialFilters) => {
    if (!token || !serviceId) {
      return []
    }
    const credentials = await adminApi.getServiceCredentials(
      serviceId,
      token,
      buildCredentialFilterParams(filters),
    )
    setServiceCredentials(credentials)
    setRevealedCredentials({})
    return credentials
  }, [credentialFilters, selectedServiceId, token])

  const selectService = async (service) => {
    setSelectedServiceId(service.id)
    setServiceForm(serviceToForm(service))
    setEditingCredentialId(null)
    setCredentialForm(emptyCredentialForm)
    setActiveEditor('service')
    try {
      const [orders, serviceCategories, credentials] = await Promise.all([
        adminApi.getServiceOrders(service.id, token),
        adminApi.getServiceCategoryLinks(service.id, token),
        adminApi.getServiceCredentials(service.id, token, buildCredentialFilterParams(credentialFilters)),
      ])
      setServiceOrders(orders)
      setSelectedServiceCategories(serviceCategories)
      setServiceCredentials(credentials)
      setRevealedCredentials({})
    } catch {
      setServiceOrders([])
      setSelectedServiceCategories([])
      setServiceCredentials([])
      setRevealedCredentials({})
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
        microcopy: detail.microcopy || '',
        priceFrom: detail.priceFrom || '',
        processingTime: detail.processingTime || '',
        warranty: detail.warranty || '',
        requirements: detail.requirements || '',
        cta: detail.cta || '',
      })
    } catch {
      setCategoryForm({
        description: category.description || '',
        name: category.name || '',
        parentId: category.parentId ? String(category.parentId) : '',
        slug: category.slug || '',
        sortOrder: String(category.sortOrder ?? 0),
        microcopy: category.microcopy || '',
        priceFrom: category.priceFrom || '',
        processingTime: category.processingTime || '',
        warranty: category.warranty || '',
        requirements: category.requirements || '',
        cta: category.cta || '',
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
        microcopy: categoryForm.microcopy || undefined,
        priceFrom: categoryForm.priceFrom || undefined,
        processingTime: categoryForm.processingTime || undefined,
        warranty: categoryForm.warranty || undefined,
        requirements: categoryForm.requirements || undefined,
        cta: categoryForm.cta || undefined,
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
      onSetNotice(t('admin.services.categorySaveSuccess', { name: saved.name }))
    } catch (err) {
      setViewError(err.message || t('admin.services.categorySaveError'))
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
      onSetNotice(t('admin.services.categoryDeleteSuccess'))
    } catch (err) {
      setViewError(err.message || t('admin.services.categoryDeleteError'))
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
      if (!isEditing) {
        setServiceCredentials([])
      }
      onSetNotice(t('admin.services.serviceSaveSuccess', { name: saved.name }))
    } catch (err) {
      setViewError(err.message || t('admin.services.serviceSaveError'))
    } finally {
      setSubmitting(false)
    }
  }

  const uploadServiceImage = async (file) => {
    if (!file) {
      return
    }
    setUploadingImage(true)
    setViewError('')
    try {
      const uploaded = await adminApi.uploadServiceImage(file, token)
      updateServiceForm('iconUrl', uploaded.url)
      onSetNotice('Đã tải ảnh dịch vụ lên Cloudinary.')
    } catch (err) {
      setViewError(err.message || 'Không thể tải ảnh dịch vụ lên Cloudinary.')
    } finally {
      setUploadingImage(false)
    }
  }

  const bulkStatus = async (enabled) => {
    if (selectedIds.length === 0) {
      setViewError(t('admin.services.bulkSelectError'))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const payload = { ids: selectedIds, reason: enabled ? 'Bulk enable từ UI admin' : 'Bulk disable từ UI admin' }
      await (enabled ? adminApi.bulkEnableServices(payload, token) : adminApi.bulkDisableServices(payload, token))
      setSelectedIds([])
      await loadServices()
      onSetNotice(t('admin.services.bulkUpdateSuccess', { action: enabled ? t('admin.services.enabled') : t('admin.services.disabled'), count: selectedIds.length }))
    } catch (err) {
      setViewError(err.message || t('admin.services.bulkUpdateError'))
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
      onSetNotice(t('admin.services.serviceDeleteSuccess', { name: saved.name }))
    } catch (err) {
      setViewError(err.message || t('admin.services.serviceDeleteError'))
    } finally {
      setSubmitting(false)
    }
  }

  const createCredential = async () => {
    if (!selectedServiceId) {
      setViewError(t('admin.services.credentialSaveServiceRequired'))
      return
    }
    if (!credentialForm.loginIdentifier.trim() || (!editingCredentialId && !credentialForm.passwordSecret.trim())) {
      setViewError(t('admin.services.credentialFieldsRequired'))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = editingCredentialId
        ? await adminApi.updateServiceCredential(editingCredentialId, buildCredentialPayload(credentialForm), token)
        : await adminApi.createServiceCredential(selectedServiceId, buildCredentialPayload(credentialForm), token)
      setServiceCredentials((items) => (
        editingCredentialId
          ? items.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...items]
      ))
      setEditingCredentialId(null)
      setCredentialForm(emptyCredentialForm)
      await loadServices()
      onSetNotice(t('admin.services.credentialSaveSuccess', { identifier: saved.loginIdentifier }))
    } catch (err) {
      setViewError(err.message || t('admin.services.credentialSaveError'))
    } finally {
      setSubmitting(false)
    }
  }

  const startEditCredential = (credential) => {
    if (!credential) {
      setEditingCredentialId(null)
      setCredentialForm(emptyCredentialForm)
      return
    }
    setEditingCredentialId(credential.id)
    setCredentialForm(credentialToForm(credential))
  }

  const bulkImportCredentials = async (csvContent) => {
    if (!selectedServiceId) {
      throw new Error(t('admin.services.credentialImportServiceRequired'))
    }
    const result = await adminApi.bulkImportServiceCredentials(
      selectedServiceId,
      { csvContent, skipDuplicates: true },
      token,
    )
    await loadServiceCredentials(selectedServiceId, credentialFilters)
    await loadServices()
    onSetNotice(t('admin.services.credentialImportSuccess', { created: result.created || 0, skipped: result.skipped || 0 }))
    return result
  }

  const applyCredentialFilters = async () => {
    if (!selectedServiceId) {
      return
    }
    setSubmitting(true)
    setViewError('')
    try {
      await loadServiceCredentials(selectedServiceId, credentialFilters)
    } catch (err) {
      setViewError(err.message || t('admin.services.credentialFilterError'))
    } finally {
      setSubmitting(false)
    }
  }

  const resetCredentialFilters = async () => {
    setCredentialFilters(emptyCredentialFilters)
    if (!selectedServiceId) {
      return
    }
    setSubmitting(true)
    setViewError('')
    try {
      await loadServiceCredentials(selectedServiceId, emptyCredentialFilters)
    } catch (err) {
      setViewError(err.message || t('admin.services.credentialResetError'))
    } finally {
      setSubmitting(false)
    }
  }

  const disableCredential = async (credential) => {
    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.disableServiceCredential(credential.id, token)
      setServiceCredentials((items) => items.map((item) => (item.id === saved.id ? saved : item)))
      await loadServices()
      onSetNotice(t('admin.services.credentialDisableSuccess', { identifier: saved.loginIdentifier }))
    } catch (err) {
      setViewError(err.message || t('admin.services.credentialDisableError'))
    } finally {
      setSubmitting(false)
    }
  }

  const revealCredential = async (credential) => {
    setSubmitting(true)
    setViewError('')
    try {
      const revealed = await adminApi.revealServiceCredential(credential.id, token)
      setRevealedCredentials((items) => ({ ...items, [credential.id]: revealed }))
      onSetNotice(t('admin.services.credentialRevealSuccess', { identifier: revealed.loginIdentifier }))
    } catch (err) {
      setViewError(err.message || t('admin.services.credentialRevealError'))
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
      onSetNotice(t('admin.services.quickUpdateSuccess', { name: saved.name }))
    } catch (err) {
      setViewError(err.message || t('admin.services.quickUpdateError'))
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
      onSetNotice(t('admin.services.quickDeleteSuccess', { name: saved.name }))
    } catch (err) {
      setViewError(err.message || t('admin.services.quickDeleteError'))
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
      onSetNotice(t('admin.services.quickCategoryDeleteSuccess'))
    } catch (err) {
      setViewError(err.message || t('admin.services.quickCategoryDeleteError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div>
          <h2>{t('admin.services.title')}</h2>
        </div>
        <div className="admin-toolbar-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }}>
          <button type="button" className="admin-icon-button" onClick={reloadAll} disabled={loading}>
            <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
            <span>{t('admin.services.reload')}</span>
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
              <span>{t('admin.services.createNew')}</span>
            </button>
            {showCreateDropdown && (
              <div className="admin-dropdown-menu">
                <button
                  type="button"
                  onClick={() => {
                    startCreateService('MANUAL')
                    setShowCreateDropdown(false)
                  }}
                >
                  {t('admin.services.dropdown.manualService')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    startCreateService('ACCOUNT_STOCK')
                    setShowCreateDropdown(false)
                  }}
                >
                  {t('admin.services.dropdown.accountStock')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    startCreateCategory()
                    setShowCreateDropdown(false)
                  }}
                >
                  {t('admin.services.dropdown.newCategory')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <p className="admin-message error">{error}</p>}
      {!error && loading && <Loading fullScreen={false} message={t('admin.services.loading')} subMessage="" />}

      <div className="admin-services-summary" aria-label={t('admin.services.title')}>
        <div>
          <span>{t('admin.services.summary.categories')}</span>
          <strong>{categories.length}</strong>
        </div>
        <div>
          <span>{t('admin.services.summary.products')}</span>
          <strong>{services.length}</strong>
        </div>
        <div>
          <span>{t('admin.services.summary.active')}</span>
          <strong>{activeServices}</strong>
        </div>
        <div>
          <span>{t('admin.services.summary.public')}</span>
          <strong>{visibleServices}</strong>
        </div>
        <div>
          <span>{t('admin.services.summary.ungrouped')}</span>
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
        <Pagination
          currentPage={currentPage + 1}
          totalPages={totalPages}
          onPageChange={(page) => loadServices(page - 1)}
        />
      </div>

      <Modal isOpen={activeEditor === 'service'} onClose={handleCloseEditor} showHeader={false} maxWidth="1000px" className="service-editor-modal" variant="editor">
        <ServiceEditor
          key={selectedServiceId || 'new'}
          categories={categories}
          onDeleteService={deleteService}
          onSubmitService={submitService}
          editingCredentialId={editingCredentialId}
          credentialFilters={credentialFilters}
          onApplyCredentialFilters={applyCredentialFilters}
          onBulkImportCredentials={bulkImportCredentials}
          onCreateCredential={createCredential}
          onDisableCredential={disableCredential}
          onRevealCredential={revealCredential}
          onResetCredentialFilters={resetCredentialFilters}
          onStartEditCredential={startEditCredential}
          onUpdateCredentialForm={updateCredentialForm}
          onUpdateCredentialFilter={updateCredentialFilter}
          onUpdateServiceForm={updateServiceForm}
          onUploadServiceImage={uploadServiceImage}
          credentialForm={credentialForm}
          selectedServiceCategories={selectedServiceCategories}
          selectedServiceId={selectedServiceId}
          revealedCredentials={revealedCredentials}
          serviceCredentials={serviceCredentials}
          serviceForm={serviceForm}
          serviceOrders={serviceOrders}
          submitting={submitting}
          uploadingImage={uploadingImage}
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
