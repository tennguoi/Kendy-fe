import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'
import { getUserRoleLabel } from '../users.constants'

function getUserAvatarUrl(user) {
  return user?.avatarUrl || user?.avatar || user?.picture || user?.imageUrl || user?.photoUrl || ''
}

function getUserInitial(user) {
  return (user?.name || user?.email || 'U').charAt(0).toUpperCase()
}

function UserProfileAvatar({ user }) {
  const [failed, setFailed] = useState(false)
  const avatarUrl = getUserAvatarUrl(user)

  if (avatarUrl && !failed) {
    return (
      <img
        className="admin-user-avatar image large"
        src={avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    )
  }

  return <div className="admin-user-avatar large">{getUserInitial(user)}</div>
}

function UserProfileSummary({ detail, selectedUser }) {
  const { t } = useTranslation()
  const profileUser = detail?.user || selectedUser

  return (
    <>
      <div className="admin-panel-head">
        <div className="admin-user-profile-title">
          <UserProfileAvatar user={profileUser} />
          <h3>{selectedUser ? selectedUser.name || selectedUser.email : t('admin.users.detail.empty')}</h3>
        </div>
        {selectedUser && <AdminStatusBadge status={selectedUser.status} />}
      </div>

      <dl className="admin-detail-list">
        <div><dt>Email</dt><dd>{selectedUser.email}</dd></div>
        <div><dt>{t('admin.users.detail.phone')}</dt><dd>{selectedUser.phone || t('admin.users.detail.noPhone')}</dd></div>
        <div><dt>Vai trò</dt><dd>{getUserRoleLabel(selectedUser.role)}</dd></div>
        <div><dt>Số dư</dt><dd>{formatAdminMoney(selectedUser.balance)}</dd></div>
        <div><dt>2FA</dt><dd>{selectedUser.twoFactorEnabled ? t('admin.users.detail.twoFAEnabled') : t('admin.users.detail.twoFADisabled')}</dd></div>
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
    </>
  )
}

export default UserProfileSummary
