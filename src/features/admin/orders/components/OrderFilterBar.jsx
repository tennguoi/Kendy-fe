import { orderStatuses, orderStatusLabels } from '../orders.constants'
import SearchField from '../../../../components/SearchField/SearchField'
import BaseSelect from '../../../../components/ui/BaseSelect'

function OrderFilterBar({
  onQueryChange,
  onStatusFilterChange,
  query,
  statusFilter,
}) {
  return (
    <div className="admin-filters">
      <SearchField value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm mã đơn, dịch vụ, user id" />
      <BaseSelect
        value={statusFilter}
        onChange={(value) => onStatusFilterChange(value)}
        options={orderStatuses.map((status) => ({
          value: status,
          label: orderStatusLabels[status] || status || 'Tất cả trạng thái'
        }))}
        placeholder="Tất cả trạng thái"
      />
    </div>
  )
}

export default OrderFilterBar