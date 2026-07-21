import { useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw, Save, TicketPercent } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../api/admin.api'
import { normalizePaged } from '../../../utils/pagination'
import { money } from '../../../utils/currency'
import { AdminEmptyState, AdminStatusBadge } from '../AdminShared'
import Modal from '../../../components/Modal/Modal'
import Pagination from '../../../components/Pagination/Pagination'

const blankForm = {
  adminNote: '',
  code: '',
  endsAt: '',
  maxDiscountAmount: '',
  minOrderAmount: '',
  name: '',
  perUserLimit: '1',
  serviceId: '',
  startsAt: '',
  status: 'ACTIVE',
  type: 'PERCENT',
  usageLimit: '',
  value: '',
}

function toLocalInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function toInstant(value) {
  return value ? new Date(value).toISOString() : null
}

function numberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function formFromCoupon(coupon) {
  if (!coupon) return blankForm
  return {
    adminNote: coupon.adminNote || '',
    code: coupon.code || '',
    endsAt: toLocalInput(coupon.endsAt),
    maxDiscountAmount: coupon.maxDiscountAmount ?? '',
    minOrderAmount: coupon.minOrderAmount ?? '',
    name: coupon.name || '',
    perUserLimit: coupon.perUserLimit ?? '',
    serviceId: coupon.serviceId ?? '',
    startsAt: toLocalInput(coupon.startsAt),
    status: coupon.status || 'ACTIVE',
    type: coupon.type || 'PERCENT',
    usageLimit: coupon.usageLimit ?? '',
    value: coupon.value ?? '',
  }
}

function payloadFromForm(form) {
  return {
    adminNote: form.adminNote.trim() || null,
    code: form.code.trim(),
    endsAt: toInstant(form.endsAt),
    maxDiscountAmount: numberOrNull(form.maxDiscountAmount),
    minOrderAmount: numberOrNull(form.minOrderAmount),
    name: form.name.trim(),
    perUserLimit: numberOrNull(form.perUserLimit),
    serviceId: numberOrNull(form.serviceId),
    startsAt: toInstant(form.startsAt),
    status: form.status,
    type: form.type,
    usageLimit: numberOrNull(form.usageLimit),
    value: numberOrNull(form.value),
  }
}

