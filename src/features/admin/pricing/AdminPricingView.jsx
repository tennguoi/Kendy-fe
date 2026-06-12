import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import AdminDrawer from '../AdminDrawer'
import PricingEditor from './components/PricingEditor'
import PricingFilterBar from './components/PricingFilterBar'
import PricingListPanel from './components/PricingListPanel'
import Loading from '../../../components/Loading/Loading'

function pricingToForm(item) {
  return {
    ctaType: item.ctaType || 'BUY_NOW',
    featured: Boolean(item.featured),
    price: item.price ?? '',
    priceText: item.priceText || '',
    pricingBadge: item.pricingBadge || '',
    processingTime: item.processingTime || '',
    publicVisible: item.publicVisible !== false,
    requirements: item.requirements || '',
    stockStatus: item.stockStatus || 'AVAILABLE',
    usageNotes: item.usageNotes || '',
    warrantyPolicy: item.warrantyPolicy || '',
  }
}

function AdminPricingView({
  onSetError,
  onSetNotice,
  token,
}) {
  const [categories, setCategories] = useState([])
  const [categorySlug, setCategorySlug] = useState('')
  const [error, setError] = useState('')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [formDraft, setFormDraft] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pricingItems, setPricingItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [sort, setSort] = useState('sort_order')
  const [submitting, setSubmitting] = useState(false)

  const selectedItem = pricingItems.find((item) => item.id === selectedId) || pricingItems[0]
  const form = formDraft && formDraft.id === selectedItem?.id ? formDraft.values : pricingToForm(selectedItem || {})

  const setViewError = useCallback((message) => {
    setError(message)
    onSetError(message)
  }, [onSetError])

  const loadPricing = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setViewError('')
    try {
      const [categoryData, pricingData] = await Promise.all([
        adminApi.getServiceCategories(token),
        adminApi.searchPricing({
          categorySlug,
          featured: featuredOnly ? true : undefined,
          query: query.trim(),
          sort,
        }, token),
      ])
      setCategories(categoryData)
      setPricingItems(pricingData)
      setSelectedId((current) => (current && pricingData.some((item) => item.id === current) ? current : pricingData[0]?.id || null))
    } catch (err) {
      setViewError(err.message || 'Không tải được bảng giá.')
    } finally {
      setLoading(false)
    }
  }, [categorySlug, featuredOnly, query, setViewError, sort, token])

  useEffect(() => {
    const timer = window.setTimeout(loadPricing, 250)
    return () => window.clearTimeout(timer)
  }, [loadPricing])

  const selectItem = (item) => {
    setSelectedId(item.id)
    setFormDraft(null)
    setDrawerOpen(true)
  }

  const updateForm = (field, value) => {
    if (!selectedItem) {
      return
    }

    setFormDraft((current) => {
      const values = current?.id === selectedItem.id ? current.values : pricingToForm(selectedItem)
      return {
        id: selectedItem.id,
        values: { ...values, [field]: value },
      }
    })
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!selectedItem) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.updateService(selectedItem.id, {
        ctaType: form.ctaType,
        featured: form.featured,
        price: Number(form.price) || 0,
        priceText: form.priceText || undefined,
        pricingBadge: form.pricingBadge || undefined,
        processingTime: form.processingTime || undefined,
        publicVisible: form.publicVisible,
        requirements: form.requirements || undefined,
        stockStatus: form.stockStatus,
        usageNotes: form.usageNotes || undefined,
        warrantyPolicy: form.warrantyPolicy || undefined,
      }, token)

      setPricingItems((items) => items.map((item) => (item.id === saved.id ? { ...item, ...saved } : item)))
      setFormDraft(null)
      await loadPricing()
      onSetNotice(`Đã cập nhật bảng giá cho ${saved.name}.`)
    } catch (err) {
      setViewError(err.message || 'Không cập nhật được bảng giá.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">Pricing management</span>
          <h2>Quản lý bảng giá public</h2>
        </div>
        <button type="button" className="admin-icon-button" onClick={loadPricing} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {error && <p className="admin-message error">{error}</p>}
      {!error && loading && <Loading fullScreen={false} message="Đang tải bảng giá..." subMessage="" />}

      <PricingFilterBar
        categories={categories}
        categorySlug={categorySlug}
        featuredOnly={featuredOnly}
        onCategorySlugChange={setCategorySlug}
        onFeaturedOnlyChange={setFeaturedOnly}
        onQueryChange={setQuery}
        onSortChange={setSort}
        query={query}
        sort={sort}
      />

      <PricingListPanel
        onSelectItem={selectItem}
        pricingItems={pricingItems}
        selectedItem={selectedItem}
      />

      <AdminDrawer
        isOpen={drawerOpen && Boolean(selectedItem)}
        onClose={() => setDrawerOpen(false)}
        title={selectedItem?.name || 'Chi tiết bảng giá'}
        width="540px"
      >
        <PricingEditor
          form={form}
          onSubmit={submit}
          onUpdateForm={updateForm}
          selectedItem={selectedItem}
          submitting={submitting}
        />
      </AdminDrawer>
    </section>
  )
}

export default AdminPricingView
