import { AdminEmptyState } from '../../AdminShared'
import UserDetailActivity from './UserDetailActivity'
import UserProfileSummary from './UserProfileSummary'

function UserDetailPanel({
  activeDetailTab,
  detail,
  detailData,
  hasLoadedUsers,
  onActiveDetailTabChange,
  onRevokeSession,
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
