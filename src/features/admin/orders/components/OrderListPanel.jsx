import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'
import { getManualWorkflowStatusLabel } from '../orders.constants'

function manualDeadlineLabel(order) {
  if (order.serviceType !== 'MANUAL' || !order.processingDeadlineAt || !['PENDING_PAYMENT', 'PROCESSING'].includes(order.status)) {
    return ''
  }
  const deadline = new Date(order.processingDeadlineAt).getTime()
  if (Number.isNaN(deadline)) return ''
  const remaining = deadline - Date.now()
  if (remaining <= 0) return 'Quá hạn'
  if (remaining <= 30 * 60_000) return 'Sắp quá hạn'
  return `Hạn ${formatAdminDate(order.processingDeadlineAt)}`
}

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
              {order.serviceType === 'MANUAL' && (
                <small>{order.assignedAdminName ? `Admin: ${order.assignedAdminName}` : 'Chưa gán admin'}</small>
              )}
            </span>
            <span>
              {order.serviceName}
              {order.serviceType === 'MANUAL' && (
                <small>{getManualWorkflowStatusLabel(order.manualWorkflowStatus)}</small>
              )}
            </span>
            <span>{formatAdminMoney(order.amount)}</span>
            <span><AdminStatusBadge status={order.status} /></span>
            <span>
              {formatAdminDate(order.createdAt)}
              {manualDeadlineLabel(order) && <small>{manualDeadlineLabel(order)}</small>}
            </span>
          </button>
        ))}
        {orders.length === 0 && <AdminEmptyState />}
      </div>
    </div>
  )
}

export default OrderListPanel
