import { RefreshCw, Save, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { adminApi } from '../../api/admin.api'
import { AdminEmptyState, AdminStatusBadge } from './AdminShared'
import { formatAdminDate, formatAdminMoney, includesKeyword } from './adminFormat'

const userStatuses = ['', 'ACTIVE', 'LOCKED', 'PENDING_VERIFY']

function AdminUsersView({
  error,
  loading,
  onReload,
  onSetError,
  onSetNotice,
  onUpdateUsers,
  token,
  users,
}) {
  const [adjustForm, setAdjustForm] = useState({ amount: '', direction: 'CREDIT', reason: '' })
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedUser = users.find((user) => user.id === selectedId) || users[0]

  const visibleUsers = useMemo(
    () =>
      users
        .filter((user) => !statusFilter || user.status === statusFilter)
        .filter((user) => includesKeyword(user, query, ['name', 'email', 'phone', 'role', 'status']))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [query, statusFilter, users],
  )

  const patchUser = (saved) => {
    onUpdateUsers((items) => items.map((item) => (item.id === saved.id ? saved : item)))
  }

  const updateStatus = async (status) => {
    if (!selectedUser) {
      return
    }

    setSubmitting(true)
    onSetError('')
    try {
      const saved = await adminApi.updateUserStatus(selectedUser.id, {
        reason: status === 'LOCKED' ? 'Khóa từ màn hình quản trị' : 'Mở lại từ màn hình quản trị',
        status,
      }, token)
      patchUser(saved)
      onSetNotice(`Đã cập nhật trạng thái ${saved.email}.`)
    } catch (err) {
      onSetError(err.message || 'Không cập nhật được trạng thái user.')
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
    onSetError('')
    try {
      await adminApi.adjustWallet(selectedUser.id, {
        amount: Number(adjustForm.amount),
        direction: adjustForm.direction,
        reason: adjustForm.reason.trim(),
      }, token)
      setAdjustForm({ amount: '', direction: 'CREDIT', reason: '' })
      await onReload()
      onSetNotice(`Đã điều chỉnh ví cho ${selectedUser.email}.`)
    } catch (err) {
      onSetError(err.message || 'Không điều chỉnh được ví.')
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
        <button type="button" className="admin-icon-button" onClick={onReload} disabled={loading}>
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
            <span>{visibleUsers.length} tài khoản</span>
          </div>
          <div className="admin-data-table">
            <div className="admin-data-row head users">
              <span>User</span>
              <span>Vai trò</span>
              <span>Số dư</span>
              <span>Trạng thái</span>
            </div>
            {visibleUsers.map((user) => (
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
            {visibleUsers.length === 0 && <AdminEmptyState />}
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

              <div className="admin-action-row">
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => updateStatus('ACTIVE')}>
                  Mở user
                </button>
                <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => updateStatus('LOCKED')}>
                  Khóa user
                </button>
              </div>

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
                <button type="submit" disabled={submitting}>
                  <Save size={17} strokeWidth={2} aria-hidden="true" />
                  <span>Lưu điều chỉnh</span>
                </button>
              </form>
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
