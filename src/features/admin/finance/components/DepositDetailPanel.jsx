import { UserRoundCog } from 'lucide-react'
import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate } from '../../adminFormat'

function DepositDetailPanel({
  onOpenTools,
  selectedDeposit,
  submitting,
}) {
  if (!selectedDeposit) {
    return (
      <aside className="admin-panel admin-detail-panel">
        <AdminEmptyState message="Chọn yêu cầu nạp để xem chi tiết." />
      </aside>
    )
  }

  return (
    <aside className="admin-panel admin-detail-panel">
      <div className="admin-panel-head">
        <h3>{selectedDeposit.depositCode}</h3>
        <AdminStatusBadge status={selectedDeposit.status} />
      </div>
      <dl className="admin-detail-list">
        <div><dt>Ngân hàng</dt><dd>{selectedDeposit.bankName} · {selectedDeposit.bankAccount}</dd></div>
        <div><dt>Chủ TK</dt><dd>{selectedDeposit.bankOwner}</dd></div>
        <div><dt>Hoàn tất</dt><dd>{formatAdminDate(selectedDeposit.completedAt)}</dd></div>
        <div><dt>Nội dung</dt><dd>{selectedDeposit.transferContent}</dd></div>
      </dl>
      <div className="admin-action-row finance-detail-actions">
        <button type="button" className="admin-primary-button" disabled={submitting} onClick={onOpenTools}>
          <UserRoundCog size={16} strokeWidth={2} aria-hidden="true" />
          <span>Công cụ</span>
        </button>
      </div>
    </aside>
  )
}

export default DepositDetailPanel
