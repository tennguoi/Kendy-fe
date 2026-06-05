import { RefreshCw, Save, Shield, Wallet } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../api/admin.api'
import { AdminEmptyState, AdminStatusBadge } from './AdminShared'
import { formatAdminDate, formatAdminMoney } from './adminFormat'

const userStatuses = ['', 'ACTIVE', 'LOCKED', 'PENDING_VERIFY']
const userRoles = ['USER', 'ADMIN', 'SUPER_ADMIN']
const detailTabs = [
  { id: 'orders', label: 'Đơn' },
  { id: 'wallet', label: 'Ví' },
  { id: 'tickets', label: 'Ticket' },
  { id: 'sessions', label: 'Session' },
  { id: 'audit', label: 'Audit' },
]

function AdminUsersView({
  onSetError,
  onSetNotice,
  token,
}) {
  const [activeDetailTab, setActiveDetailTab] = useState('orders')
  const [adjustForm, setAdjustForm] = useState({ amount: '', confirmationPassword: '', direction: 'CREDIT', reason: '' })
  const [detail, setDetail] = useState(null)
  const [detailData, setDetailData] = useState({ audit: [], orders: [], sessions: [], tickets: [], wallet: [] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [roleForm, setRoleForm] = useState({ reason: '', role: 'USER' })
  const [selectedId, setSelectedId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [users, setUsers] = useState([])

  const selectedUser = users.find((user) => user.id === selectedId) || users[0]

  const setViewError = useCallback((message) => {
    setError(message)
    onSetError(message)
  }, [onSetError])

  const loadUsers = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setViewError('')
    try {
      const data = await adminApi.searchUsers({ query: query.trim(), status: statusFilter }, token)
      setUsers(data)
      setSelectedId((current) => (current && data.some((user) => user.id === current) ? current : data[0]?.id || null))
    } catch (err) {
      setViewError(err.message || 'Không tải được danh sách user.')
    } finally {
      setLoading(false)
    }
  }, [query, setViewError, statusFilter, token])

  const loadUserDetail = useCallback(async (userId) => {
    if (!token || !userId) {
      setDetail(null)
      setDetailData({ audit: [], orders: [], sessions: [], tickets: [], wallet: [] })
      return
    }

    setViewError('')
    try {
      const [profile, orders, wallet, tickets, sessions, audit] = await Promise.all([
        adminApi.getUserDetail(userId, token),
        adminApi.getUserOrders(userId, token),
        adminApi.getUserWalletTransactions(userId, token),
        adminApi.getUserTickets(userId, token),
        adminApi.getUserSessions(userId, token),
        adminApi.getAuditLogs({ actorUserId: userId, targetId: userId }, token),
      ])
      setDetail(profile)
      setDetailData({ audit, orders, sessions, tickets, wallet })
      setRoleForm((current) => ({ ...current, role: profile.user.role || 'USER' }))
    } catch (err) {
      setViewError(err.message || 'Không tải được chi tiết user.')
    }
  }, [setViewError, token])

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, 250)
    return () => window.clearTimeout(timer)
  }, [loadUsers])

  useEffect(() => {
    const timer = window.setTimeout(() => loadUserDetail(selectedUser?.id), 0)
    return () => window.clearTimeout(timer)
  }, [loadUserDetail, selectedUser?.id])

  const patchUser = (saved) => {
    setUsers((items) => items.map((item) => (item.id === saved.id ? saved : item)))
  }

  const updateStatus = async (status) => {
    if (!selectedUser) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.updateUserStatus(selectedUser.id, {
        reason: status === 'LOCKED' ? 'Khóa từ màn hình quản trị' : 'Mở lại từ màn hình quản trị',
        status,
      }, token)
      patchUser(saved)
      onSetNotice(`Đã cập nhật trạng thái ${saved.email}.`)
    } catch (err) {
      setViewError(err.message || 'Không cập nhật được trạng thái user.')
    } finally {
      setSubmitting(false)
    }
  }

  const updateRole = async (event) => {
    event.preventDefault()
    if (!selectedUser) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.updateUserRole(selectedUser.id, {
        reason: roleForm.reason.trim(),
        role: roleForm.role,
      }, token)
      patchUser(saved)
      setRoleForm({ reason: '', role: saved.role })
      await loadUserDetail(saved.id)
      onSetNotice(`Đã cập nhật role cho ${saved.email}.`)
    } catch (err) {
      setViewError(err.message || 'Không cập nhật được role user.')
    } finally {
      setSubmitting(false)
    }
  }

  const adjustWallet = async (event) => {
    event.preventDefault()
    if (!selectedUser) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.adjustWallet(selectedUser.id, {
        amount: Number(adjustForm.amount),
        confirmationPassword: adjustForm.confirmationPassword.trim(),
        direction: adjustForm.direction,
        reason: adjustForm.reason.trim(),
      }, token)
      setAdjustForm({ amount: '', confirmationPassword: '', direction: 'CREDIT', reason: '' })
      await loadUsers()
      await loadUserDetail(selectedUser.id)
      onSetNotice(`Đã điều chỉnh ví cho ${selectedUser.email}.`)
    } catch (err) {
      setViewError(err.message || 'Không điều chỉnh được ví.')
    } finally {
      setSubmitting(false)
    }
  }

  const revokeSession = async (sessionId) => {
    if (!selectedUser) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.revokeUserSession(selectedUser.id, sessionId, token)
      await loadUserDetail(selectedUser.id)
      onSetNotice(`Đã thu hồi session #${sessionId}.`)
    } catch (err) {
      setViewError(err.message || 'Không thu hồi được session.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">Users</span>
          <h2>Quản lý người dùng</h2>
        </div>
        <button type="button" className="admin-icon-button" onClick={loadUsers} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {(error || loading) && <p className={error ? 'admin-message error' : 'admin-message'}>{error || 'Đang tải user...'}</p>}

      <div className="admin-filters">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên, email, SĐT" type="search" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          {userStatuses.map((status) => (
            <option value={status} key={status || 'all'}>{status || 'Tất cả trạng thái'}</option>
          ))}
        </select>
      </div>

      <div className="admin-grid detail-layout">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Danh sách user</h3>
            <span>{users.length} tài khoản</span>
          </div>
          <div className="admin-data-table">
            <div className="admin-data-row head users">
              <span>User</span>
              <span>Vai trò</span>
              <span>Số dư</span>
              <span>Trạng thái</span>
            </div>
            {users.map((user) => (
              <button
                type="button"
                className={`admin-data-row users ${selectedUser?.id === user.id ? 'selected' : ''}`}
                key={user.id}
                onClick={() => setSelectedId(user.id)}
              >
                <span>
                  <strong>{user.name || 'Chưa đặt tên'}</strong>
                  <small>{user.email}</small>
                </span>
                <span>{user.role}</span>
                <span>{formatAdminMoney(user.balance)}</span>
                <span><AdminStatusBadge status={user.status} /></span>
              </button>
            ))}
            {users.length === 0 && <AdminEmptyState />}
          </div>
        </div>

        <aside className="admin-panel admin-detail-panel">
          <div className="admin-panel-head">
            <h3>{selectedUser ? selectedUser.name || selectedUser.email : 'Chọn user'}</h3>
            {selectedUser && <AdminStatusBadge status={selectedUser.status} />}
          </div>

          {selectedUser ? (
            <>
              <dl className="admin-detail-list">
                <div><dt>Email</dt><dd>{selectedUser.email}</dd></div>
                <div><dt>Điện thoại</dt><dd>{selectedUser.phone || 'Chưa có'}</dd></div>
                <div><dt>Vai trò</dt><dd>{selectedUser.role}</dd></div>
                <div><dt>Số dư</dt><dd>{formatAdminMoney(selectedUser.balance)}</dd></div>
                <div><dt>2FA</dt><dd>{selectedUser.twoFactorEnabled ? 'Đã bật' : 'Chưa bật'}</dd></div>
                <div><dt>Ngày tạo</dt><dd>{formatAdminDate(selectedUser.createdAt)}</dd></div>
              </dl>

              {detail && (
                <div className="admin-report-grid compact-report">
                  <div><span>Đơn</span><strong>{detail.orderCount}</strong></div>
                  <div><span>Nạp</span><strong>{formatAdminMoney(detail.completedDepositAmount)}</strong></div>
                  <div><span>Mua</span><strong>{formatAdminMoney(detail.purchaseAmount)}</strong></div>
                  <div><span>Refund</span><strong>{formatAdminMoney(detail.refundAmount)}</strong></div>
                </div>
              )}

              <div className="admin-action-row">
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => updateStatus('ACTIVE')}>
                  Mở user
                </button>
                <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => updateStatus('LOCKED')}>
                  Khóa user
                </button>
              </div>

              <form className="admin-form compact" onSubmit={updateRole}>
                <div className="admin-panel-head compact-head">
                  <h3>Vai trò</h3>
                  <Shield size={18} strokeWidth={2} aria-hidden="true" />
                </div>
                <label>
                  <span>Role</span>
                  <select value={roleForm.role} onChange={(event) => setRoleForm((current) => ({ ...current, role: event.target.value }))}>
                    {userRoles.map((role) => <option value={role} key={role}>{role}</option>)}
                  </select>
                </label>
                <label>
                  <span>Lý do</span>
                  <textarea value={roleForm.reason} onChange={(event) => setRoleForm((current) => ({ ...current, reason: event.target.value }))} rows="2" />
                </label>
                <button type="submit" disabled={submitting}>
                  <Save size={17} strokeWidth={2} aria-hidden="true" />
                  <span>Lưu role</span>
                </button>
              </form>

              <form className="admin-form compact" onSubmit={adjustWallet}>
                <div className="admin-panel-head compact-head">
                  <h3>Điều chỉnh ví</h3>
                  <Wallet size={18} strokeWidth={2} aria-hidden="true" />
                </div>
                <label>
                  <span>Loại</span>
                  <select value={adjustForm.direction} onChange={(event) => setAdjustForm((current) => ({ ...current, direction: event.target.value }))}>
                    <option value="CREDIT">Cộng tiền</option>
                    <option value="DEBIT">Trừ tiền</option>
                  </select>
                </label>
                <label>
                  <span>Số tiền</span>
                  <input value={adjustForm.amount} onChange={(event) => setAdjustForm((current) => ({ ...current, amount: event.target.value }))} inputMode="decimal" required />
                </label>
                <label>
                  <span>Lý do</span>
                  <textarea value={adjustForm.reason} onChange={(event) => setAdjustForm((current) => ({ ...current, reason: event.target.value }))} rows="3" required />
                </label>
                <label>
                  <span>Mật khẩu xác nhận</span>
                  <input value={adjustForm.confirmationPassword} onChange={(event) => setAdjustForm((current) => ({ ...current, confirmationPassword: event.target.value }))} type="password" required />
                </label>
                <button type="submit" disabled={submitting}>
                  <Save size={17} strokeWidth={2} aria-hidden="true" />
                  <span>Lưu điều chỉnh</span>
                </button>
              </form>

              <div className="admin-panel-subsection">
                <div className="admin-tabs">
                  {detailTabs.map((tab) => (
                    <button
                      type="button"
                      className={activeDetailTab === tab.id ? 'active' : ''}
                      key={tab.id}
                      onClick={() => setActiveDetailTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeDetailTab === 'orders' && (
                  <div className="admin-mini-list">
                    {detailData.orders.map((order) => (
                      <article key={order.id}>
                        <strong>{order.orderCode}</strong>
                        <span>{order.serviceName} · {formatAdminMoney(order.amount)} · {order.status}</span>
                      </article>
                    ))}
                    {detailData.orders.length === 0 && <AdminEmptyState message="User chưa có đơn." />}
                  </div>
                )}

                {activeDetailTab === 'wallet' && (
                  <div className="admin-mini-list">
                    {detailData.wallet.map((item) => (
                      <article key={item.id}>
                        <strong>{item.transactionCode}</strong>
                        <span>{item.type} · {item.direction} · {formatAdminMoney(item.amount)}</span>
                      </article>
                    ))}
                    {detailData.wallet.length === 0 && <AdminEmptyState message="User chưa có giao dịch ví." />}
                  </div>
                )}

                {activeDetailTab === 'tickets' && (
                  <div className="admin-mini-list">
                    {detailData.tickets.map((ticket) => (
                      <article key={ticket.id}>
                        <strong>{ticket.ticketCode}</strong>
                        <span>{ticket.subject} · {ticket.status}</span>
                      </article>
                    ))}
                    {detailData.tickets.length === 0 && <AdminEmptyState message="User chưa có ticket." />}
                  </div>
                )}

                {activeDetailTab === 'sessions' && (
                  <div className="admin-mini-list">
                    {detailData.sessions.map((session) => (
                      <article key={session.id}>
                        <strong>Session #{session.id}</strong>
                        <span>Tạo {formatAdminDate(session.createdAt)} · Hết hạn {formatAdminDate(session.expiresAt)}</span>
                        <button type="button" className="admin-danger-button slim" disabled={submitting || session.revokedAt} onClick={() => revokeSession(session.id)}>
                          Thu hồi
                        </button>
                      </article>
                    ))}
                    {detailData.sessions.length === 0 && <AdminEmptyState message="User chưa có session." />}
                  </div>
                )}

                {activeDetailTab === 'audit' && (
                  <div className="admin-mini-list">
                    {detailData.audit.map((item) => (
                      <article key={item.id}>
                        <strong>{item.action}</strong>
                        <span>{item.targetType || 'SYSTEM'} #{item.targetId || '-'} · {formatAdminDate(item.createdAt)}</span>
                      </article>
                    ))}
                    {detailData.audit.length === 0 && <AdminEmptyState message="Chưa có audit log liên quan." />}
                  </div>
                )}
              </div>
            </>
          ) : (
            <AdminEmptyState message="Chọn một user để xem chi tiết." />
          )}
        </aside>
      </div>
    </section>
  )
}

export default AdminUsersView
