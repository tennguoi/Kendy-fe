import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import UserDetailPanel from './components/UserDetailPanel'
import UserListPanel from './components/UserListPanel'
import UsersFilterBar from './components/UsersFilterBar'

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (!value || typeof value !== 'object') {
    return []
  }

  const keys = ['content', 'items', 'data', 'records', 'results']
  const list = keys.map((key) => value[key]).find(Array.isArray)
  return list || []
}

function AdminUsersView({
  onSetError,
  onSetNotice,
  token,
}) {
  const [activeDetailTab, setActiveDetailTab] = useState('orders')
  const [adjustForm, setAdjustForm] = useState({ amount: '', confirmationPassword: '', direction: 'CREDIT', reason: '' })
  const [bulkStatusForm, setBulkStatusForm] = useState({ ids: '', reason: '' })
  const [detail, setDetail] = useState(null)
  const [detailData, setDetailData] = useState({ audit: [], orders: [], sessions: [], tickets: [], wallet: [] })
  const [error, setError] = useState('')
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false)
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
      setLoading(true)
      setHasLoadedUsers(false)
      return
    }

    setLoading(true)
    setHasLoadedUsers(false)
    setViewError('')
    try {
      const data = await adminApi.searchUsers({ query: query.trim(), status: statusFilter }, token)
      const normalizedUsers = normalizeList(data)
      setUsers(normalizedUsers)
      setSelectedId((current) => (
        current && normalizedUsers.some((user) => user.id === current)
          ? current
          : normalizedUsers[0]?.id || null
      ))
    } catch (err) {
      setViewError(err.message || 'Không tải được danh sách user.')
    } finally {
      setHasLoadedUsers(true)
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
      setDetailData({
        audit: normalizeList(audit),
        orders: normalizeList(orders),
        sessions: normalizeList(sessions),
        tickets: normalizeList(tickets),
        wallet: normalizeList(wallet),
      })
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
    setUsers((items) => normalizeList(items).map((item) => (item.id === saved.id ? saved : item)))
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

  const runBulkUserStatus = async (status) => {
    const ids = bulkStatusForm.ids
      .split(/[\s,]+/)
      .map((id) => Number(id))
      .filter(Boolean)

    if (ids.length === 0) {
      setViewError('Nhập danh sách user ID cần xử lý.')
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const payload = { ids, reason: bulkStatusForm.reason.trim() || 'Cập nhật bulk từ màn hình quản trị' }
      const saved = status === 'LOCKED'
        ? await adminApi.bulkLockUsers(payload, token)
        : await adminApi.bulkUnlockUsers(payload, token)
      saved.forEach(patchUser)
      setBulkStatusForm({ ids: '', reason: '' })
      await loadUsers()
      onSetNotice(`Đã cập nhật ${saved.length} user.`)
    } catch (err) {
      setViewError(err.message || 'Không cập nhật bulk user.')
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

      <UsersFilterBar
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
        query={query}
        statusFilter={statusFilter}
      />

      <div className="admin-grid detail-layout">
        <UserListPanel
          hasLoadedUsers={hasLoadedUsers}
          onSelectUser={setSelectedId}
          selectedUser={selectedUser}
          users={users}
        />
        <UserDetailPanel
          activeDetailTab={activeDetailTab}
          adjustForm={adjustForm}
          bulkStatusForm={bulkStatusForm}
          detail={detail}
          detailData={detailData}
          hasLoadedUsers={hasLoadedUsers}
          onActiveDetailTabChange={setActiveDetailTab}
          onAdjustFormChange={setAdjustForm}
          onAdjustWallet={adjustWallet}
          onBulkStatusFormChange={setBulkStatusForm}
          onRevokeSession={revokeSession}
          onRoleFormChange={setRoleForm}
          onRunBulkUserStatus={runBulkUserStatus}
          onUpdateRole={updateRole}
          onUpdateStatus={updateStatus}
          roleForm={roleForm}
          selectedUser={selectedUser}
          submitting={submitting}
        />
      </div>
    </section>
  )
}

export default AdminUsersView
