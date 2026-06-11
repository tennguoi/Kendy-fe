import { AdminEmptyState } from '../../AdminShared'
import UserAdminTools from './UserAdminTools'
import UserDetailActivity from './UserDetailActivity'
import UserProfileSummary from './UserProfileSummary'

function UserDetailPanel({
  activeDetailTab,
  adjustForm,
  bulkStatusForm,
  detail,
  detailData,
  hasLoadedUsers,
  onActiveDetailTabChange,
  onAdjustFormChange,
  onAdjustWallet,
  onBulkStatusFormChange,
  onRevokeSession,
  onRoleFormChange,
  onRunBulkUserStatus,
  onUpdateRole,
  onUpdateStatus,
  roleForm,
  selectedUser,
  submitting,
}) {
  if (!hasLoadedUsers) {
    return (
      <aside className="admin-panel admin-detail-panel">
        <AdminEmptyState message="Đang tải chi tiết user..." />
      </aside>
    )
  }

  if (!selectedUser) {
    return (
      <aside className="admin-panel admin-detail-panel">
        <AdminEmptyState message="Chọn một user để xem chi tiết." />
      </aside>
    )
  }

  return (
    <aside className="admin-panel admin-detail-panel">
      <UserProfileSummary detail={detail} selectedUser={selectedUser} />

      <UserAdminTools
        adjustForm={adjustForm}
        bulkStatusForm={bulkStatusForm}
        onAdjustFormChange={onAdjustFormChange}
        onAdjustWallet={onAdjustWallet}
        onBulkStatusFormChange={onBulkStatusFormChange}
        onRoleFormChange={onRoleFormChange}
        onRunBulkUserStatus={onRunBulkUserStatus}
        onUpdateRole={onUpdateRole}
        onUpdateStatus={onUpdateStatus}
        roleForm={roleForm}
        selectedUser={selectedUser}
        submitting={submitting}
      />

      <UserDetailActivity
        activeDetailTab={activeDetailTab}
        detailData={detailData}
        onActiveDetailTabChange={onActiveDetailTabChange}
        onRevokeSession={onRevokeSession}
        submitting={submitting}
      />
    </aside>
  )
}

export default UserDetailPanel
