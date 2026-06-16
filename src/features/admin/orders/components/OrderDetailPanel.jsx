import { Ban, CircleCheck, CircleX, Download, RefreshCw, RotateCcw, Save, UserCheck, ListTodo } from 'lucide-react'
import { useState } from 'react'
import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'
import { safeOrderBlock } from '../orders.utils'
import { printOrderInvoice } from '../../../../utils/invoicePrint'

function OrderDetailPanel({
  activeOrder,
  bulkRefundCodes,
  onBulkRefundCodesChange,
  onRunBulkRefund,
  onRunOrderAction,
  onSaveAdminNote,
  onSaveUserNote,
  onUpdateDraft,
  onUpdateManualWorkflow,
  orderForm,
  refundableOrder,
  selectedOrder,
  submitting,
}) {
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'process' | 'notes' | 'bulk' | 'manual'
  const isManualOrder = selectedOrder?.serviceType === 'MANUAL'

  if (!selectedOrder) {
    return (
      <aside className="admin-panel admin-detail-panel">
        <AdminEmptyState message="Chọn một đơn để xem chi tiết." />
      </aside>
    )
  }

  return (
    <aside className="admin-panel admin-detail-panel">
      <div className="admin-panel-head" style={{ marginBottom: '10px' }}>
        <div>
          <h3>{selectedOrder.orderCode}</h3>
          <span style={{ fontSize: '13px', display: 'block', color: 'var(--kd-muted)' }}>{selectedOrder.serviceName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button type="button" className="admin-icon-button" style={{ height: '34px', minHeight: '34px', fontSize: '13px' }} onClick={() => printOrderInvoice(selectedOrder)}>
            <Download size={16} />
            <span>Hóa đơn</span>
          </button>
          <AdminStatusBadge status={selectedOrder.status} />
        </div>
      </div>

      {/* Internal Tabs for Mobile Optimization */}
      <div className="admin-tabs" style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderBottom: '1px solid var(--kd-border)', paddingBottom: '12px' }}>
        <button
          type="button"
          className={activeTab === 'info' ? 'active' : ''}
          onClick={() => setActiveTab('info')}
          style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
        >
          Thông tin
        </button>
        <button
          type="button"
          className={activeTab === 'process' ? 'active' : ''}
          onClick={() => setActiveTab('process')}
          style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
        >
          Xử lý đơn
        </button>
        <button
          type="button"
          className={activeTab === 'notes' ? 'active' : ''}
          onClick={() => setActiveTab('notes')}
          style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
        >
          Ghi chú
        </button>
        <button
          type="button"
          className={activeTab === 'bulk' ? 'active' : ''}
          onClick={() => setActiveTab('bulk')}
          style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
        >
          Bulk refund
        </button>
        {isManualOrder && (
          <button
            type="button"
            className={activeTab === 'manual' ? 'active' : ''}
            onClick={() => setActiveTab('manual')}
            style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
          >
            Thủ công
          </button>
        )}
      </div>

      <div className="service-editor-sections">
        {activeTab === 'info' && (
          <section className="service-editor-section" style={{ border: 'none', background: 'transparent', padding: 0 }}>
            <dl className="admin-detail-list">
              <div><dt>Dịch vụ</dt><dd>{selectedOrder.serviceName}</dd></div>
              <div><dt>User ID</dt><dd>#{selectedOrder.userId}</dd></div>
              <div><dt>Số tiền</dt><dd>{formatAdminMoney(selectedOrder.amount)}</dd></div>
              <div><dt>Tạo lúc</dt><dd>{formatAdminDate(selectedOrder.createdAt)}</dd></div>
              <div><dt>Hạn xử lý</dt><dd>{formatAdminDate(selectedOrder.processingDeadlineAt)}</dd></div>
              <div><dt>Hoàn thành</dt><dd>{formatAdminDate(selectedOrder.completedAt)}</dd></div>
            </dl>

            {selectedOrder.delivery && (
              <div className="admin-code-block" style={{ marginTop: '12px' }}>
                <strong>Tài khoản đã giao</strong>
                <dl className="admin-detail-list" style={{ marginTop: '10px' }}>
                  <div><dt>Tài khoản</dt><dd>{selectedOrder.delivery.loginIdentifier || '-'}</dd></div>
                  <div><dt>Mật khẩu</dt><dd>{selectedOrder.delivery.passwordSecret || '-'}</dd></div>
                  <div><dt>Recovery</dt><dd>{selectedOrder.delivery.recoveryInfo || '-'}</dd></div>
                  <div><dt>2FA</dt><dd>{selectedOrder.delivery.twoFactorSecret || '-'}</dd></div>
                  <div><dt>Đã giao</dt><dd>{formatAdminDate(selectedOrder.delivery.deliveredAt)}</dd></div>
                  <div><dt>Hết hạn</dt><dd>{formatAdminDate(selectedOrder.delivery.expiresAt)}</dd></div>
                  <div><dt>Bảo hành</dt><dd>{formatAdminDate(selectedOrder.delivery.warrantyUntil)}</dd></div>
                </dl>
                {selectedOrder.delivery.usageNote && <pre>{selectedOrder.delivery.usageNote}</pre>}
              </div>
            )}

            <div className="admin-code-block" style={{ marginTop: '12px' }}>
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
          </section>
        )}

        {activeTab === 'process' && (
          <form className="admin-form compact order-action-form" onSubmit={(event) => event.preventDefault()}>
            <div className="admin-panel-head compact-head" style={{ marginTop: 0 }}>
              <h3>Xử lý đơn hàng</h3>
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
            <div className="admin-action-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button type="button" className="admin-icon-button" style={{ height: '34px', minHeight: '34px', fontSize: '13px' }} disabled={submitting || !activeOrder} onClick={() => onRunOrderAction('complete')}>
                <CircleCheck size={16} />
                <span>Hoàn thành</span>
              </button>
              <button type="button" className="admin-icon-button" style={{ height: '34px', minHeight: '34px', fontSize: '13px' }} disabled={submitting || !activeOrder} onClick={() => onRunOrderAction('fail')}>
                <CircleX size={16} />
                <span>Báo lỗi</span>
              </button>
              <button type="button" className="admin-danger-button slim" style={{ height: '34px', minHeight: '34px', fontSize: '13px' }} disabled={submitting || !activeOrder} onClick={() => onRunOrderAction('cancel')}>
                <Ban size={16} />
                <span>Hủy & hoàn</span>
              </button>
              <button type="button" className="admin-danger-button slim" style={{ height: '34px', minHeight: '34px', fontSize: '13px' }} disabled={submitting || !refundableOrder} onClick={() => onRunOrderAction('refund')}>
                <RotateCcw size={16} />
                <span>Refund</span>
              </button>
              <button type="button" className="admin-icon-button" style={{ height: '34px', minHeight: '34px', fontSize: '13px' }} disabled={submitting || !activeOrder} onClick={() => onRunOrderAction('extend')}>
                <RefreshCw size={16} />
                <span>Gia hạn</span>
              </button>
              <button type="button" className="admin-icon-button" style={{ height: '34px', minHeight: '34px', fontSize: '13px' }} disabled={submitting || selectedOrder.status === 'REFUNDED'} onClick={() => onRunOrderAction('reprocess')}>
                <RotateCcw size={16} />
                <span>Chạy lại</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'notes' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <form className="admin-form compact" onSubmit={onSaveAdminNote}>
              <div className="admin-panel-head compact-head" style={{ marginTop: 0 }}>
                <h3>Ghi chú nội bộ</h3>
                <Save size={18} strokeWidth={2} aria-hidden="true" />
              </div>
              <label>
                <span>Note admin (chỉ admin thấy)</span>
                <textarea
                  value={orderForm.adminNote}
                  onChange={(event) => onUpdateDraft('adminNote', event.target.value)}
                  placeholder="Ghi chú chỉ dành cho quản trị"
                  rows="3"
                  required
                />
              </label>
              <button type="submit" disabled={submitting} className="admin-primary-button" style={{ height: '34px', minHeight: '34px', fontSize: '13px' }}>
                <Save size={16} />
                <span>Lưu note admin</span>
              </button>
            </form>

            <form className="admin-form compact" onSubmit={onSaveUserNote}>
              <div className="admin-panel-head compact-head" style={{ marginTop: 0 }}>
                <h3>Ghi chú cho user</h3>
                <Save size={18} strokeWidth={2} aria-hidden="true" />
              </div>
              <label>
                <span>User note (khách sẽ thấy)</span>
                <textarea
                  value={orderForm.userNote}
                  onChange={(event) => onUpdateDraft('userNote', event.target.value)}
                  placeholder="Ghi chú hiển thị cho khách"
                  rows="3"
                  required
                />
              </label>
              <button type="submit" disabled={submitting} className="admin-primary-button" style={{ height: '34px', minHeight: '34px', fontSize: '13px' }}>
                <Save size={16} />
                <span>Lưu note user</span>
              </button>
            </form>
          </div>
        )}

        {activeTab === 'bulk' && (
          <form className="admin-form compact" onSubmit={onRunBulkRefund}>
            <div className="admin-panel-head compact-head" style={{ marginTop: 0 }}>
              <h3>Bulk refund hàng loạt</h3>
              <RotateCcw size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <label>
              <span>Danh sách mã đơn</span>
              <textarea
                value={bulkRefundCodes}
                onChange={(event) => onBulkRefundCodesChange(event.target.value)}
                placeholder="Nhập nhiều mã đơn, cách nhau bằng dấu phẩy hoặc xuống dòng"
                rows="4"
                required
              />
            </label>
            <div className="admin-action-row" style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="admin-icon-button" style={{ height: '34px', minHeight: '34px', fontSize: '13px' }} onClick={() => onBulkRefundCodesChange(selectedOrder.orderCode)}>
                Sử dụng mã đơn này
              </button>
              <button type="submit" className="admin-danger-button slim" style={{ height: '34px', minHeight: '34px', fontSize: '13px' }} disabled={submitting}>
                Bắt đầu Bulk Refund
              </button>
            </div>
          </form>
        )}

        {activeTab === 'manual' && isManualOrder && (
          <form className="admin-form compact" onSubmit={(event) => { event.preventDefault(); onUpdateManualWorkflow(selectedOrder.orderCode) }}>
            <div className="admin-panel-head compact-head" style={{ marginTop: 0 }}>
              <h3>Xử lý thủ công</h3>
              <ListTodo size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <label>
              <span>Admin ID phụ trách</span>
              <input
                value={orderForm.assignedAdminId || ''}
                onChange={(event) => onUpdateDraft('assignedAdminId', event.target.value)}
                placeholder="Nhập ID admin"
                inputMode="numeric"
              />
            </label>
            <label>
              <span>Hạn xử lý</span>
              <input
                type="datetime-local"
                value={orderForm.processingDeadlineAt || ''}
                onChange={(event) => onUpdateDraft('processingDeadlineAt', event.target.value)}
              />
            </label>
            <label>
              <span>Checklist thao tác (mỗi dòng một bước)</span>
              <textarea
                value={orderForm.manualChecklist || ''}
                onChange={(event) => onUpdateDraft('manualChecklist', event.target.value)}
                placeholder={`1. Kiểm tra thông tin khách hàng\n2. Xác nhận thanh toán\n3. Thực hiện dịch vụ\n4. Báo cáo kết quả`}
                rows="5"
              />
            </label>
            <label>
              <span>Ghi chú admin</span>
              <textarea
                value={orderForm.adminNote || ''}
                onChange={(event) => onUpdateDraft('adminNote', event.target.value)}
                placeholder="Ghi chú nội bộ về tiến trình xử lý"
                rows="3"
              />
            </label>
            <div className="admin-action-row">
              <button type="submit" className="admin-primary-button" style={{ height: '34px', minHeight: '34px', fontSize: '13px' }} disabled={submitting}>
                <Save size={16} />
                <span>Cập nhật workflow</span>
              </button>
            </div>

            {selectedOrder.assignedAdminId && (
              <div className="admin-code-block" style={{ marginTop: '12px' }}>
                <strong><UserCheck size={15} /> Admin đã phân công: #{selectedOrder.assignedAdminId}</strong>
                {selectedOrder.processingDeadlineAt && <p>Hạn: {formatAdminDate(selectedOrder.processingDeadlineAt)}</p>}
                {selectedOrder.manualChecklist && (
                  <>
                    <p>Checklist:</p>
                    <pre>{selectedOrder.manualChecklist}</pre>
                  </>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </aside>
  )
}

export default OrderDetailPanel
