import { useEffect, useRef } from 'react'
import { AdminEmptyState } from '../../AdminShared'
import { formatAdminDate } from '../../adminFormat'

const actionOptions = [
  ['', 'Tất cả hành động'],
  ['USER_BULK_STATUS_UPDATED', 'Khóa / mở khóa tài khoản'],
  ['ADMIN_ROLE_UPDATED', 'Thay đổi vai trò quản trị'],
  ['ADMIN_PERMISSIONS_UPDATED', 'Thay đổi quyền quản trị'],
  ['SERVICE_CREATED', 'Tạo dịch vụ'],
  ['SERVICE_UPDATED', 'Cập nhật dịch vụ'],
  ['SERVICE_DEACTIVATED', 'Ngừng dịch vụ'],
  ['ACCOUNT_CREDENTIAL_CREATED', 'Nhập một tài khoản vào kho'],
  ['ACCOUNT_CREDENTIAL_BULK_IMPORTED', 'Nhập nhiều tài khoản vào kho'],
  ['ACCOUNT_CREDENTIAL_UPDATED', 'Cập nhật tài khoản trong kho'],
  ['ACCOUNT_CREDENTIAL_REVEALED', 'Xem thông tin đăng nhập trong kho'],
  ['ACCOUNT_CREDENTIAL_DISABLED', 'Vô hiệu hóa tài khoản trong kho'],
  ['ORDER_REPROCESSED', 'Xử lý lại đơn hàng'],
  ['ORDER_EXTENDED', 'Gia hạn đơn hàng'],
  ['TICKET_REPLIED', 'Trả lời ticket'],
  ['TICKET_UPDATED', 'Cập nhật ticket'],
  ['SETTING_UPDATED', 'Thay đổi cài đặt hệ thống'],
  ['SETTINGS_RESTORED', 'Khôi phục cài đặt hệ thống'],
  ['CONTENT_CREATED', 'Tạo nội dung website'],
  ['CONTENT_UPDATED', 'Cập nhật nội dung website'],
  ['CONTENT_DELETED', 'Xóa nội dung website'],
  ['FILE_UPLOADED', 'Tải tệp lên'],
  ['FILE_DELETED', 'Xóa tệp'],
  ['COUPON_CREATED', 'Tạo mã giảm giá'],
  ['COUPON_UPDATED', 'Cập nhật mã giảm giá'],
  ['WARRANTY_REQUEST_REVIEWED', 'Xử lý yêu cầu bảo hành'],
]

const targetOptions = [
  ['', 'Tất cả đối tượng'],
  ['USER', 'Người dùng / quản trị viên'],
  ['SERVICE', 'Dịch vụ'],
  ['SERVICE_CATEGORY', 'Danh mục dịch vụ'],
  ['ACCOUNT_CREDENTIAL', 'Tài khoản trong kho'],
  ['ORDER', 'Đơn hàng'],
  ['TICKET', 'Ticket hỗ trợ'],
  ['SYSTEM_SETTING', 'Cài đặt hệ thống'],
  ['CONTENT_ITEM', 'Nội dung website'],
  ['COUPON', 'Mã giảm giá'],
  ['FILE', 'Tệp tin'],
  ['WARRANTY_REQUEST', 'Yêu cầu bảo hành'],
  ['AUTH_SESSION', 'Phiên đăng nhập'],
  ['JOB', 'Công việc nền'],
]

function actionLabel(action) {
  return actionOptions.find(([value]) => value === action)?.[1] || action
}

