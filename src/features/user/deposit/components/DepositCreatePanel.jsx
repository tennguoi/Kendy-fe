import { useTranslation } from 'react-i18next'
import { money } from '../../../../utils/currency'
import { quickDepositAmounts } from '../deposit.constants'
import BaseInput from '../../../../components/ui/BaseInput'
import { composeValidators, isRequired, validatePositiveNumber, tVal } from '../../../../utils/validation'

// Validation utility for deposit numbers (supports 250k, 500k, 1tr or raw numbers)
const parseAndValidateAmount = (value) => {
  if (!isRequired(value)) return { isValid: false, error: tVal('amountRequired', 'Vui lòng nhập số tiền') }
  const cleaned = value.toString().replace(/[^\d,.]/g, '').replace(/,/g, '.')
  const num = parseFloat(cleaned)
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: tVal('amountPositive', 'Số tiền phải lớn hơn 0') }
  }
  return { isValid: true }
}

function DepositCreatePanel({
  depositAmount,
  onAmountChange,
  onCreateDeposit,
}) {
  const { t } = useTranslation()

  // Create validator for deposit amount
  const validateDepositAmount = parseAndValidateAmount

  return (
    <div className="deposit-form">
      <h2>{t('deposit.title', { defaultValue: 'Nạp tiền qua chuyển khoản' })}</h2>
      <BaseInput
        label={t('deposit.amountLabel', { defaultValue: 'Số tiền' })}
        value={depositAmount}
        onChange={onAmountChange}
        validators={[validateDepositAmount]}
        errorMessage={t('deposit.amountInvalid', { defaultValue: 'Vui lòng nhập số tiền hợp lệ' })}
        inputMode="text"
        placeholder={t('deposit.amountPlaceholder', { defaultValue: '250k, 500k, 1tr...' })}
      />
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