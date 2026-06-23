import { useTranslation } from 'react-i18next'
import { AdminEmptyState } from '../../AdminShared'
import UserDetailActivity from './UserDetailActivity'
import UserProfileSummary from './UserProfileSummary'

function UserDetailPanel({
  activeDetailTab,
  detail,
  detailData,
  hasLoadedUsers,
  onActiveDetailTabChange,
  onRevokeApiKey,
  onRevokeSession,
  selectedUser,
  submitting,
}) {
  const { t } = useTranslation()
  if (!hasLoadedUsers) {
    return (
      <aside className="admin-panel admin-detail-panel">
        <AdminEmptyState message={t('admin.users.detail.loading')} />
      </aside>
    )
  }

  if (!selectedUser) {
    return (
      <aside className="admin-panel admin-detail-panel">
        <AdminEmptyState message={t('admin.users.detail.empty')} />
      </aside>
    )
  }

  return (
    <aside className="admin-panel admin-detail-panel">
      <UserProfileSummary detail={detail} selectedUser={selectedUser} />

      <UserDetailActivity
        activeDetailTab={activeDetailTab}
        detail={detail}
        detailData={detailData}
        onActiveDetailTabChange={onActiveDetailTabChange}
        onRevokeApiKey={onRevokeApiKey}
        onRevokeSession={onRevokeSession}
        submitting={submitting}
      />
    </aside>
  )
}

export default UserDetailPanel
