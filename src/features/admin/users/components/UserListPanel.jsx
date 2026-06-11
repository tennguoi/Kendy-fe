import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminMoney } from '../../adminFormat'

function UserListPanel({
  hasLoadedUsers,
  onSelectUser,
  selectedUser,
  users = [],
}) {
  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>Danh sách user</h3>
        <span>{users.length} tài khoản</span>
      </div>
      {!hasLoadedUsers ? (
        <AdminEmptyState message="Đang tải danh sách user..." />
      ) : (
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
              onClick={() => onSelectUser(user.id)}
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
      )}
    </div>
  )
}

export default UserListPanel
