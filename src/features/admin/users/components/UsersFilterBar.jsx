import { userStatuses } from '../users.constants'
import SearchField from '../../../../components/SearchField/SearchField'

function UsersFilterBar({
  onQueryChange,
  onStatusFilterChange,
  query,
  statusFilter,
}) {
  return (
    <div className="admin-filters">
      <SearchField value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm tên, email, SĐT" />
      <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
        {userStatuses.map((status) => (
          <option value={status} key={status || 'all'}>{status || 'Tất cả trạng thái'}</option>
        ))}
      </select>
    </div>
  )
}

export default UsersFilterBar
