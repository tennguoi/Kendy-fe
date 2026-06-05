import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminEmptyState, AdminStatusBadge } from './AdminShared'
import { formatAdminDate, formatAdminMoney, includesKeyword } from './adminFormat'

const orderStatuses = ['', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']

function safeBlock(value) {
  if (!value) {
    return 'Chưa có dữ liệu'
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

function AdminOrdersView({ error, loading, onReload, orders }) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  const selectedOrder = orders.find((order) => order.id === selectedId) || orders[0]

  const visibleOrders = useMemo(
    () =>
      orders
        .filter((order) => !statusFilter || order.status === statusFilter)
        .filter((order) => includesKeyword(order, query, ['orderCode', 'serviceName', 'status', 'userId']))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [orders, query, statusFilter],
  )

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">Orders</span>
          <h2>Quản lý đơn hàng</h2>
        </div>
        <button type="button" className="admin-icon-button" onClick={onReload} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {(error || loading) && <p className={error ? 'admin-message error' : 'admin-message'}>{error || 'Đang tải đơn hàng...'}</p>}

      <div className="admin-filters">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã đơn, dịch vụ, user id" type="search" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          {orderStatuses.map((status) => (
            <option value={status} key={status || 'all'}>{status || 'Tất cả trạng thái'}</option>
          ))}
        </select>
      </div>

      <div className="admin-grid detail-layout">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Danh sách đơn</h3>
            <span>{visibleOrders.length} đơn</span>
          </div>
          <div className="admin-data-table">
            <div className="admin-data-row head orders">
              <span>Đơn hàng</span>
              <span>Dịch vụ</span>
              <span>Số tiền</span>
              <span>Trạng thái</span>
              <span>Thời gian</span>
            </div>
            {visibleOrders.map((order) => (
              <button
                type="button"
                className={`admin-data-row orders ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                key={order.id}
                onClick={() => setSelectedId(order.id)}
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
            {visibleOrders.length === 0 && <AdminEmptyState />}
          </div>
        </div>

        <aside className="admin-panel admin-detail-panel">
          <div className="admin-panel-head">
            <h3>{selectedOrder ? selectedOrder.orderCode : 'Chọn đơn'}</h3>
            {selectedOrder && <AdminStatusBadge status={selectedOrder.status} />}
          </div>

          {selectedOrder ? (
            <>
              <dl className="admin-detail-list">
                <div><dt>Dịch vụ</dt><dd>{selectedOrder.serviceName}</dd></div>
                <div><dt>User</dt><dd>#{selectedOrder.userId}</dd></div>
                <div><dt>Số tiền</dt><dd>{formatAdminMoney(selectedOrder.amount)}</dd></div>
                <div><dt>Tạo lúc</dt><dd>{formatAdminDate(selectedOrder.createdAt)}</dd></div>
                <div><dt>Deadline</dt><dd>{formatAdminDate(selectedOrder.processingDeadlineAt)}</dd></div>
                <div><dt>Hoàn thành</dt><dd>{formatAdminDate(selectedOrder.completedAt)}</dd></div>
              </dl>

              <div className="admin-code-block">
                <strong>Input khách gửi</strong>
                <pre>{safeBlock(selectedOrder.inputData)}</pre>
              </div>
              <div className="admin-code-block">
                <strong>Kết quả xử lý</strong>
                <pre>{safeBlock(selectedOrder.resultData)}</pre>
              </div>
              <div className="admin-code-block">
                <strong>Ghi chú admin</strong>
                <pre>{selectedOrder.adminNote || 'Chưa có ghi chú'}</pre>
              </div>
            </>
          ) : (
            <AdminEmptyState message="Chọn một đơn để xem chi tiết." />
          )}
        </aside>
      </div>
    </section>
  )
}

export default AdminOrdersView
