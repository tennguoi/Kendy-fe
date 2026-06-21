import { useTranslation } from 'react-i18next'
import { userStatuses } from '../users.constants'
import SearchField from '../../../../components/SearchField/SearchField'

function UsersFilterBar({
  onQueryChange,
  onStatusFilterChange,
  query,
  statusFilter,
}) {
  const { t } = useTranslation()
  return (
    <div className="admin-filters">
      <SearchField value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={t('admin.users.filter.searchPlaceholder')} />
      <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
        {userStatuses.map((status) => (
          <option value={status} key={status || 'all'}>{status || t('admin.users.filter.allStatus')}</option>
        ))}
      </select>
    </div>
  )
}

export default UsersFilterBar
