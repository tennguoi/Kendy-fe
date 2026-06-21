import { useTranslation } from 'react-i18next'
import { money } from '../../utils/currency'
import StatusBadge from '../status/StatusBadge'

function RecentTransactions({ onViewChange, transactions = [] }) {
  const { t } = useTranslation()

  return (
    <section className="ledger-panel">
      <div className="section-head">
        <h2>{t('overview.walletTransactions', { defaultValue: 'Giao dịch ví' })}</h2>
        <button type="button" onClick={() => onViewChange?.('orders')}>{t('common.viewAll', { defaultValue: 'Xem tất cả' })}</button>
      </div>
      <div className="ledger-list">
        {transactions.map((transaction) => (
          <article className="ledger-row" key={transaction.code || transaction.transactionCode || transaction.id}>
            <div>
              <strong>{transaction.code || transaction.transactionCode}</strong>
              <span>{transaction.note || transaction.description || transaction.referenceType || transaction.type}</span>
            </div>
            <div>
              <StatusBadge status={transaction.direction} />
              <strong>{money.format(transaction.amount)}</strong>
              <span>{money.format(transaction.balance ?? transaction.balanceAfter)}</span>
            </div>
          </article>
        ))}
        {transactions.length === 0 && (
          <p className="admin-empty-state">{t('overview.noTransactions', { defaultValue: 'Chưa có giao dịch ví.' })}</p>
        )}
      </div>
    </section>
  )
}

export default RecentTransactions
