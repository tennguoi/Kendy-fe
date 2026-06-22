import { useTranslation } from 'react-i18next'
import { Eye, ReceiptText, RotateCcw, XCircle } from 'lucide-react'
import { money } from '../../utils/currency'
import { printOrderInvoice } from '../../utils/invoicePrint'
import StatusBadge from '../status/StatusBadge'
import UserOrderDetailModal from './UserOrderDetailModal'
import ConfirmModal from '../Modal/ConfirmModal'
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
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function parseInputData(inputData) {
  if (!inputData) return ''
  try {
    const parsed = JSON.parse(inputData)
    return parsed.email || parsed.username || parsed.account || Object.values(parsed)[0] || inputData
  } catch {
    return inputData
  }
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
  const [reorderTarget, setReorderTarget] = useState(null)

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

  const handleReorderClick = (order) => {
    setReorderTarget(order)
  }

  const handleReorderConfirm = () => {
    if (!reorderTarget) return
    onReorder?.(reorderTarget)
    setReorderTarget(null)
  }

  const canReorder = (order) =>
    ['COMPLETED', 'CANCELLED', 'FAILED', 'REFUNDED'].includes(order.status)

  const reorderTargetAccount = reorderTarget ? parseInputData(reorderTarget.inputData) : ''

  return (
    <section className="table-panel">
      <div className="section-head">
        <div className="order-history-heading">
          <h2>{t('orders.title', { defaultValue: 'Lịch sử đơn hàng' })}</h2>
          {!compact && <p>Hóa đơn và trạng thái thanh toán. Quyền truy cập được quản lý tại “Dịch vụ của tôi”.</p>}
        </div>
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
                <button type="button" className="order-action-button danger" disabled={!['PENDING', 'PROCESSING'].includes(order.status)} onClick={() => onCancelOrder?.(order)} title={t('orders.cancel', { defaultValue: 'Hủy' })} aria-label={t('orders.cancel', { defaultValue: 'Hủy' })}>
                  <XCircle size={16} />
                </button>
                <button type="button" className="order-action-button" onClick={() => handleOpenDetail(order)} title={t('orders.detail', { defaultValue: 'Chi tiết' })} aria-label={t('orders.detail', { defaultValue: 'Chi tiết' })}>
                  <Eye size={16} />
                </button>
                <button type="button" className="order-action-button" onClick={() => printOrderInvoice(order, { customer: currentUser })} title={t('orders.invoice', { defaultValue: 'Hóa đơn' })} aria-label={t('orders.invoice', { defaultValue: 'Hóa đơn' })}>
                  <ReceiptText size={16} />
                </button>
                {canReorder(order) && (
                  <button type="button" className="order-action-button" onClick={() => handleReorderClick(order)} title={t('orders.reorder', { defaultValue: 'Mua lại' })} aria-label={t('orders.reorder', { defaultValue: 'Mua lại' })}>
                    <RotateCcw size={16} />
                  </button>
                )}
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

      <ConfirmModal
        isOpen={!!reorderTarget}
        onClose={() => setReorderTarget(null)}
        onConfirm={handleReorderConfirm}
        title={t('orders.reorderConfirmTitle', { defaultValue: 'Xác nhận mua lại' })}
        message={reorderTarget
          ? t('orders.reorderConfirmMessage', {
              serviceName: reorderTarget.serviceName || reorderTarget.service || '',
              accountInfo: reorderTargetAccount,
              defaultValue: 'Gửi yêu cầu mua lại {{serviceName}} cho tài khoản {{accountInfo}}? Tài khoản hiện tại sẽ được giữ nguyên.'
            })
          : ''}
        confirmText={t('common.confirm', { defaultValue: 'Có' })}
        cancelText={t('common.cancel', { defaultValue: 'Không' })}
        variant="primary"
      />
    </section>
  )
}

export default OrderTable
