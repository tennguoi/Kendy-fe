import { Ban, RotateCcw, Save } from 'lucide-react'
import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'

function BankPanel({
  bankActionForm,
  bankBulkForm,
  bankStatus,
  bankStatuses,
  bankTransactions,
  runBankAction,
  runBulkBankCredit,
  selectedBank,
  selectedBankId,
  setBankActionForm,
  setBankBulkForm,
  setBankStatus,
  setSelectedBankId,
  submitting,
}) {
  return (
    <div className="admin-grid detail-layout">
      <div className="admin-data-table">
        <div className="admin-filters single-filter">
          <select value={bankStatus} onChange={(event) => setBankStatus(event.target.value)}>
            {bankStatuses.map((status) => <option value={status} key={status || 'all'}>{status || 'Tất cả bank status'}</option>)}
          </select>
        </div>
        <div className="admin-data-row head bank">
          <span>Reference</span>
          <span>Số tiền</span>
          <span>Nội dung</span>
          <span>Trạng thái</span>
          <span>Nhận lúc</span>
        </div>
        {bankTransactions.map((item) => (
          <button className={`admin-data-row bank ${selectedBank?.id === item.id ? 'selected' : ''}`} key={item.id} type="button" onClick={() => setSelectedBankId(item.id)}>
            <span>
              <strong>{item.referenceCode || `#${item.id}`}</strong>
              <small>{item.bankName || item.gateway}</small>
            </span>
            <span>{formatAdminMoney(item.transferAmount)}</span>
            <span>{item.content || item.code || 'Không có nội dung'}</span>
            <span><AdminStatusBadge status={item.status} /></span>
            <span>{formatAdminDate(item.receivedAt || item.transactionDate)}</span>
          </button>
        ))}
        {bankTransactions.length === 0 && <AdminEmptyState />}
      </div>
      <aside className="admin-detail-panel inline-detail">
        <div className="admin-panel-head">
          <h3>{selectedBank ? `Bank #${selectedBank.id}` : 'Chọn giao dịch'}</h3>
          {selectedBank && <AdminStatusBadge status={selectedBank.status} />}
        </div>
        {selectedBank ? (
          <>
            <dl className="admin-detail-list">
              <div><dt>User khớp</dt><dd>{selectedBank.matchedUserId ? `#${selectedBank.matchedUserId}` : 'Chưa khớp'}</dd></div>
              <div><dt>Deposit</dt><dd>{selectedBank.matchedDepositRequestId ? `#${selectedBank.matchedDepositRequestId}` : 'Chưa có'}</dd></div>
              <div><dt>Review</dt><dd>{selectedBank.reviewReason || 'Không có'}</dd></div>
              <div><dt>Credit</dt><dd>{formatAdminDate(selectedBank.creditedAt)}</dd></div>
            </dl>
            <form className="admin-form compact" onSubmit={(event) => event.preventDefault()}>
              <label>
                <span>Mã nạp</span>
                <input value={bankActionForm.depositCode} onChange={(event) => setBankActionForm((current) => ({ ...current, depositCode: event.target.value }))} />
              </label>
              <label>
                <span>User ID manual credit</span>
                <input value={bankActionForm.userId} onChange={(event) => setBankActionForm((current) => ({ ...current, userId: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" />
              </label>
              <label>
                <span>Lý do</span>
                <textarea value={bankActionForm.reason} onChange={(event) => setBankActionForm((current) => ({ ...current, reason: event.target.value }))} rows="3" required />
              </label>
              <div className="admin-action-row">
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => runBankAction('match')}>Match</button>
                <button type="button" className="admin-icon-button" disabled={submitting || !bankActionForm.userId} onClick={() => runBankAction('manual-credit')}>Manual credit</button>
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => runBankAction('reprocess')}>
                  <RotateCcw size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Reprocess</span>
                </button>
                <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => runBankAction('ignore')}>
                  <Ban size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Ignore</span>
                </button>
              </div>
            </form>
            <form className="admin-form compact" onSubmit={runBulkBankCredit}>
              <div className="admin-panel-head compact-head">
                <h3>Bulk manual credit</h3>
                <Save size={18} strokeWidth={2} aria-hidden="true" />
              </div>
              <label>
                <span>Bank transaction IDs</span>
                <textarea value={bankBulkForm.ids} onChange={(event) => setBankBulkForm((current) => ({ ...current, ids: event.target.value }))} rows="2" placeholder="VD: 101, 102, 103" />
              </label>
              <label>
                <span>User ID</span>
                <input value={bankBulkForm.userId} onChange={(event) => setBankBulkForm((current) => ({ ...current, userId: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" />
              </label>
              <label>
                <span>Mã nạp</span>
                <input value={bankBulkForm.depositCode} onChange={(event) => setBankBulkForm((current) => ({ ...current, depositCode: event.target.value }))} />
              </label>
              <label>
                <span>Lý do</span>
                <textarea value={bankBulkForm.reason} onChange={(event) => setBankBulkForm((current) => ({ ...current, reason: event.target.value }))} rows="2" />
              </label>
              <button type="button" className="admin-icon-button" onClick={() => setBankBulkForm((current) => ({ ...current, ids: selectedBank ? String(selectedBank.id) : current.ids }))}>
                Dùng giao dịch đang chọn
              </button>
              <button type="submit" disabled={submitting}>Bulk manual credit</button>
            </form>
            <div className="admin-code-block">
              <strong>Raw payload</strong>
              <pre>{selectedBank.rawPayload || 'Không có raw payload'}</pre>
            </div>
          </>
        ) : <AdminEmptyState />}
      </aside>
    </div>
  )
}

export default BankPanel
