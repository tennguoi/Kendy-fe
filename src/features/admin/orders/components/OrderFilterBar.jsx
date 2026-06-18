import { orderStatuses, orderStatusLabels } from '../orders.constants'
import SearchField from '../../../../components/SearchField/SearchField'

function OrderFilterBar({
  onQueryChange,
  onStatusFilterChange,
  query,
  statusFilter,
}) {
  return (
    <div className="admin-filters">
      <SearchField value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm mã đơn, dịch vụ, user id" />
      <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
        {orderStatuses.map((status) => (
          <option value={status} key={status || 'all'}>{orderStatusLabels[status] || status || 'Tất cả trạng thái'}</option>
        ))}
      </select>
    </div>
  )
}

export default OrderFilterBar
