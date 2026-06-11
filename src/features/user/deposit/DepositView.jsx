import DepositBankPanel from './components/DepositBankPanel'
import DepositCreatePanel from './components/DepositCreatePanel'
import DepositHistoryTable from './components/DepositHistoryTable'

function DepositView({
  activeDeposit,
  amountNumber,
  copied,
  depositAmount,
  deposits = [],
  onAmountChange,
  onCancelDeposit,
  onCopy,
  onCreateDeposit,
  onFiltersChange,
  onRefreshDeposit,
}) {
  return (
    <div className="admin-view">
      <section className="deposit-tool">
        <DepositCreatePanel
          depositAmount={depositAmount}
          onAmountChange={onAmountChange}
          onCreateDeposit={onCreateDeposit}
        />
        <DepositBankPanel
          activeDeposit={activeDeposit}
          amountNumber={amountNumber}
          copied={copied}
          onCancelDeposit={onCancelDeposit}
          onCopy={onCopy}
          onRefreshDeposit={onRefreshDeposit}
        />
      </section>

      <DepositHistoryTable
        deposits={deposits}
        onFiltersChange={onFiltersChange}
        onRefreshDeposit={onRefreshDeposit}
      />
    </div>
  )
}

export default DepositView
