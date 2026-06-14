import { money } from '../../utils/currency'
import { printOrderInvoice } from '../../utils/invoicePrint'
import StatusBadge from '../status/StatusBadge'
import UserOrderDetailModal from './UserOrderDetailModal'
import { useState } from 'react'

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function rowsToCsv(rows) {
  const header = 'Mã đơn,Dịch vụ,Số tiền,Trạng thái,Ngày tạo'
  const body = rows.map((order) => [
    order.code || order.orderCode,
    order.service || order.serviceName,
    order.amount,
    order.status,
    order.createdAt || '',
  ].map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  return `${header}\n${body}`
}

function downloadCsv(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function OrderTable({
  compact = false,
  currentUser,
  detailLoading = false,
  onLoadOrder,
  onCancelOrder,
  onReorder,
  orders = [],
}) {
  const visibleOrders = compact ? orders.slice(0, 2) : orders
  const [selectedOrder, setSelectedOrder] = useState(null)

  const handleExportCsv = () => {
    if (orders.length === 0) return
    const csv = rowsToCsv(orders)
    downloadCsv(csv, `don-hang-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const handleOpenDetail = async (order) => {
    setSelectedOrder(order)
    const detail = await onLoadOrder?.(order)
    if (detail) {
      setSelectedOrder(detail)
    }
  }

  return (
    <section className="table-panel">
      <div className="section-head">
        <h2>Đơn hàng</h2>
        <button type="button" onClick={handleExportCsv}>Xuất CSV</button>
      </div>
      <div className="data-table">
        <div className={`table-row table-head ${compact ? '' : 'has-actions'}`}>
          <span>Mã đơn</span>
          <span>Dịch vụ</span>
          <span>Số tiền</span>
          <span>Trạng thái</span>
          <span>Ngày tạo</span>
          {!compact && <span>Thao tác</span>}
        </div>
        {visibleOrders.map((order, index) => (
          <div className={`table-row ${compact ? '' : 'has-actions'}`} key={order.id || order.orderCode || order.code || `order-${index}`}>
            <strong>{order.code || order.orderCode}</strong>
            <span>{order.service || order.serviceName}</span>
            <span>{money.format(order.amount)}</span>
            <StatusBadge status={order.status} />
            <span>{formatDate(order.createdAt)}</span>
            {!compact && (
              <span className="table-actions">
                <button type="button" disabled={!['PENDING', 'PROCESSING'].includes(order.status)} onClick={() => onCancelOrder?.(order)}>
                  Hủy
                </button>
                <button type="button" onClick={() => onReorder?.(order)}>
                  Mua lại
                </button>
                <button type="button" onClick={() => handleOpenDetail(order)}>
                  Chi tiết
                </button>
                <button type="button" onClick={() => printOrderInvoice(order, { customer: currentUser })}>
                  Hóa đơn
                </button>
              </span>
            )}
          </div>
        ))}
        {visibleOrders.length === 0 && (
          <p className="admin-empty-state">Chưa có đơn hàng.</p>
        )}
      </div>
      <UserOrderDetailModal
        currentUser={currentUser}
        loading={detailLoading}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </section>
  )
}

export default OrderTable
