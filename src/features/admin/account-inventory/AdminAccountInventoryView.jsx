import { Eye, FileUp, PackageOpen, Pencil, Plus, RefreshCw, ShieldOff, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import { normalizePaged } from '../../../utils/pagination'
import SearchField from '../../../components/SearchField/SearchField'
import Loading from '../../../components/Loading/Loading'
import { AdminEmptyState } from '../AdminShared'
import Pagination from '../../../components/Pagination/Pagination'
import { formatAdminDate } from '../adminFormat'

const emptyForm = {
  expiresAt: '', internalNote: '', loginIdentifier: '', passwordSecret: '',
  recoveryInfo: '', twoFactorSecret: '', usageNote: '', warrantyUntil: '',
}

const statusLabels = {
  AVAILABLE: 'Sẵn sàng', RESERVED: 'Đang giữ', DELIVERED: 'Đã giao',
  REPLACED: 'Đã đổi', REFUNDED: 'Đã hoàn', DISABLED: 'Đã khóa', EXPIRED: 'Hết hạn',
}

const toInstant = (value) => value ? new Date(value).toISOString() : null
const toInputDate = (value) => value ? new Date(value).toISOString().slice(0, 16) : ''

function AdminAccountInventoryView({ onSetError, onSetNotice, token }) {
  const [services, setServices] = useState([])
  const [serviceId, setServiceId] = useState('')
  const [credentials, setCredentials] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [csv, setCsv] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [revealed, setRevealed] = useState({})
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const [createMode, setCreateMode] = useState(null)

  const fail = useCallback((message) => {
    onSetError(message)
  }, [onSetError])

  const loadServices = useCallback(async () => {
    if (!token) return
    try {
      const data = await adminApi.searchServices({ type: 'ACCOUNT_STOCK', limit: 200 }, token)
      const items = Array.isArray(data) ? data : data?.content || data?.items || []
      const accountServices = items.filter((item) => item.type === 'ACCOUNT_STOCK')
      setServices(accountServices)
      setServiceId((current) => current || String(accountServices[0]?.id || ''))
    } catch (err) {
      fail(err.message || 'Không tải được dịch vụ giao tài khoản.')
    }
  }, [fail, token])

  const loadCredentials = useCallback(async (page) => {
    if (!token || !serviceId) {
      setCredentials([])
      return
    }
    const targetPage = page ?? currentPage
    setLoading(true)
    try {
      const data = await adminApi.getServiceCredentials(serviceId, token, {
        query: query.trim() || undefined,
        status: status || undefined,
        page: targetPage,
        limit: 50,
      })
      const { items, totalPages: pages } = normalizePaged(data, 50)
      setCredentials(items)
      setTotalPages(pages)
      setCurrentPage(targetPage)
    } catch (err) {
      fail(err.message || 'Không tải được kho tài khoản.')
    } finally {
      setLoading(false)
    }
  }, [currentPage, fail, query, serviceId, status, token])

  useEffect(() => {
    const timer = window.setTimeout(loadServices, 0)
    return () => window.clearTimeout(timer)
  }, [loadServices])
  useEffect(() => {
    setCurrentPage(0)
  }, [query, status, serviceId])

  useEffect(() => {
    const timer = window.setTimeout(() => loadCredentials(), 250)
    return () => window.clearTimeout(timer)
  }, [loadCredentials])

  const stats = useMemo(() => ({
    available: credentials.filter((item) => item.status === 'AVAILABLE').length,
    delivered: credentials.filter((item) => item.status === 'DELIVERED').length,
    total: credentials.length,
  }), [credentials])

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const resetForm = () => { setForm(emptyForm); setEditingId(null); setCreateMode(null) }

  const saveCredential = async (event) => {
    event.preventDefault()
    if (!serviceId || !form.loginIdentifier.trim() || (!editingId && !form.passwordSecret.trim())) return
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        expiresAt: toInstant(form.expiresAt),
        internalNote: form.internalNote || null,
        passwordSecret: form.passwordSecret || null,
        recoveryInfo: form.recoveryInfo || null,
        twoFactorSecret: form.twoFactorSecret || null,
        usageNote: form.usageNote || null,
        warrantyUntil: toInstant(form.warrantyUntil),
      }
      if (editingId) await adminApi.updateServiceCredential(editingId, payload, token)
      else await adminApi.createServiceCredential(serviceId, payload, token)
      onSetNotice(editingId ? 'Đã cập nhật tài khoản trong kho.' : 'Đã nhập tài khoản vào kho.')
      resetForm()
      await loadCredentials()
    } catch (err) {
      fail(err.message || 'Không lưu được tài khoản.')
    } finally {
      setSubmitting(false)
    }
  }

  const editCredential = (item) => {
    setEditingId(item.id)
    setCreateMode('single')
    setForm({
      expiresAt: toInputDate(item.expiresAt), internalNote: item.internalNote || '',
      loginIdentifier: item.loginIdentifier || '', passwordSecret: '',
      recoveryInfo: item.recoveryInfo || '', twoFactorSecret: item.twoFactorSecret || '',
      usageNote: item.usageNote || '', warrantyUntil: toInputDate(item.warrantyUntil),
    })
  }

  const disableCredential = async (item) => {
    if (!window.confirm(`Khóa tài khoản ${item.loginIdentifier}?`)) return
    try {
      await adminApi.disableServiceCredential(item.id, token)
      onSetNotice('Đã khóa tài khoản trong kho.')
      await loadCredentials()
    } catch (err) {
      fail(err.message || 'Không khóa được tài khoản.')
    }
  }

  const revealCredential = async (item) => {
    try {
      const data = await adminApi.revealServiceCredential(item.id, token)
      setRevealed((current) => ({ ...current, [item.id]: data }))
    } catch (err) {
      fail(err.message || 'Không xem được thông tin tài khoản.')
    }
  }

  const importCsv = async () => {
    if (!serviceId || !csv.trim()) return
    setSubmitting(true)
    try {
      const result = await adminApi.bulkImportServiceCredentials(serviceId, { csvContent: csv, skipDuplicates: true }, token)
      onSetNotice(`Đã nhập ${result.created || 0} tài khoản, bỏ qua ${result.skipped || 0}.`)
      setCsv('')
      setCreateMode(null)
      await loadCredentials()
    } catch (err) {
      fail(err.message || 'Import CSV thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-view account-inventory-view">
      <div className="admin-toolbar">
        <div><h2>Kho tài khoản</h2></div>
        <div className="admin-toolbar-actions inventory-toolbar-actions">
          <button type="button" className="admin-icon-button" onClick={loadCredentials}><RefreshCw size={18} /> Tải lại</button>
          <div className="admin-create-dropdown-container">
            <button type="button" className="admin-primary-button" onClick={() => setCreateMenuOpen((current) => !current)}>
              <Plus size={18} /> Tạo mới
            </button>
            {createMenuOpen && (
              <div className="admin-dropdown-menu">
                <button type="button" onClick={() => { resetForm(); setCreateMode('single'); setCreateMenuOpen(false) }}>
                  Nhập một tài khoản
                </button>
                <button type="button" onClick={() => { resetForm(); setCreateMode('import'); setCreateMenuOpen(false) }}>
                  Import CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="admin-metrics">
        <article className="admin-metric"><span>Tổng trong dịch vụ</span><strong>{stats.total}</strong></article>
        <article className="admin-metric"><span>Sẵn sàng cấp</span><strong>{stats.available}</strong></article>
        <article className="admin-metric"><span>Đã giao</span><strong>{stats.delivered}</strong></article>
      </div>

      <section className="admin-panel inventory-service-picker">
        <label><span>Dịch vụ giao tài khoản</span><select value={serviceId} onChange={(event) => { setServiceId(event.target.value); resetForm() }}><option value="">Chọn dịch vụ</option>{services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <SearchField value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tài khoản hoặc ghi chú..." />
        <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </section>

      {!services.length ? <AdminEmptyState message="Chưa có dịch vụ giao tài khoản." hint="Tạo một Sản phẩm giao tài khoản trong mục Dịch vụ trước." /> : (
        <div className={`inventory-layout ${createMode ? 'with-editor' : 'list-only'}`}>
          {createMode && <section className="admin-panel inventory-form-panel">
            <div className="admin-panel-head">
              <div>
                <h3>{createMode === 'import' ? 'Import tài khoản' : editingId ? 'Sửa tài khoản' : 'Nhập tài khoản mới'}</h3>
                <span>Tài khoản sẽ thuộc dịch vụ đang chọn.</span>
              </div>
              <button type="button" onClick={resetForm}><X size={16} /> Đóng</button>
            </div>
            {createMode === 'single' && <form className="admin-form inventory-form" onSubmit={saveCredential}>
              <label><span>Tài khoản đăng nhập *</span><input value={form.loginIdentifier} onChange={(e) => updateForm('loginIdentifier', e.target.value)} required /></label>
              <label><span>Mật khẩu *</span><input value={form.passwordSecret} onChange={(e) => updateForm('passwordSecret', e.target.value)} placeholder={editingId ? 'Để trống nếu không đổi' : ''} required={!editingId} /></label>
              <label><span>Thông tin khôi phục</span><input value={form.recoveryInfo} onChange={(e) => updateForm('recoveryInfo', e.target.value)} /></label>
              <label><span>Mã/secret 2FA</span><input value={form.twoFactorSecret} onChange={(e) => updateForm('twoFactorSecret', e.target.value)} /></label>
              <label><span>Hạn tài khoản</span><input type="datetime-local" value={form.expiresAt} onChange={(e) => updateForm('expiresAt', e.target.value)} /></label>
              <label><span>Bảo hành đến</span><input type="datetime-local" value={form.warrantyUntil} onChange={(e) => updateForm('warrantyUntil', e.target.value)} /></label>
              <label><span>Hướng dẫn cho khách</span><textarea rows="2" value={form.usageNote} onChange={(e) => updateForm('usageNote', e.target.value)} /></label>
              <label><span>Ghi chú nội bộ</span><textarea rows="2" value={form.internalNote} onChange={(e) => updateForm('internalNote', e.target.value)} /></label>
              <button type="submit" disabled={submitting || !serviceId}><Plus size={16} /> {editingId ? 'Cập nhật' : 'Nhập vào kho'}</button>
            </form>}
            {createMode === 'import' && <div className="inventory-import standalone">
              <h3><FileUp size={17} /> Import CSV</h3>
              <p>Mỗi dòng: login,password,recovery,twoFactor,hướng dẫn,ghi chú.</p>
              <textarea rows="5" value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="email@test.com,password123,,,Hướng dẫn,Ghi chú" />
              <button type="button" className="admin-icon-button" disabled={submitting || !csv.trim() || !serviceId} onClick={importCsv}><FileUp size={16} /> Import</button>
            </div>}
          </section>}

          <section className="admin-panel inventory-list-panel">
            <div className="admin-panel-head"><div><h3>Danh sách tài khoản</h3><span>{credentials.length} kết quả</span></div><PackageOpen size={20} /></div>
            {loading ? <Loading /> : credentials.length === 0 ? <AdminEmptyState message="Kho chưa có tài khoản phù hợp." /> : (
              <>
                <div className="inventory-list">
                  {credentials.map((item) => {
                    const visible = revealed[item.id] || item
                    return (
                      <article key={item.id}>
                        <div><strong>{item.loginIdentifier}</strong><span>{statusLabels[item.status] || item.status} · Nhập {formatAdminDate(item.createdAt)}</span>{visible.passwordSecret && <code>Mật khẩu: {visible.passwordSecret}</code>}</div>
                        <div className="inventory-actions"><button type="button" onClick={() => revealCredential(item)}><Eye size={15} /> Xem</button>{item.status === 'AVAILABLE' && <><button type="button" onClick={() => editCredential(item)}><Pencil size={15} /> Sửa</button><button type="button" className="danger" onClick={() => disableCredential(item)}><ShieldOff size={15} /> Khóa</button></>}</div>
                      </article>
                    )
                  })}
                </div>
                <Pagination
                  currentPage={currentPage + 1}
                  totalPages={totalPages}
                  onPageChange={(page) => loadCredentials(page - 1)}
                />
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default AdminAccountInventoryView
