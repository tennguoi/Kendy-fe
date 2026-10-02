import { useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw, Save, TicketPercent } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../api/admin.api'
import { normalizePaged } from '../../../utils/pagination'
import { money } from '../../../utils/currency'
import { AdminEmptyState, AdminStatusBadge } from '../AdminShared'
import { resolveAdminError } from '../adminErrorResolver'
import Modal from '../../../components/Modal/Modal'
import Pagination from '../../../components/Pagination/Pagination'
import BaseInput from '../../../components/ui/BaseInput'
import BaseSelect from '../../../components/ui/BaseSelect'
import BaseTextarea from '../../../components/ui/BaseTextarea'
import {
  isRequired,
  composeValidators,
  validateRequired,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validatePositiveInteger,
} from '../../../utils/validation'

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
    version: coupon.version,
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
    version: form.version,
  }
}

// Validation functions
const validateCode = composeValidators(isRequired)
const validateName = composeValidators(isRequired)
const validateValue = (value) => {
  if (!value) return validateRequired(value)
  return validatePositiveNumber(value)
}
const validateNumberOrZero = (value) => validateNonNegativeNumber(value)

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
      onSetError?.(resolveAdminError(err, t('admin.coupons.loadError')))
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

    // Validate form
    const codeValidation = validateCode(form.code);
    const nameValidation = validateName(form.name);
    const valueValidation = validateValue(form.value);
    const maxDiscountValidation = validateNumberOrZero(form.maxDiscountAmount);
    const minOrderValidation = validateNumberOrZero(form.minOrderAmount);
    const usageLimitValidation = validatePositiveInteger(form.usageLimit);
    const perUserLimitValidation = validatePositiveInteger(form.perUserLimit);

    if (!codeValidation.isValid) {
      onSetError?.(codeValidation.error || t('admin.coupons.form.codeRequired'))
      return
    }

    if (!nameValidation.isValid) {
      onSetError?.(nameValidation.error || t('admin.coupons.form.nameRequired'))
      return
    }

    if (!valueValidation.isValid) {
      onSetError?.(valueValidation.error || t('admin.coupons.form.valueRequired'))
      return
    }

    if (!maxDiscountValidation.isValid) {
      onSetError?.(maxDiscountValidation.error || t('admin.coupons.form.maxDiscountInvalid'))
      return
    }

    if (!minOrderValidation.isValid) {
      onSetError?.(minOrderValidation.error || t('admin.coupons.form.minOrderInvalid'))
      return
    }

    if (!usageLimitValidation.isValid) {
      onSetError?.(usageLimitValidation.error || t('admin.coupons.form.usageLimitInvalid'))
      return
    }

    if (!perUserLimitValidation.isValid) {
      onSetError?.(perUserLimitValidation.error || t('admin.coupons.form.perUserLimitInvalid'))
      return
    }

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
      onSetError?.(resolveAdminError(err, t('admin.coupons.saveError')))
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
      onSetError?.(resolveAdminError(err, t('admin.coupons.statusUpdateError')))
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
            <BaseSelect
              value={status}
              onChange={(value) => setStatus(value)}
              placeholder={t('admin.coupons.form.allStatus')}
            >
              <option value="ACTIVE">{t('admin.coupons.form.active')}</option>
              <option value="DISABLED">{t('admin.coupons.form.disabled')}</option>
            </BaseSelect>
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
            <BaseInput
              label={t('admin.coupons.form.code')}
              value={form.code}
              onChange={(value) => updateForm('code', value)}
              validators={[validateCode]}
              errorMessage={t('admin.coupons.form.codeRequired')}
              required
              maxLength={64}
            />
            <BaseSelect
              label={t('admin.coupons.form.status')}
              value={form.status}
              onChange={(value) => updateForm('status', value)}
              options={[
                { value: 'ACTIVE', label: t('admin.coupons.form.active') },
                { value: 'DISABLED', label: t('admin.coupons.form.disabled') }
              ]}
              validators={[]} // Status is required but handled by select
              required
            />
            <BaseInput
              label={t('admin.coupons.form.name')}
              value={form.name}
              onChange={(value) => updateForm('name', value)}
              validators={[validateName]}
              errorMessage={t('admin.coupons.form.nameRequired')}
              required
              maxLength={255}
            />
            <BaseSelect
              label={t('admin.coupons.form.type')}
              value={form.type}
              onChange={(value) => updateForm('type', value)}
              options={[
                { value: 'PERCENT', label: t('admin.coupons.form.percent') },
                { value: 'FIXED_AMOUNT', label: t('admin.coupons.form.fixedAmount') }
              ]}
              validators={[]} // Type is required but handled by select
              required
            />
            <BaseInput
              label={t('admin.coupons.form.value')}
              value={form.value}
              onChange={(value) => updateForm('value', value)}
              type="number"
              min="0.01"
              step="0.01"
              validators={[validateValue]}
              errorMessage={t('admin.coupons.form.valueRequired')}
              required
            />
            <BaseInput
              label={t('admin.coupons.form.maxDiscount')}
              value={form.maxDiscountAmount}
              onChange={(value) => updateForm('maxDiscountAmount', value)}
              type="number"
              min="0"
              step="1000"
              validators={[validateNumberOrZero]}
              errorMessage={t('admin.coupons.form.maxDiscountInvalid')}
            />
            <BaseInput
              label={t('admin.coupons.form.minOrder')}
              value={form.minOrderAmount}
              onChange={(value) => updateForm('minOrderAmount', value)}
              type="number"
              min="0"
              step="1000"
              validators={[validateNumberOrZero]}
              errorMessage={t('admin.coupons.form.minOrderInvalid')}
            />
            <BaseInput
              label={t('admin.coupons.form.totalUsage')}
              value={form.usageLimit}
              onChange={(value) => updateForm('usageLimit', value)}
              type="number"
              min="1"
              validators={[validatePositiveInteger]}
              errorMessage={t('admin.coupons.form.usageLimitInvalid')}
            />
            <BaseInput
              label={t('admin.coupons.form.perUser')}
              value={form.perUserLimit}
              onChange={(value) => updateForm('perUserLimit', value)}
              type="number"
              min="1"
              validators={[validatePositiveInteger]}
              errorMessage={t('admin.coupons.form.perUserLimitInvalid')}
            />
            <BaseSelect
              label={t('admin.coupons.form.serviceApply')}
              value={form.serviceId}
              onChange={(value) => updateForm('serviceId', value)}
              options={[
                { value: '', label: t('admin.coupons.form.allServices') },
                ...services.map((service) => ({
                  value: service.id,
                  label: service.name
                }))
              ]}
              validators={[]} // Service is optional
            />
            <BaseInput
              label={t('admin.coupons.form.startDate')}
              value={form.startsAt}
              onChange={(value) => updateForm('startsAt', value)}
              type="datetime-local"
            />
            <BaseInput
              label={t('admin.coupons.form.endDate')}
              value={form.endsAt}
              onChange={(value) => updateForm('endsAt', value)}
              type="datetime-local"
            />
            <BaseTextarea
              label={t('admin.coupons.form.internalNote')}
              value={form.adminNote}
              onChange={(value) => updateForm('adminNote', value)}
              rows={3}
            />
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
