import { RefreshCw, Save } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../api/admin.api'
import { AdminEmptyState } from './AdminShared'

const sortOptions = [
  { label: 'Thứ tự hiển thị', value: 'sort_order' },
  { label: 'Nổi bật trước', value: 'featured' },
  { label: 'Tên A-Z', value: 'name' },
  { label: 'Giá thấp đến cao', value: 'price_asc' },
  { label: 'Giá cao đến thấp', value: 'price_desc' },
  { label: 'Mới nhất', value: 'newest' },
]

const stockStatuses = ['AVAILABLE', 'OUT_OF_STOCK', 'CONSULTING_ONLY']
const ctaTypes = ['BUY_NOW', 'CONTACT', 'CONSULT']

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

      {(error || loading) && <p className={error ? 'admin-message error' : 'admin-message'}>{error || 'Đang tải bảng giá...'}</p>}

      <div className="admin-filters pricing-filters">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm gói dịch vụ" type="search" />
        <select value={categorySlug} onChange={(event) => setCategorySlug(event.target.value)}>
          <option value="">Tất cả nhóm</option>
          {categories.map((category) => (
            <option value={category.slug} key={category.id}>{category.name}</option>
          ))}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          {sortOptions.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
        <label className="inline-check">
          <input checked={featuredOnly} onChange={(event) => setFeaturedOnly(event.target.checked)} type="checkbox" />
          <span>Chỉ nổi bật</span>
        </label>
      </div>

      <div className="admin-grid pricing-layout">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Bảng giá</h3>
            <span>{pricingItems.length} gói</span>
          </div>
          <div className="admin-pricing-table">
            <div className="admin-pricing-row head">
              <span>Dịch vụ</span>
              <span>Giá</span>
              <span>CTA</span>
              <span>Trạng thái</span>
            </div>
            {pricingItems.map((item) => (
              <button
                type="button"
                className={`admin-pricing-row ${selectedItem?.id === item.id ? 'selected' : ''}`}
                key={item.id}
                onClick={() => selectItem(item)}
              >
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.categoryName || 'Chưa phân nhóm'} · {item.pricingBadge || 'Không badge'}</small>
                </span>
                <span>{item.priceText || item.price}</span>
                <span>{item.ctaType}</span>
                <span>{item.stockStatus}</span>
              </button>
            ))}
            {pricingItems.length === 0 && <AdminEmptyState />}
          </div>
        </div>

        <form className="admin-form pricing-editor" onSubmit={submit}>
          <div className="admin-panel-head">
            <h3>{selectedItem ? selectedItem.name : 'Chọn gói dịch vụ'}</h3>
            <button type="submit" disabled={!selectedItem || submitting}>
              <Save size={17} strokeWidth={2} aria-hidden="true" />
              <span>Lưu bảng giá</span>
            </button>
          </div>

          <div className="admin-form-grid single">
            <label>
              <span>Giá số</span>
              <input value={form.price} onChange={(event) => updateForm('price', event.target.value)} inputMode="decimal" />
            </label>
            <label>
              <span>Giá hiển thị</span>
              <input value={form.priceText} onChange={(event) => updateForm('priceText', event.target.value)} placeholder="Từ 390.000đ" />
            </label>
            <label>
              <span>Badge</span>
              <input value={form.pricingBadge} onChange={(event) => updateForm('pricingBadge', event.target.value)} />
            </label>
            <label>
              <span>Tình trạng</span>
              <select value={form.stockStatus} onChange={(event) => updateForm('stockStatus', event.target.value)}>
                {stockStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
              </select>
            </label>
            <label>
              <span>CTA</span>
              <select value={form.ctaType} onChange={(event) => updateForm('ctaType', event.target.value)}>
                {ctaTypes.map((type) => <option value={type} key={type}>{type}</option>)}
              </select>
            </label>
            <label>
              <span>Thời gian xử lý</span>
              <input value={form.processingTime} onChange={(event) => updateForm('processingTime', event.target.value)} />
            </label>
            <label>
              <span>Bảo hành</span>
              <textarea value={form.warrantyPolicy} onChange={(event) => updateForm('warrantyPolicy', event.target.value)} rows="3" />
            </label>
            <label>
              <span>Điều kiện sử dụng</span>
              <textarea value={form.requirements} onChange={(event) => updateForm('requirements', event.target.value)} rows="4" />
            </label>
            <label>
              <span>Lưu ý public</span>
              <textarea value={form.usageNotes} onChange={(event) => updateForm('usageNotes', event.target.value)} rows="4" />
            </label>
          </div>

          <div className="admin-check-row">
            <label>
              <input checked={form.featured} onChange={(event) => updateForm('featured', event.target.checked)} type="checkbox" />
              <span>Gói nổi bật</span>
            </label>
            <label>
              <input checked={form.publicVisible} onChange={(event) => updateForm('publicVisible', event.target.checked)} type="checkbox" />
              <span>Hiển thị public</span>
            </label>
          </div>
        </form>
      </div>
    </section>
  )
}

export default AdminPricingView