function AdminCouponsView({ onSetError, onSetNotice, token }) {
  const { t } = useTranslation()
  const [coupons, setCoupons] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [services, setServices] = useState([])
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(blankForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const activeCoupons = useMemo(() => coupons.filter((item) => item.status === 'ACTIVE').length, [coupons])

  const loadData = async (page) => {
    if (!token) return
    const targetPage = typeof page === 'number' ? page : currentPage
    setLoading(true)
    try {
      const [couponData, serviceData] = await Promise.all([
        adminApi.getCoupons({ status: status || undefined, page: targetPage }, token),
        adminApi.getServices(token),
      ])
      const { items, totalPages: pages } = normalizePaged(couponData, 50)
      setCoupons(items)
      setTotalPages(pages)
      setCurrentPage(targetPage)
      setServices(Array.isArray(serviceData) ? serviceData : [])
      onSetError?.('')
    } catch (err) {
      onSetError?.(err.message || t('admin.coupons.loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(0)
  }, [status])

  useEffect(() => {
    const timer = window.setTimeout(() => loadData(), 0)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status])

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const startCreate = () => {
    setSelected(null)
    setForm(blankForm)
    setIsModalOpen(true)
  }

  const startEdit = (coupon) => {
    setSelected(coupon)
    setForm(formFromCoupon(coupon))
    setIsModalOpen(true)
  }

  const saveCoupon = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = payloadFromForm(form)
      const saved = selected
        ? await adminApi.updateCoupon(selected.id, payload, token)
        : await adminApi.createCoupon(payload, token)
      setSelected(saved)
      setForm(formFromCoupon(saved))
      setCoupons((items) => {
        const list = Array.isArray(items) ? items : []
        return list.some((item) => item.id === saved.id)
          ? list.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...list]
      })
      onSetNotice?.(t('admin.coupons.saveSuccess', { code: saved.code }))
      setIsModalOpen(false)
    } catch (err) {
      onSetError?.(err.message || t('admin.coupons.saveError'))
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (coupon) => {
    setSaving(true)
    try {
      const saved = coupon.status === 'ACTIVE'
        ? await adminApi.disableCoupon(coupon.id, token)
        : await adminApi.enableCoupon(coupon.id, token)
      setCoupons((items) => items.map((item) => (item.id === saved.id ? saved : item)))
      if (selected?.id === saved.id) {
        setSelected(saved)
        setForm(formFromCoupon(saved))
      }
      onSetNotice?.(t('admin.coupons.statusUpdateSuccess', { code: saved.code }))
      setIsModalOpen(false)
    } catch (err) {
      onSetError?.(err.message || t('admin.coupons.statusUpdateError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-view">
      <div className="admin-toolbar">
        <div className="admin-toolbar-info">
          <h2>{t('admin.coupons.title')}</h2>
          <div className="admin-quick-stats">
            <span className="admin-quick-stat"><strong>{coupons.length}</strong> {t('admin.coupons.total')}</span>
            <span className="admin-quick-stat highlight"><strong>{activeCoupons}</strong> {t('admin.coupons.active')}</span>
          </div>
        </div>
        <div className="admin-toolbar-actions coupon-toolbar-actions">
          <button className={`admin-icon-button ${loading ? 'loading' : ''}`} type="button" onClick={loadData}>
            <RefreshCw size={18} /> {t('admin.coupons.reload')}
          </button>
          <button type="button" className="admin-primary-button" onClick={startCreate}>
            <Plus size={18} /> {t('admin.coupons.create')}
          </button>
        </div>
      </div>

      <div className="admin-grid">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h3><TicketPercent size={18} /> {t('admin.coupons.form.title')}</h3>
              <span>{t('admin.coupons.form.description')}</span>
            </div>
          </div>
          <div className="admin-filters single-filter">
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">{t('admin.coupons.form.allStatus')}</option>
              <option value="ACTIVE">{t('admin.coupons.form.active')}</option>
              <option value="DISABLED">{t('admin.coupons.form.disabled')}</option>
            </select>
          </div>
          <div className="admin-data-table">
            <div className="admin-data-row head coupons">
              <span>{t('admin.coupons.table.code')}</span>
              <span>{t('admin.coupons.table.deal')}</span>
              <span>{t('admin.coupons.table.limits')}</span>
              <span>{t('admin.coupons.table.appliesTo')}</span>
              <span>{t('admin.coupons.table.status')}</span>
            </div>
            {coupons.map((coupon) => (
              <button
                className={`admin-data-row coupons ${selected?.id === coupon.id ? 'selected' : ''}`}
                key={coupon.id}
                type="button"
                onClick={() => startEdit(coupon)}
              >
                <span>
                  <strong>{coupon.code}</strong>
                  <small>{coupon.name}</small>
                </span>
                <span>
                  <strong>{coupon.type === 'PERCENT' ? `${coupon.value}%` : money.format(Number(coupon.value || 0))}</strong>
                  <small>{coupon.maxDiscountAmount ? t('admin.coupons.form.maxDiscountLabel', { amount: money.format(Number(coupon.maxDiscountAmount)) }) : t('admin.coupons.form.noMaxDiscount')}</small>
                </span>
                <span>
                  <strong>{coupon.usedCount || 0}/{coupon.usageLimit || '∞'}</strong>
                  <small>{t('admin.coupons.form.perUserLabel', { limit: coupon.perUserLimit || '∞' })}</small>
                </span>
                <span>
                  <strong>{coupon.serviceName || t('admin.coupons.form.allServices')}</strong>
                  <small>{coupon.minOrderAmount ? t('admin.coupons.form.minOrderLabel', { amount: money.format(Number(coupon.minOrderAmount)) }) : t('admin.coupons.form.noMinOrder')}</small>
                </span>
                <span><AdminStatusBadge status={coupon.status} /></span>
              </button>
            ))}
          </div>
          <Pagination
            currentPage={currentPage + 1}
            totalPages={totalPages}
            onPageChange={(page) => loadData(page - 1)}
          />
          {!loading && coupons.length === 0 && <AdminEmptyState message={t('admin.coupons.form.noCoupons')} hint={t('admin.coupons.form.noCouponsHint')} />}
        </section>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selected ? t('admin.coupons.form.editTitle', { code: selected.code }) : t('admin.coupons.form.createTitle')}
        maxWidth="800px"
        variant="editor"
      >
        <form className="admin-form coupon-editor-form" onSubmit={saveCoupon}>
          <div className="admin-form-grid two-columns">
            <label>
              <span>{t('admin.coupons.form.code')}</span>
              <input value={form.code} onChange={(event) => updateForm('code', event.target.value)} required maxLength={64} />
            </label>
            <label>
              <span>{t('admin.coupons.form.status')}</span>
              <select value={form.status} onChange={(event) => updateForm('status', event.target.value)}>
                <option value="ACTIVE">{t('admin.coupons.form.active')}</option>
                <option value="DISABLED">{t('admin.coupons.form.disabled')}</option>
              </select>
            </label>
            <label className="wide">
              <span>{t('admin.coupons.form.name')}</span>
              <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} required maxLength={255} />
            </label>
            <label>
              <span>{t('admin.coupons.form.type')}</span>
              <select value={form.type} onChange={(event) => updateForm('type', event.target.value)}>
                <option value="PERCENT">{t('admin.coupons.form.percent')}</option>
                <option value="FIXED_AMOUNT">{t('admin.coupons.form.fixedAmount')}</option>
              </select>
            </label>
            <label>
              <span>{t('admin.coupons.form.value')}</span>
              <input type="number" min="0.01" step="0.01" value={form.value} onChange={(event) => updateForm('value', event.target.value)} required />
            </label>
            <label>
              <span>{t('admin.coupons.form.maxDiscount')}</span>
              <input type="number" min="0" step="1000" value={form.maxDiscountAmount} onChange={(event) => updateForm('maxDiscountAmount', event.target.value)} />
            </label>
            <label>
              <span>{t('admin.coupons.form.minOrder')}</span>
              <input type="number" min="0" step="1000" value={form.minOrderAmount} onChange={(event) => updateForm('minOrderAmount', event.target.value)} />
            </label>
            <label>
              <span>{t('admin.coupons.form.totalUsage')}</span>
              <input type="number" min="1" value={form.usageLimit} onChange={(event) => updateForm('usageLimit', event.target.value)} />
            </label>
            <label>
              <span>{t('admin.coupons.form.perUser')}</span>
              <input type="number" min="1" value={form.perUserLimit} onChange={(event) => updateForm('perUserLimit', event.target.value)} />
            </label>
            <label className="wide">
              <span>{t('admin.coupons.form.serviceApply')}</span>
              <select value={form.serviceId} onChange={(event) => updateForm('serviceId', event.target.value)}>
                <option value="">{t('admin.coupons.form.allServices')}</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>{t('admin.coupons.form.startDate')}</span>
              <input type="datetime-local" value={form.startsAt} onChange={(event) => updateForm('startsAt', event.target.value)} />
            </label>
            <label>
              <span>{t('admin.coupons.form.endDate')}</span>
              <input type="datetime-local" value={form.endsAt} onChange={(event) => updateForm('endsAt', event.target.value)} />
            </label>
            <label className="wide">
              <span>{t('admin.coupons.form.internalNote')}</span>
              <textarea rows={3} value={form.adminNote} onChange={(event) => updateForm('adminNote', event.target.value)} />
            </label>
          </div>
          <div className="admin-action-row coupon-editor-actions">
            {selected && (
              <button
                type="button"
                disabled={saving}
                onClick={() => toggleStatus(selected)}
                className="admin-danger-button coupon-toggle-button"
              >
                {selected.status === 'ACTIVE' ? t('admin.coupons.form.disableCode') : t('admin.coupons.form.enableCode')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="admin-icon-button coupon-cancel-button"
            >
              {t('admin.common.cancel')}
            </button>
            <button type="submit" disabled={saving} className="admin-primary-button">
              <Save size={16} /> {t('admin.coupons.form.saveCoupon')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminCouponsView
