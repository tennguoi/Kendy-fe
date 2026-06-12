import { money } from '../../../../utils/currency'
import { quickDepositAmounts } from '../deposit.constants'

function DepositCreatePanel({
  depositAmount,
  onAmountChange,
  onCreateDeposit,
}) {
  return (
    <div className="deposit-form">
      <h2>Nạp tiền qua chuyển khoản</h2>
      <label>
        Số tiền
        <input
          value={depositAmount}
          inputMode="text"
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder="250k, 500k, 1tr..."
        />
      </label>
      <div className="quick-amounts">
        {quickDepositAmounts.map((amount) => (
          <button key={amount} type="button" onClick={() => onAmountChange(String(amount))}>
            {money.format(amount)}
          </button>
        ))}
      </div>
      <button className="primary-button" type="button" onClick={onCreateDeposit}>
        Tạo yêu cầu nạp
      </button>
    </div>
  )
}

export default DepositCreatePanel
