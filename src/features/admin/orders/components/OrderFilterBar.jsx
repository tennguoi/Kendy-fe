import { orderStatuses, orderStatusLabels } from '../orders.constants'

function OrderFilterBar({
  onQueryChange,
  onStatusFilterChange,
  query,
  statusFilter,
}) {
  return (
    <div className="admin-filters">
      <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm mã đơn, dịch vụ, user id" type="search" />
      <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
        {orderStatuses.map((status) => (
          <option value={status} key={status || 'all'}>{orderStatusLabels[status] || status || 'Tất cả trạng thái'}</option>
        ))}
      </select>
    </div>
  )
}

export default OrderFilterBar
