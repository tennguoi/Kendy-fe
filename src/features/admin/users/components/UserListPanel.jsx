import { Lock, MoreHorizontal, Unlock, UserRoundCog } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import Modal from '../../../../components/Modal/Modal'
import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { getUserRoleLabel } from '../users.constants'
import { formatAdminMoney } from '../../adminFormat'
import UserAdminTools from './UserAdminTools'

function getUserAvatarUrl(user) {
  return user?.avatarUrl || user?.avatar || user?.picture || user?.imageUrl || user?.photoUrl || ''
}

function getUserInitial(user) {
  return (user?.name || user?.email || 'U').charAt(0).toUpperCase()
}

function AdminUserAvatar({ user }) {
  const [failed, setFailed] = useState(false)
  const avatarUrl = getUserAvatarUrl(user)

  if (avatarUrl && !failed) {
    return (
      <img
        className="admin-user-avatar image"
        src={avatarUrl}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    )
  }

  return <div className="admin-user-avatar">{getUserInitial(user)}</div>
}

function UserListPanel({
  adjustForm,
  bulkStatusForm,
  hasLoadedUsers,
  onAdjustFormChange,
  onAdjustWallet,
  onBulkStatusFormChange,
  onRoleFormChange,
  onRunBulkUserStatus,
  onSelectUser,
  onUpdateRole,
  onUpdateStatus,
  roleForm,
  selectedUser,
  submitting,
  users = [],
}) {
  const { t } = useTranslation()
  const location = useLocation()
  const [openToolbarId, setOpenToolbarId] = useState(null)
  const [activeToolTab, setActiveToolTab] = useState('wallet')
  const [toolsUser, setToolsUser] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpenToolbarId(null)
      setToolsUser(null)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  const handleSelectUser = (userId) => {
    onSelectUser(userId)
  }

  const handleOpenTools = (event, user) => {
    event.stopPropagation()
    onSelectUser(user.id, { openDrawer: false })
    setActiveToolTab('wallet')
    setToolsUser(user)
    setOpenToolbarId(null)
  }

  const handleToggleToolbar = (event, userId) => {
    event.stopPropagation()
    onSelectUser(userId, { openDrawer: false })
    setOpenToolbarId((current) => (current === userId ? null : userId))
  }

  const handleUpdateStatus = (event, user, status) => {
    event.stopPropagation()
    onSelectUser(user.id, { openDrawer: false })
    onUpdateStatus(status, user)
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>Danh sách user</h3>
        <span>{users.length} {t('admin.users.accounts')}</span>
      </div>
      {!hasLoadedUsers ? (
        <AdminEmptyState message={t('admin.users.loading')} />
      ) : (
        <div className="admin-data-table">
          <div className="admin-data-row head users">
            <span>User</span>
            <span>Vai trò</span>
            <span>Số dư</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>
          {users.map((user) => (
            <div className="admin-user-row-wrap" key={user.id}>
              <div
                className={`admin-data-row users ${selectedUser?.id === user.id ? 'selected' : ''}`}
                onClick={() => handleSelectUser(user.id)}
              >
                <button type="button" className="admin-row-user" onClick={() => handleSelectUser(user.id)}>
                  <div className="admin-row-user-info">
                    <AdminUserAvatar user={user} />
                    <div className="admin-row-user-text">
                      <strong>{user.name || t('admin.users.detail.noName')}</strong>
                      <small>{user.email}</small>
                    </div>
                  </div>
                </button>
                <span>{getUserRoleLabel(user.role)}</span>
                <span>{formatAdminMoney(user.balance)}</span>
                <span><AdminStatusBadge status={user.status} /></span>
                <span className="admin-row-actions">
                  <button
                    type="button"
                    className="admin-row-menu-button"
                    aria-expanded={openToolbarId === user.id}
                    aria-label={`Mở công cụ quản trị cho ${user.email}`}
                    onClick={(event) => handleToggleToolbar(event, user.id)}
                  >
                    <MoreHorizontal size={18} strokeWidth={2} aria-hidden="true" />
                  </button>

                  {openToolbarId === user.id && (
                    <span className="admin-row-toolbar">
                      <button type="button" onClick={(event) => handleOpenTools(event, user)}>
                        <UserRoundCog size={15} strokeWidth={2} aria-hidden="true" />
                        Công cụ
                      </button>
                      <button type="button" disabled={submitting || user.status === 'ACTIVE'} onClick={(event) => handleUpdateStatus(event, user, 'ACTIVE')}>
                        <Unlock size={15} strokeWidth={2} aria-hidden="true" />
                        Mở
                      </button>
                      <button type="button" className="danger" disabled={submitting || user.status === 'LOCKED'} onClick={(event) => handleUpdateStatus(event, user, 'LOCKED')}>
                        <Lock size={15} strokeWidth={2} aria-hidden="true" />
                        Khóa
                      </button>
                    </span>
                  )}
                </span>
              </div>
            </div>
          ))}
          {users.length === 0 && <AdminEmptyState />}
        </div>
      )}

      <Modal
        isOpen={Boolean(toolsUser)}
        maxWidth="720px"
        onClose={() => setToolsUser(null)}
        showHeader={false}
        variant="editor"
      >
        {toolsUser && (
          <UserAdminTools
            adjustForm={adjustForm}
            bulkStatusForm={bulkStatusForm}
            onAdjustFormChange={onAdjustFormChange}
            onAdjustWallet={onAdjustWallet}
            activeToolTab={activeToolTab}
            onBulkStatusFormChange={onBulkStatusFormChange}
            onRoleFormChange={onRoleFormChange}
            onRunBulkUserStatus={onRunBulkUserStatus}
            onActiveToolTabChange={setActiveToolTab}
            onUpdateRole={onUpdateRole}
            onClose={() => setToolsUser(null)}
            roleForm={roleForm}
            selectedUser={toolsUser}
            submitting={submitting}
          />
        )}
      </Modal>
    </div>
  )
}

export default UserListPanel
