import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, PauseCircle, RefreshCw, ShieldOff } from 'lucide-react'
import { adminApi } from '../../../api/admin.api'
import Loading from '../../../components/Loading/Loading'
import { AdminEmptyState } from '../AdminShared'
import { formatAdminDate } from '../adminFormat'

const statusLabels = {
  PENDING: 'Chờ cấp quyền',
  ACTIVE: 'Đang hoạt động',
  EXPIRING: 'Sắp hết hạn',
  SUSPENDED: 'Tạm ngưng',
  REVOKED: 'Đã thu hồi',
  FAILED: 'Thất bại',
}

const strategyLabels = {
  DEDICATED_ACCOUNT: 'Tài khoản riêng',
  TEAM_INVITE: 'Team seat',
  PROVIDER_API: 'Provider API',
  INTERNAL_ACCESS: 'Nội bộ',
  MANUAL: 'Thủ công',
}

function AdminEntitlementsView({ onSetError, onSetNotice, token }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await adminApi.getEntitlements(token)
      setItems(Array.isArray(data) ? data : data?.content || [])
    } catch (err) {
      onSetError(err.message || 'Không tải được quyền truy cập.')
    } finally {
      setLoading(false)
    }
  }, [onSetError, token])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return items.filter((item) => {
      if (status && item.status !== status) return false
      if (!normalized) return true
      return [item.userName, item.userEmail, item.serviceName, item.orderCode, item.accessIdentifier, item.externalResourceId]
        .some((value) => String(value || '').toLowerCase().includes(normalized))
    })
  }, [items, query, status])

  const update = async (item, action) => {
    let payload = { action }
    if (action === 'ACTIVATE') {
      const externalResourceId = window.prompt(
        'Mã member/resource từ nhà cung cấp (có thể để trống nếu xử lý thủ công):',
        item.externalResourceId || '',
      )
      if (externalResourceId === null) return
      payload = { ...payload, externalResourceId, reason: 'Admin confirmed access provisioning' }
    }
    if (action === 'EXTEND') {
      const raw = window.prompt('Số ngày gia hạn:', '30')
      if (raw === null) return
      const extendDays = Number(raw)
      if (!Number.isInteger(extendDays) || extendDays < 1) {
        onSetError('Số ngày gia hạn không hợp lệ.')
        return
      }
      payload = { ...payload, extendDays, reason: 'Renewal payment/provisioning confirmed' }
    }
    if (['SUSPEND', 'REVOKE'].includes(action)) {
      const reason = window.prompt(`Lý do ${action === 'SUSPEND' ? 'tạm ngưng' : 'thu hồi'}:`)
      if (!reason?.trim()) return
      payload = { ...payload, reason: reason.trim() }
    }

    setBusyId(item.id)
    try {
      const saved = await adminApi.updateEntitlement(item.id, payload, token)
      setItems((current) => current.map((entry) => entry.id === saved.id ? saved : entry))
      onSetNotice(`Đã cập nhật quyền truy cập #${item.id}.`)
    } catch (err) {
      onSetError(err.message || 'Không cập nhật được quyền truy cập.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="admin-view entitlements-view">
      <div className="admin-toolbar">
        <div>
          <span className="entitlements-eyebrow">Access control</span>
          <h2>Quyền truy cập khách hàng</h2>
          <p>Cấp, gia hạn, tạm ngưng và thu hồi team seat hoặc tài nguyên nhà cung cấp.</p>
        </div>
        <button type="button" className="admin-icon-button" onClick={load} disabled={loading}>
          <RefreshCw size={17} /> Tải lại
        </button>
      </div>

      <section className="admin-panel entitlement-filters">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm khách, dịch vụ, mã đơn, resource ID..." />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
        <strong>{filtered.length} quyền</strong>
      </section>

      <section className="admin-panel">
        {loading ? <Loading /> : filtered.length === 0 ? (
          <AdminEmptyState message="Chưa có quyền truy cập." />
        ) : (
          <div className="entitlement-table-wrap">
            <table className="entitlement-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Dịch vụ</th>
                  <th>Quyền cấp</th>
                  <th>Thời hạn</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.userName}</strong><small>{item.userEmail}</small></td>
                    <td><strong>{item.serviceName}</strong><small>{item.orderCode}</small></td>
                    <td>
                      <strong>{strategyLabels[item.accessStrategy] || item.accessStrategy}</strong>
                      <small>{item.externalResourceId || item.accessIdentifier || 'Chưa gắn resource'}</small>
                    </td>
                    <td><strong>{formatAdminDate(item.expiresAt)}</strong><small>Bắt đầu: {formatAdminDate(item.startsAt)}</small></td>
                    <td><span className={`entitlement-status ${String(item.status).toLowerCase()}`}>{statusLabels[item.status] || item.status}</span></td>
                    <td>
                      <div className="entitlement-actions">
                        <button type="button" title="Kích hoạt" disabled={busyId === item.id} onClick={() => update(item, 'ACTIVATE')}><CheckCircle2 size={15} /></button>
                        <button type="button" title="Gia hạn" disabled={busyId === item.id} onClick={() => update(item, 'EXTEND')}><Clock3 size={15} /></button>
                        <button type="button" title="Tạm ngưng" disabled={busyId === item.id} onClick={() => update(item, 'SUSPEND')}><PauseCircle size={15} /></button>
                        <button type="button" title="Thu hồi" className="danger" disabled={busyId === item.id} onClick={() => update(item, 'REVOKE')}><ShieldOff size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminEntitlementsView
