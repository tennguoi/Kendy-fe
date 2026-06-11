import { Ban, Save } from 'lucide-react'
import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'

function DepositPanel({
  depositActionForm,
  depositStatus,
  depositStatuses,
  deposits,
  runDepositAction,
  selectedDeposit,
  setDepositActionForm,
  setDepositStatus,
  setSelectedDepositCode,
  submitting,
}) {
  return (
    <div className="admin-grid detail-layout">
      <div className="admin-data-table">
        <div className="admin-filters single-filter">
          <select value={depositStatus} onChange={(event) => setDepositStatus(event.target.value)}>
            {depositStatuses.map((status) => <option value={status} key={status || 'all'}>{status || 'Tất cả deposit status'}</option>)}
          </select>
        </div>
        <div className="admin-data-row head deposits">
          <span>Mã nạp</span>
          <span>User</span>
          <span>Số tiền</span>
          <span>Trạng thái</span>
          <span>Hết hạn</span>
        </div>
        {deposits.map((item) => (
          <button className={`admin-data-row deposits ${selectedDeposit?.id === item.id ? 'selected' : ''}`} key={item.id} type="button" onClick={() => setSelectedDepositCode(item.depositCode)}>
            <span>
              <strong>{item.depositCode}</strong>
              <small>{item.transferContent}</small>
            </span>
            <span>#{item.userId}</span>
            <span>{formatAdminMoney(item.amount)}</span>
            <span><AdminStatusBadge status={item.status} /></span>
            <span>{formatAdminDate(item.expiredAt)}</span>
          </button>
        ))}
        {deposits.length === 0 && <AdminEmptyState />}
      </div>
      <aside className="admin-detail-panel inline-detail">
        <div className="admin-panel-head">
          <h3>{selectedDeposit ? selectedDeposit.depositCode : 'Chọn yêu cầu nạp'}</h3>
          {selectedDeposit && <AdminStatusBadge status={selectedDeposit.status} />}
        </div>
        {selectedDeposit ? (
          <>
            <dl className="admin-detail-list">
              <div><dt>Ngân hàng</dt><dd>{selectedDeposit.bankName} · {selectedDeposit.bankAccount}</dd></div>
              <div><dt>Chủ TK</dt><dd>{selectedDeposit.bankOwner}</dd></div>
              <div><dt>Hoàn tất</dt><dd>{formatAdminDate(selectedDeposit.completedAt)}</dd></div>
              <div><dt>Nội dung</dt><dd>{selectedDeposit.transferContent}</dd></div>
            </dl>
            <form className="admin-form compact" onSubmit={(event) => event.preventDefault()}>
              <label>
                <span>Số phút gia hạn</span>
                <input value={depositActionForm.minutes} onChange={(event) => setDepositActionForm((current) => ({ ...current, minutes: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" />
              </label>
              <label>
                <span>Lý do</span>
                <textarea value={depositActionForm.reason} onChange={(event) => setDepositActionForm((current) => ({ ...current, reason: event.target.value }))} rows="3" required />
              </label>
              <div className="admin-action-row">
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => runDepositAction('extend')}>Gia hạn</button>
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => runDepositAction('manual-credit')}>
                  <Save size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Manual credit</span>
                </button>
                <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => runDepositAction('cancel')}>
                  <Ban size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Hủy nạp</span>
                </button>
              </div>
            </form>
          </>
        ) : <AdminEmptyState />}
      </aside>
    </div>
  )
}

export default DepositPanel
