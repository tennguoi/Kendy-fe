import { RefreshCw, Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import { adminApi } from '../../api/admin.api'

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
    stockStatus: item.stockStatus || 'AVAILABLE',
    warrantyPolicy: item.warrantyPolicy || '',
  }
}

function AdminPricingView({
  categories,
  error,
  loading,
  onReload,
  onSetError,
  onSetNotice,
  onUpdatePricing,
  pricingItems,
  token,
}) {
  const [categorySlug, setCategorySlug] = useState('')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [formDraft, setFormDraft] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [sort, setSort] = useState('sort_order')
  const [submitting, setSubmitting] = useState(false)

  const selectedItem = pricingItems.find((item) => item.id === selectedId) || pricingItems[0]
  const form = formDraft && formDraft.id === selectedItem?.id ? formDraft.values : pricingToForm(selectedItem || {})

  const visibleItems = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return pricingItems
      .filter((item) => !categorySlug || item.categorySlug === categorySlug)
      .filter((item) => !featuredOnly || item.featured)
      .filter((item) => !keyword || item.name.toLowerCase().includes(keyword) || item.categoryName?.toLowerCase().includes(keyword))
      .sort((a, b) => {
        if (sort === 'price_asc') return Number(a.price) - Number(b.price)
        if (sort === 'price_desc') return Number(b.price) - Number(a.price)
        if (sort === 'featured') return Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder
        if (sort === 'name') return a.name.localeCompare(b.name)
        return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
      })
  }, [categorySlug, featuredOnly, pricingItems, query, sort])

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
    onSetError('')
    try {
      const saved = await adminApi.updateService(selectedItem.id, {
        ctaType: form.ctaType,
        featured: form.featured,
        price: Number(form.price) || 0,
        priceText: form.priceText || undefined,
        pricingBadge: form.pricingBadge || undefined,
        processingTime: form.processingTime || undefined,
        publicVisible: form.publicVisible,
        stockStatus: form.stockStatus,
        warrantyPolicy: form.warrantyPolicy || undefined,
      }, token)

      onUpdatePricing((items) => items.map((item) => (item.id === saved.id ? { ...item, ...saved } : item)))
      setFormDraft(null)
      await onReload()
      onSetNotice(`Đã cập nhật bảng giá cho ${saved.name}.`)
    } catch (err) {
      onSetError(err.message || 'Không cập nhật được bảng giá.')
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
        <button type="button" className="admin-icon-button" onClick={onReload} disabled={loading}>
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
            <span>{visibleItems.length} gói</span>
          </div>
          <div className="admin-pricing-table">
            <div className="admin-pricing-row head">
              <span>Dịch vụ</span>
              <span>Giá</span>
              <span>CTA</span>
              <span>Trạng thái</span>
            </div>
            {visibleItems.map((item) => (
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
