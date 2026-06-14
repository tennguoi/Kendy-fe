import { Download, X } from 'lucide-react'
import { money } from '../../utils/currency'
import { printOrderInvoice } from '../../utils/invoicePrint'
import StatusBadge from '../status/StatusBadge'

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function safeBlock(value) {
  if (!value) return 'Không có'
  if (typeof value !== 'string') return JSON.stringify(value, null, 2)
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

function UserOrderDetailModal({
  currentUser,
  loading,
  onClose,
  order,
}) {
  if (!order) return null

  return (
    <div className="order-detail-layer" role="presentation">
      <section className="order-detail-modal" role="dialog" aria-modal="true" aria-label="Chi tiết đơn hàng">
        <div className="order-detail-head">
          <div>
            <span>Chi tiết đơn hàng</span>
            <h2>{order.orderCode || order.code}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng chi tiết đơn hàng">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {loading ? (
          <p className="order-detail-loading">Đang tải chi tiết đơn hàng...</p>
        ) : (
          <>
            <div className="invoice-preview-card">
              <div className="invoice-preview-top">
                <div>
                  <span>Biểu mẫu hóa đơn</span>
                  <strong>Kendy Digital</strong>
                </div>
                <button
                  type="button"
                  onClick={() => printOrderInvoice(order, { customer: currentUser })}
                >
                  <Download size={17} />
                  <span>Xuất hóa đơn</span>
                </button>
              </div>

              <div className="invoice-preview-grid">
                <div>
                  <span>Khách hàng</span>
                  <strong>{currentUser?.name || currentUser?.email || 'Khách hàng'}</strong>
                  <small>{currentUser?.email || '-'}</small>
                </div>
                <div>
                  <span>Trạng thái</span>
                  <StatusBadge status={order.status} />
                </div>
                <div>
                  <span>Dịch vụ</span>
                  <strong>{order.serviceName || order.service || '-'}</strong>
                </div>
                <div>
                  <span>Số tiền</span>
                  <strong>{money.format(order.amount)}</strong>
                </div>
              </div>
            </div>

            <dl className="order-detail-list">
              <div><dt>Mã đơn</dt><dd>{order.orderCode || order.code}</dd></div>
              <div><dt>Ngày tạo</dt><dd>{formatDate(order.createdAt)}</dd></div>
              <div><dt>Hạn xử lý</dt><dd>{formatDate(order.processingDeadlineAt)}</dd></div>
              <div><dt>Hoàn thành</dt><dd>{formatDate(order.completedAt)}</dd></div>
            </dl>

            <div className="order-detail-block">
              <strong>Thông tin đã gửi</strong>
              <pre>{safeBlock(order.inputData)}</pre>
            </div>
            <div className="order-detail-block">
              <strong>Kết quả xử lý</strong>
              <pre>{safeBlock(order.resultData)}</pre>
            </div>
            <div className="order-detail-block">
              <strong>Ghi chú</strong>
              <pre>{order.userNote || 'Chưa có ghi chú.'}</pre>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default UserOrderDetailModal
