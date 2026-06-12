import { RotateCcw, Save } from 'lucide-react'
import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate } from '../../adminFormat'

function WebhooksTab({
  onRetryFormChange,
  onSaveSepayConfig,
  onSetSepayConfigText,
  retryForm,
  retryWebhook,
  sepayConfigText,
  sepayLogs,
  sepayStatus,
  submitting,
}) {
  return (
    <div className="admin-grid two-columns">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Webhook status</h3>
          <AdminStatusBadge status={sepayStatus?.requireApiKey ? 'PROTECTED' : 'OPEN'} />
        </div>
        <dl className="admin-detail-list">
          <div><dt>API key</dt><dd>{sepayStatus?.requireApiKey ? 'Bắt buộc' : 'Không bắt buộc'}</dd></div>
          <div><dt>Header</dt><dd>{sepayStatus?.apiKeyHeader || 'Chưa cấu hình'}</dd></div>
          <div><dt>HMAC</dt><dd>{sepayStatus?.requireHmac ? 'Bật' : 'Tắt'}</dd></div>
          <div><dt>Signature</dt><dd>{sepayStatus?.signatureHeader || 'Chưa cấu hình'}</dd></div>
        </dl>
        <label className="admin-form">
          <span>Webhook config JSON</span>
          <textarea value={sepayConfigText} onChange={(event) => onSetSepayConfigText(event.target.value)} rows="10" />
        </label>
        <button type="button" className="admin-primary-button" onClick={onSaveSepayConfig} disabled={submitting}>
          <Save size={17} strokeWidth={2} aria-hidden="true" />
          <span>Lưu config</span>
        </button>
      </div>
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Webhook logs & retry</h3>
        </div>
        <form className="admin-form compact" onSubmit={retryWebhook}>
          <label>
            <span>Bank transaction ID</span>
            <input value={retryForm.bankTransactionId} onChange={(event) => onRetryFormChange({ bankTransactionId: event.target.value.replace(/\D/g, '') })} inputMode="numeric" required />
          </label>
          <label>
            <span>Mã nạp</span>
            <input value={retryForm.depositCode} onChange={(event) => onRetryFormChange({ depositCode: event.target.value })} />
          </label>
          <label>
            <span>Lý do</span>
            <textarea value={retryForm.reason} onChange={(event) => onRetryFormChange({ reason: event.target.value })} rows="3" required />
          </label>
          <button type="submit" disabled={submitting}>
            <RotateCcw size={17} strokeWidth={2} aria-hidden="true" />
            <span>Retry</span>
          </button>
        </form>
        <div className="admin-mini-list">
          {sepayLogs.map((log) => (
            <article key={log.id}>
              <strong>{log.action}</strong>
              <span>{log.metadata || 'Không có metadata'} · {formatAdminDate(log.createdAt)}</span>
            </article>
          ))}
          {sepayLogs.length === 0 && <AdminEmptyState message="Chưa có webhook log." />}
        </div>
      </div>
    </div>
  )
}

export default WebhooksTab
