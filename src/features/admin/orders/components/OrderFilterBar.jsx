import { useTranslation } from 'react-i18next'
import { orderStatuses, orderStatusLabels } from '../orders.constants'
import SearchField from '../../../../components/SearchField/SearchField'
import BaseSelect from '../../../../components/ui/BaseSelect'

function OrderFilterBar({
  onQueryChange,
  onStatusFilterChange,
  query,
  statusFilter,
}) {
  const { t } = useTranslation()
  return (
    <div className="admin-filters">
      <SearchField
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={t('admin.orders.filter.searchPlaceholder', { defaultValue: 'Tìm mã đơn, dịch vụ, user id' })}
      />
      <BaseSelect
        value={statusFilter}
        onChange={(value) => onStatusFilterChange(value)}
        options={orderStatuses.map((status) => ({
          value: status,
          label: !status
            ? t('admin.orders.filter.allStatus', { defaultValue: 'Tất cả trạng thái' })
            : t(`status.${status}`, { defaultValue: orderStatusLabels[status] || status }),
        }))}
        placeholder={t('admin.orders.filter.allStatus', { defaultValue: 'Tất cả trạng thái' })}
      />
    </div>
  )
}

export default OrderFilterBar
