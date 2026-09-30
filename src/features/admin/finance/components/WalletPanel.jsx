import { AdminEmptyState } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'
import { statusLabel } from '../../../../data/statusLabels'
import BaseSelect from '../../../../components/ui/BaseSelect'

function WalletPanel({
  balanceIssues,
  onOpenTools,
  walletTransactions,
  walletType,
  walletTypes,
  setWalletType,
}) {
  return (
    <>
      <div className="admin-filters single-filter">
        <BaseSelect
          value={walletType}
          onChange={(value) => setWalletType(value)}
          options={walletTypes.map((type) => ({
            value: type,
            label: statusLabel[type] || type || 'Tất cả loại ví'
          }))}
          placeholder="Tất cả loại ví"
        />
      </div>
      <div className="admin-action-row">
        <button type="button" className="admin-primary-button" onClick={onOpenTools}>Công cụ đối soát</button>
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
            <span>{statusLabel[item.type] || item.type} · {statusLabel[item.direction] || item.direction}</span>
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
