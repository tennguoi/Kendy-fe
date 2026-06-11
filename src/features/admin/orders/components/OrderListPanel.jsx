import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'

function OrderListPanel({
  onSelectOrder,
  orders = [],
  selectedOrder,
}) {
  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>Danh sách đơn</h3>
        <span>{orders.length} đơn</span>
      </div>
      <div className="admin-data-table">
        <div className="admin-data-row head orders">
          <span>Đơn hàng</span>
          <span>Dịch vụ</span>
          <span>Số tiền</span>
          <span>Trạng thái</span>
          <span>Thời gian</span>
        </div>
        {orders.map((order) => (
          <button
            type="button"
            className={`admin-data-row orders ${selectedOrder?.id === order.id ? 'selected' : ''}`}
            key={order.id}
            onClick={() => onSelectOrder(order.id)}
          >
            <span>
              <strong>{order.orderCode}</strong>
              <small>User #{order.userId}</small>
            </span>
            <span>{order.serviceName}</span>
            <span>{formatAdminMoney(order.amount)}</span>
            <span><AdminStatusBadge status={order.status} /></span>
            <span>{formatAdminDate(order.createdAt)}</span>
          </button>
        ))}
        {orders.length === 0 && <AdminEmptyState />}
      </div>
    </div>
  )
}

export default OrderListPanel
