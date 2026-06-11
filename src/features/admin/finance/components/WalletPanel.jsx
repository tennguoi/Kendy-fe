import { AdminEmptyState } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'

function WalletPanel({
  balanceIssues,
  loadBalanceIntegrityReport,
  runBalanceCheck,
  runReconciliation,
  submitting,
  walletTransactions,
  walletType,
  walletTypes,
  setWalletType,
}) {
  return (
    <>
      <div className="admin-filters single-filter">
        <select value={walletType} onChange={(event) => setWalletType(event.target.value)}>
          {walletTypes.map((type) => <option value={type} key={type || 'all'}>{type || 'Tất cả loại ví'}</option>)}
        </select>
      </div>
      <div className="admin-action-row">
        <button type="button" className="admin-icon-button" disabled={submitting} onClick={runBalanceCheck}>Balance check</button>
        <button type="button" className="admin-icon-button" disabled={submitting} onClick={runReconciliation}>Reconciliation preview</button>
        <button type="button" className="admin-icon-button" disabled={submitting} onClick={loadBalanceIntegrityReport}>Balance report</button>
      </div>
      <div className="admin-data-table">
        <div className="admin-data-row head wallet">
          <span>Mã GD</span>
          <span>Loại</span>
          <span>Số tiền</span>
          <span>Số dư sau</span>
          <span>Thời gian</span>
        </div>
        {walletTransactions.map((item) => (
          <div className="admin-data-row wallet" key={item.id}>
            <span>
              <strong>{item.transactionCode}</strong>
              <small>{item.description || item.referenceType}</small>
            </span>
            <span>{item.type} · {item.direction}</span>
            <span>{formatAdminMoney(item.amount)}</span>
            <span>{formatAdminMoney(item.balanceAfter)}</span>
            <span>{formatAdminDate(item.createdAt)}</span>
          </div>
        ))}
        {walletTransactions.length === 0 && <AdminEmptyState />}
      </div>
      <div className="admin-mini-list">
        {balanceIssues.map((issue) => (
          <article key={issue.userId}>
            <strong>{issue.email || `User #${issue.userId}`}</strong>
            <span>Lệch {formatAdminMoney(issue.difference)} · Stored {formatAdminMoney(issue.storedBalance)} · Ledger {formatAdminMoney(issue.ledgerBalance)}</span>
          </article>
        ))}
      </div>
    </>
  )
}

export default WalletPanel
