import { UserRoundCog } from 'lucide-react'
import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate } from '../../adminFormat'

function BankDetailPanel({
  onOpenTools,
  selectedBank,
  submitting,
}) {
  if (!selectedBank) {
    return (
      <aside className="admin-panel admin-detail-panel">
        <AdminEmptyState message="Chọn giao dịch bank để xem chi tiết." />
      </aside>
    )
  }

  return (
    <aside className="admin-panel admin-detail-panel">
      <div className="admin-panel-head">
        <h3>Bank #{selectedBank.id}</h3>
        <AdminStatusBadge status={selectedBank.status} />
      </div>
      <dl className="admin-detail-list">
        <div><dt>User khớp</dt><dd>{selectedBank.matchedUserId ? `#${selectedBank.matchedUserId}` : 'Chưa khớp'}</dd></div>
        <div><dt>Deposit</dt><dd>{selectedBank.matchedDepositRequestId ? `#${selectedBank.matchedDepositRequestId}` : 'Chưa có'}</dd></div>
        <div><dt>Review</dt><dd>{selectedBank.reviewReason || 'Không có'}</dd></div>
        <div><dt>Credit</dt><dd>{formatAdminDate(selectedBank.creditedAt)}</dd></div>
      </dl>
      <div className="admin-action-row finance-detail-actions">
        <button type="button" className="admin-primary-button" disabled={submitting} onClick={onOpenTools}>
          <UserRoundCog size={16} strokeWidth={2} aria-hidden="true" />
          <span>Công cụ</span>
        </button>
      </div>
      <div className="admin-code-block">
        <strong>Raw payload</strong>
        <pre>{selectedBank.rawPayload || 'Không có raw payload'}</pre>
      </div>
    </aside>
  )
}

export default BankDetailPanel