function AuditTab({
  auditExportFormat,
  auditFilter,
  auditLogs,
  loadAdminActions,
  loadAuditDetail,
  loadAuditList,
  loadAuditLogs,
  onExportAudit,
  onSetAuditExportFormat,
  onSetAuditFilter,
  selectedAudit,
  submitting,
}) {
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true
      loadAuditList()
    }
  }, [loadAuditList])

  const clearFilters = () => {
    onSetAuditFilter({ action: '', adminId: '', query: '', targetId: '', targetType: '' })
  }

  return (
    <div className="admin-grid two-columns">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Audit logs</h3>
          <div className="admin-action-row">
            <span className="admin-format-toggle">
              <button type="button" className={auditExportFormat === 'csv' ? 'active' : ''} onClick={() => onSetAuditExportFormat('csv')}>CSV</button>
              <button type="button" className={auditExportFormat === 'xlsx' ? 'active' : ''} onClick={() => onSetAuditExportFormat('xlsx')}>XLSX</button>
            </span>
            <button type="button" onClick={onExportAudit} disabled={submitting}>Export</button>
          </div>
        </div>
        <p className="admin-message">
          Không bắt buộc nhập bộ lọc. Chọn một mục nếu cần tìm cụ thể, hoặc để trống để xem toàn bộ lịch sử.
        </p>
        <form className="admin-form compact" onSubmit={loadAuditLogs}>
          <div className="admin-form-grid single">
            <label>
              <span>Tìm kiếm nhanh (không bắt buộc)</span>
              <input
                value={auditFilter.query}
                onChange={(event) => onSetAuditFilter((current) => ({ ...current, query: event.target.value }))}
                placeholder="Email, mã đơn, tên dịch vụ..."
              />
            </label>
            <label>
              <span>Hành động</span>
              <select value={auditFilter.action} onChange={(event) => onSetAuditFilter((current) => ({ ...current, action: event.target.value }))}>
                {actionOptions.map(([value, label]) => <option value={value} key={value || 'all'}>{label}</option>)}
              </select>
            </label>
            <label>
              <span>ID người thực hiện (nâng cao)</span>
              <input
                value={auditFilter.adminId}
                onChange={(event) => onSetAuditFilter((current) => ({ ...current, adminId: event.target.value.replace(/\D/g, '') }))}
                inputMode="numeric"
                placeholder="Để trống nếu không biết"
              />
            </label>
            <label>
              <span>Đối tượng bị thay đổi</span>
              <select value={auditFilter.targetType} onChange={(event) => onSetAuditFilter((current) => ({ ...current, targetType: event.target.value }))}>
                {targetOptions.map(([value, label]) => <option value={value} key={value || 'all'}>{label}</option>)}
              </select>
            </label>
            <label>
              <span>ID đối tượng (nâng cao)</span>
              <input
                value={auditFilter.targetId}
                onChange={(event) => onSetAuditFilter((current) => ({ ...current, targetId: event.target.value.replace(/\D/g, '') }))}
                inputMode="numeric"
                placeholder="Để trống nếu không biết"
              />
            </label>
          </div>
          <div className="admin-action-row">
            <button type="submit" disabled={submitting}>Áp dụng bộ lọc</button>
            <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => { clearFilters(); loadAuditList('') }}>Xem tất cả</button>
            {auditFilter.adminId && (
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={loadAdminActions}>
                Xem riêng người này
              </button>
            )}
          </div>
        </form>
        <div className="admin-mini-list">
          {auditLogs.map((log) => (
            <article key={log.id}>
              <strong>{actionLabel(log.action)}</strong>
              <span>{log.actorRole || 'SYSTEM'} #{log.actorUserId || '-'} · {log.targetType || 'TARGET'} #{log.targetId || '-'} · {formatAdminDate(log.createdAt)}</span>
              <button type="button" className="admin-icon-button slim" disabled={submitting} onClick={() => loadAuditDetail(log.id)}>
                Chi tiết
              </button>
            </article>
          ))}
          {auditLogs.length === 0 && <AdminEmptyState message="Không có lịch sử phù hợp với bộ lọc." />}
        </div>
      </div>
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Audit detail</h3>
          {selectedAudit && <span>#{selectedAudit.id}</span>}
        </div>
        {selectedAudit ? (
          <>
            <dl className="admin-detail-list">
              <div><dt>Hành động</dt><dd>{actionLabel(selectedAudit.action)}</dd></div>
              <div><dt>Mã kỹ thuật</dt><dd>{selectedAudit.action}</dd></div>
              <div><dt>Actor</dt><dd>{selectedAudit.actorRole || '-'} #{selectedAudit.actorUserId || '-'}</dd></div>
              <div><dt>Target</dt><dd>{selectedAudit.targetType || '-'} #{selectedAudit.targetId || '-'}</dd></div>
              <div><dt>Time</dt><dd>{formatAdminDate(selectedAudit.createdAt)}</dd></div>
            </dl>
            <div className="admin-code-block">
              <strong>Metadata</strong>
              <pre>{selectedAudit.metadata || 'Không có metadata'}</pre>
            </div>
          </>
        ) : <AdminEmptyState message="Chọn audit log để xem chi tiết." />}
      </div>
    </div>
  )
}

export default AuditTab
