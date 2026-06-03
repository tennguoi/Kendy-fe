import { mockOrders } from '../../data/mockData'
import { money } from '../../utils/currency'
import StatusBadge from '../status/StatusBadge'

function OrderTable({ compact = false, orders = mockOrders }) {
  const visibleOrders = compact ? orders.slice(0, 2) : orders

  return (
    <section className="table-panel">
      <div className="section-head">
        <h2>Đơn hàng</h2>
        <button type="button">Xuất CSV</button>
      </div>
      <div className="data-table">
        <div className="table-row table-head">
          <span>Mã đơn</span>
          <span>Dịch vụ</span>
          <span>Số tiền</span>
          <span>Trạng thái</span>
          <span>Ngày tạo</span>
        </div>
        {visibleOrders.map((order) => (
          <div className="table-row" key={order.code || order.orderCode}>
            <strong>{order.code || order.orderCode}</strong>
            <span>{order.service || order.serviceName}</span>
            <span>{money.format(order.amount)}</span>
            <StatusBadge status={order.status} />
            <span>{order.createdAt || '-'}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default OrderTable
