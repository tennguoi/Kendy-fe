import { money } from '../../utils/currency'
import StatusBadge from '../status/StatusBadge'

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
  onCancelOrder,
  onReorder,
  orders = [],
}) {
  const visibleOrders = compact ? orders.slice(0, 2) : orders

  const handleExportCsv = () => {
    if (orders.length === 0) return
    const csv = rowsToCsv(orders)
    downloadCsv(csv, `don-hang-${new Date().toISOString().slice(0, 10)}.csv`)
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
        {visibleOrders.map((order) => (
          <div className={`table-row ${compact ? '' : 'has-actions'}`} key={order.code || order.orderCode}>
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
              </span>
            )}
          </div>
        ))}
        {visibleOrders.length === 0 && (
          <p className="admin-empty-state">Chưa có đơn hàng.</p>
        )}
      </div>
    </section>
  )
}

export default OrderTable
