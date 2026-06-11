import { userStatuses } from '../users.constants'

function UsersFilterBar({
  onQueryChange,
  onStatusFilterChange,
  query,
  statusFilter,
}) {
  return (
    <div className="admin-filters">
      <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm tên, email, SĐT" type="search" />
      <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
        {userStatuses.map((status) => (
          <option value={status} key={status || 'all'}>{status || 'Tất cả trạng thái'}</option>
        ))}
      </select>
    </div>
  )
}

export default UsersFilterBar
