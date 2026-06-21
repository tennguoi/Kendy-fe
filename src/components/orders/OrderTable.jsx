import { useTranslation } from 'react-i18next'
import { money } from '../../utils/currency'
import { printOrderInvoice } from '../../utils/invoicePrint'
import StatusBadge from '../status/StatusBadge'
import UserOrderDetailModal from './UserOrderDetailModal'
import { useState } from 'react'
import { formatDate } from '../../utils/date'

function rowsToCsv(rows, t) {
  const header = t('orders.csvHeader', { defaultValue: 'Mã đơn,Dịch vụ,Số tiền,Trạng thái,Ngày tạo' })
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
  onSetNotice,
  orders = [],
  token,
}) {
  const { t } = useTranslation()
  const visibleOrders = compact ? orders.slice(0, 2) : orders
  const [selectedOrder, setSelectedOrder] = useState(null)

  const handleExportCsv = () => {
    if (orders.length === 0) return
    const csv = rowsToCsv(orders, t)
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
        <h2>{t('orders.title', { defaultValue: 'Đơn hàng' })}</h2>
        <button type="button" onClick={handleExportCsv}>{t('common.exportCsv', { defaultValue: 'Xuất CSV' })}</button>
      </div>
      <div className="data-table">
        <div className={`table-row table-head ${compact ? '' : 'has-actions'}`}>
          <span>{t('orders.orderCode', { defaultValue: 'Mã đơn' })}</span>
          <span>{t('orders.service', { defaultValue: 'Dịch vụ' })}</span>
          <span>{t('orders.amount', { defaultValue: 'Số tiền' })}</span>
          <span>{t('orders.status', { defaultValue: 'Trạng thái' })}</span>
          <span>{t('orders.createdAt', { defaultValue: 'Ngày tạo' })}</span>
          {!compact && <span>{t('common.actions', { defaultValue: 'Thao tác' })}</span>}
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
                  {t('orders.cancel', { defaultValue: 'Hủy' })}
                </button>
                <button type="button" onClick={() => onReorder?.(order)}>
                  {t('orders.reorder', { defaultValue: 'Mua lại' })}
                </button>
                <button type="button" onClick={() => handleOpenDetail(order)}>
                  {t('orders.detail', { defaultValue: 'Chi tiết' })}
                </button>
                <button type="button" onClick={() => printOrderInvoice(order, { customer: currentUser })}>
                  {t('orders.invoice', { defaultValue: 'Hóa đơn' })}
                </button>
              </span>
            )}
          </div>
        ))}
        {visibleOrders.length === 0 && (
          <p className="admin-empty-state">{t('orders.noOrders', { defaultValue: 'Chưa có đơn hàng.' })}</p>
        )}
      </div>
      <UserOrderDetailModal
        currentUser={currentUser}
        loading={detailLoading}
        onClose={() => setSelectedOrder(null)}
        onSetNotice={onSetNotice}
        order={selectedOrder}
        token={token}
      />
    </section>
  )
}

export default OrderTable
