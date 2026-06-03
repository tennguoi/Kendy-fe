import { mockTransactions } from '../../data/mockData'
import { money } from '../../utils/currency'
import StatusBadge from '../status/StatusBadge'

function RecentTransactions({ transactions = mockTransactions }) {
  return (
    <section className="ledger-panel">
      <div className="section-head">
        <h2>Giao dịch ví</h2>
        <button type="button">Xem tất cả</button>
      </div>
      <div className="ledger-list">
        {transactions.map((transaction) => (
          <article className="ledger-row" key={transaction.code}>
            <div>
              <strong>{transaction.code}</strong>
              <span>{transaction.note}</span>
            </div>
            <div>
              <StatusBadge status={transaction.direction} />
              <strong>{money.format(transaction.amount)}</strong>
              <span>{money.format(transaction.balance)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default RecentTransactions
