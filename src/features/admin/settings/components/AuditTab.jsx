import { AdminEmptyState } from '../../AdminShared'
import { formatAdminDate } from '../../adminFormat'

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
        <form className="admin-form compact" onSubmit={loadAuditLogs}>
          <div className="admin-form-grid single">
            <label>
              <span>Từ khóa</span>
              <input value={auditFilter.query} onChange={(event) => onSetAuditFilter((current) => ({ ...current, query: event.target.value }))} />
            </label>
            <label>
              <span>Action</span>
              <input value={auditFilter.action} onChange={(event) => onSetAuditFilter((current) => ({ ...current, action: event.target.value }))} />
            </label>
            <label>
              <span>Admin/User ID</span>
              <input value={auditFilter.adminId} onChange={(event) => onSetAuditFilter((current) => ({ ...current, adminId: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" />
            </label>
            <label>
              <span>Target type</span>
              <input value={auditFilter.targetType} onChange={(event) => onSetAuditFilter((current) => ({ ...current, targetType: event.target.value }))} />
            </label>
            <label>
              <span>Target ID</span>
              <input value={auditFilter.targetId} onChange={(event) => onSetAuditFilter((current) => ({ ...current, targetId: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" />
            </label>
          </div>
          <div className="admin-action-row">
            <button type="submit" disabled={submitting}>Tải audit search</button>
            <button type="button" className="admin-icon-button" disabled={submitting} onClick={loadAuditList}>Audit list</button>
            <button type="button" className="admin-icon-button" disabled={submitting} onClick={loadAdminActions}>Admin actions</button>
          </div>
        </form>
        <div className="admin-mini-list">
          {auditLogs.map((log) => (
            <article key={log.id}>
              <strong>{log.action}</strong>
              <span>{log.actorRole || 'SYSTEM'} #{log.actorUserId || '-'} · {log.targetType || 'TARGET'} #{log.targetId || '-'} · {formatAdminDate(log.createdAt)}</span>
              <button type="button" className="admin-icon-button slim" disabled={submitting} onClick={() => loadAuditDetail(log.id)}>
                Chi tiết
              </button>
            </article>
          ))}
          {auditLogs.length === 0 && <AdminEmptyState message="Chưa tải audit log." />}
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
              <div><dt>Action</dt><dd>{selectedAudit.action}</dd></div>
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
