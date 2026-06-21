import { useTranslation } from 'react-i18next'
import { money } from '../../../../utils/currency'
import { quickDepositAmounts } from '../deposit.constants'

function DepositCreatePanel({
  depositAmount,
  onAmountChange,
  onCreateDeposit,
}) {
  const { t } = useTranslation()

  return (
    <div className="deposit-form">
      <h2>{t('deposit.title', { defaultValue: 'Nạp tiền qua chuyển khoản' })}</h2>
      <label>
        {t('deposit.amountLabel', { defaultValue: 'Số tiền' })}
        <input
          value={depositAmount}
          inputMode="text"
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder={t('deposit.amountPlaceholder', { defaultValue: '250k, 500k, 1tr...' })}
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
        {t('deposit.createDeposit', { defaultValue: 'Tạo yêu cầu nạp' })}
      </button>
    </div>
  )
}

export default DepositCreatePanel
