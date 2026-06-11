import { Ban, CircleCheck, CircleX, RefreshCw, RotateCcw, Save } from 'lucide-react'
import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'
import { safeOrderBlock } from '../orders.utils'

function OrderDetailPanel({
  activeOrder,
  bulkRefundCodes,
  onBulkRefundCodesChange,
  onRunBulkRefund,
  onRunOrderAction,
  onSaveAdminNote,
  onSaveUserNote,
  onUpdateDraft,
  orderForm,
  refundableOrder,
  selectedOrder,
  submitting,
}) {
  return (
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
            <pre>{safeOrderBlock(selectedOrder.inputData)}</pre>
          </div>
          <div className="admin-code-block">
            <strong>Kết quả xử lý</strong>
            <pre>{safeOrderBlock(selectedOrder.resultData)}</pre>
          </div>
          <div className="admin-code-block">
            <strong>Ghi chú admin</strong>
            <pre>{selectedOrder.adminNote || 'Chưa có ghi chú'}</pre>
          </div>
          <div className="admin-code-block">
            <strong>Ghi chú user</strong>
            <pre>{selectedOrder.userNote || 'Chưa có ghi chú'}</pre>
          </div>

          <form className="admin-form compact order-action-form" onSubmit={(event) => event.preventDefault()}>
            <div className="admin-panel-head compact-head">
              <h3>Xử lý đơn</h3>
              <span>{activeOrder ? 'Đơn còn thao tác' : 'Trạng thái đã khóa'}</span>
            </div>
            <label>
              <span>Kết quả hoặc lý do lỗi</span>
              <textarea
                value={orderForm.resultData}
                onChange={(event) => onUpdateDraft('resultData', event.target.value)}
                placeholder="Nhập kết quả trả khách hoặc mô tả lỗi xử lý"
                rows="4"
              />
            </label>
            <label>
              <span>Lý do hủy/refund</span>
              <textarea
                value={orderForm.reason}
                onChange={(event) => onUpdateDraft('reason', event.target.value)}
                placeholder="Bắt buộc khi hủy đơn hoặc refund"
                rows="3"
              />
            </label>
            <label>
              <span>Số phút gia hạn</span>
              <input
                value={orderForm.minutes}
                onChange={(event) => onUpdateDraft('minutes', event.target.value)}
                inputMode="numeric"
                placeholder="60"
              />
            </label>
            <div className="admin-action-row">
              <button type="button" className="admin-icon-button" disabled={submitting || !activeOrder} onClick={() => onRunOrderAction('complete')}>
                <CircleCheck size={17} strokeWidth={2} aria-hidden="true" />
                <span>Hoàn thành</span>
              </button>
              <button type="button" className="admin-icon-button" disabled={submitting || !activeOrder} onClick={() => onRunOrderAction('fail')}>
                <CircleX size={17} strokeWidth={2} aria-hidden="true" />
                <span>Báo lỗi</span>
              </button>
              <button type="button" className="admin-danger-button" disabled={submitting || !activeOrder} onClick={() => onRunOrderAction('cancel')}>
                <Ban size={17} strokeWidth={2} aria-hidden="true" />
                <span>Hủy & hoàn</span>
              </button>
              <button type="button" className="admin-danger-button" disabled={submitting || !refundableOrder} onClick={() => onRunOrderAction('refund')}>
                <RotateCcw size={17} strokeWidth={2} aria-hidden="true" />
                <span>Refund</span>
              </button>
              <button type="button" className="admin-icon-button" disabled={submitting || !activeOrder} onClick={() => onRunOrderAction('extend')}>
                <RefreshCw size={17} strokeWidth={2} aria-hidden="true" />
                <span>Gia hạn</span>
              </button>
              <button type="button" className="admin-icon-button" disabled={submitting || selectedOrder.status === 'REFUNDED'} onClick={() => onRunOrderAction('reprocess')}>
                <RotateCcw size={17} strokeWidth={2} aria-hidden="true" />
                <span>Chạy lại</span>
              </button>
            </div>
          </form>

          <form className="admin-form compact" onSubmit={onSaveAdminNote}>
            <div className="admin-panel-head compact-head">
              <h3>Ghi chú nội bộ</h3>
              <Save size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <label>
              <span>Note admin</span>
              <textarea
                value={orderForm.adminNote}
                onChange={(event) => onUpdateDraft('adminNote', event.target.value)}
                placeholder="Ghi chú chỉ dành cho quản trị"
                rows="3"
                required
              />
            </label>
            <button type="submit" disabled={submitting}>
              <Save size={17} strokeWidth={2} aria-hidden="true" />
              <span>Lưu note</span>
            </button>
          </form>

          <form className="admin-form compact" onSubmit={onSaveUserNote}>
            <div className="admin-panel-head compact-head">
              <h3>Ghi chú cho user</h3>
              <Save size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <label>
              <span>User note</span>
              <textarea
                value={orderForm.userNote}
                onChange={(event) => onUpdateDraft('userNote', event.target.value)}
                placeholder="Ghi chú hiển thị cho khách"
                rows="3"
                required
              />
            </label>
            <button type="submit" disabled={submitting}>
              <Save size={17} strokeWidth={2} aria-hidden="true" />
              <span>Lưu user note</span>
            </button>
          </form>

          <form className="admin-form compact" onSubmit={onRunBulkRefund}>
            <div className="admin-panel-head compact-head">
              <h3>Bulk refund</h3>
              <RotateCcw size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <label>
              <span>Mã đơn</span>
              <textarea
                value={bulkRefundCodes}
                onChange={(event) => onBulkRefundCodesChange(event.target.value)}
                placeholder="Nhập nhiều mã đơn, cách nhau bằng dấu phẩy hoặc xuống dòng"
                rows="3"
                required
              />
            </label>
            <button type="button" className="admin-icon-button" onClick={() => onBulkRefundCodesChange(selectedOrder.orderCode)}>
              Dùng đơn đang chọn
            </button>
            <button type="submit" className="admin-danger-button" disabled={submitting}>
              Bulk refund
            </button>
          </form>
        </>
      ) : (
        <AdminEmptyState message="Chọn một đơn để xem chi tiết." />
      )}
    </aside>
  )
}

export default OrderDetailPanel
