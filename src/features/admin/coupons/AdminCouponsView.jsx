import { useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw, Save, TicketPercent } from 'lucide-react'
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
    const targetPage = page ?? currentPage
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
      onSetError?.(err.message || 'Không tải được danh sách coupon.')
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
      onSetNotice?.(`Đã lưu coupon ${saved.code}.`)
      setIsModalOpen(false)
    } catch (err) {
      onSetError?.(err.message || 'Không lưu được coupon.')
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
      onSetNotice?.(`Đã cập nhật trạng thái ${saved.code}.`)
      setIsModalOpen(false)
    } catch (err) {
      onSetError?.(err.message || 'Không cập nhật được trạng thái coupon.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-view">
      <div className="admin-toolbar">
        <div className="admin-toolbar-info">
          <h2>Mã giảm giá</h2>
          <div className="admin-quick-stats">
            <span className="admin-quick-stat"><strong>{coupons.length}</strong> tổng mã</span>
            <span className="admin-quick-stat highlight"><strong>{activeCoupons}</strong> đang chạy</span>
          </div>
        </div>
        <div className="admin-toolbar-actions coupon-toolbar-actions">
          <button className={`admin-icon-button ${loading ? 'loading' : ''}`} type="button" onClick={loadData}>
            <RefreshCw size={18} /> Tải lại
          </button>
          <button type="button" className="admin-primary-button" onClick={startCreate}>
            <Plus size={18} /> Tạo mới
          </button>
        </div>
      </div>

      <div className="admin-grid">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h3><TicketPercent size={18} /> Danh sách coupon</h3>
              <span>Quản lý mã giảm giá theo thời gian, lượt dùng và dịch vụ áp dụng.</span>
            </div>
          </div>
          <div className="admin-filters single-filter">
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang chạy</option>
              <option value="DISABLED">Đã tắt</option>
            </select>
          </div>
          <div className="admin-data-table">
            <div className="admin-data-row head coupons">
              <span>Mã</span>
              <span>Ưu đãi</span>
              <span>Giới hạn</span>
              <span>Áp dụng</span>
              <span>Trạng thái</span>
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
                  <small>{coupon.maxDiscountAmount ? `Tối đa ${money.format(Number(coupon.maxDiscountAmount))}` : 'Không giới hạn trần'}</small>
                </span>
                <span>
                  <strong>{coupon.usedCount || 0}/{coupon.usageLimit || '∞'}</strong>
                  <small>Mỗi user: {coupon.perUserLimit || '∞'}</small>
                </span>
                <span>
                  <strong>{coupon.serviceName || 'Toàn bộ dịch vụ'}</strong>
                  <small>{coupon.minOrderAmount ? `Tối thiểu ${money.format(Number(coupon.minOrderAmount))}` : 'Không yêu cầu tối thiểu'}</small>
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
          {!loading && coupons.length === 0 && <AdminEmptyState message="Chưa có mã giảm giá." hint="Tạo mã đầu tiên để chạy ưu đãi." />}
        </section>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selected ? `Sửa mã giảm giá: ${selected.code}` : 'Tạo mã giảm giá mới'}
        maxWidth="800px"
        variant="editor"
      >
        <form className="admin-form coupon-editor-form" onSubmit={saveCoupon}>
          <div className="admin-form-grid two-columns">
            <label>
              <span>Mã</span>
              <input value={form.code} onChange={(event) => updateForm('code', event.target.value)} required maxLength={64} />
            </label>
            <label>
              <span>Trạng thái</span>
              <select value={form.status} onChange={(event) => updateForm('status', event.target.value)}>
                <option value="ACTIVE">Đang chạy</option>
                <option value="DISABLED">Đã tắt</option>
              </select>
            </label>
            <label className="wide">
              <span>Tên</span>
              <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} required maxLength={255} />
            </label>
            <label>
              <span>Loại</span>
              <select value={form.type} onChange={(event) => updateForm('type', event.target.value)}>
                <option value="PERCENT">Phần trăm</option>
                <option value="FIXED_AMOUNT">Số tiền cố định</option>
              </select>
            </label>
            <label>
              <span>Giá trị</span>
              <input type="number" min="0.01" step="0.01" value={form.value} onChange={(event) => updateForm('value', event.target.value)} required />
            </label>
            <label>
              <span>Giảm tối đa</span>
              <input type="number" min="0" step="1000" value={form.maxDiscountAmount} onChange={(event) => updateForm('maxDiscountAmount', event.target.value)} />
            </label>
            <label>
              <span>Đơn tối thiểu</span>
              <input type="number" min="0" step="1000" value={form.minOrderAmount} onChange={(event) => updateForm('minOrderAmount', event.target.value)} />
            </label>
            <label>
              <span>Tổng lượt</span>
              <input type="number" min="1" value={form.usageLimit} onChange={(event) => updateForm('usageLimit', event.target.value)} />
            </label>
            <label>
              <span>Mỗi user</span>
              <input type="number" min="1" value={form.perUserLimit} onChange={(event) => updateForm('perUserLimit', event.target.value)} />
            </label>
            <label className="wide">
              <span>Dịch vụ áp dụng</span>
              <select value={form.serviceId} onChange={(event) => updateForm('serviceId', event.target.value)}>
                <option value="">Toàn bộ dịch vụ</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Bắt đầu</span>
              <input type="datetime-local" value={form.startsAt} onChange={(event) => updateForm('startsAt', event.target.value)} />
            </label>
            <label>
              <span>Kết thúc</span>
              <input type="datetime-local" value={form.endsAt} onChange={(event) => updateForm('endsAt', event.target.value)} />
            </label>
            <label className="wide">
              <span>Ghi chú nội bộ</span>
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
                {selected.status === 'ACTIVE' ? 'Tắt mã' : 'Bật mã'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="admin-icon-button coupon-cancel-button"
            >
              Hủy
            </button>
            <button type="submit" disabled={saving} className="admin-primary-button">
              <Save size={16} /> Lưu coupon
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminCouponsView
