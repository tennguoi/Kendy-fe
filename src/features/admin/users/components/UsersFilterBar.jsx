import { useTranslation } from 'react-i18next'
import { userStatuses, getUserStatusLabel } from '../users.constants'
import SearchField from '../../../../components/SearchField/SearchField'
import BaseSelect from '../../../../components/ui/BaseSelect'

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
      <BaseSelect
        value={statusFilter}
        onChange={(value) => onStatusFilterChange(value)}
        options={userStatuses.map((status) => ({
          value: status,
          label: !status
            ? t('admin.users.filter.allStatus')
            : t(`admin.users.status.${status}`, { defaultValue: getUserStatusLabel(status) }),
        }))}
        placeholder={t('admin.users.filter.allStatus')}
      />
    </div>
  )
}

export default UsersFilterBar
