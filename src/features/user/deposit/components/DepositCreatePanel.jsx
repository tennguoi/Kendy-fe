import { useTranslation } from 'react-i18next'
import { money } from '../../../../utils/currency'
import { quickDepositAmounts } from '../deposit.constants'
import BaseInput from '../../../../components/ui/BaseInput'
import { isRequired, composeValidators } from '../../../../utils/validation'

// Validation utility for positive numbers
const isPositiveNumber = (value) => {
  if (!value) return { isValid: false, error: 'Vui lòng nhập số tiền' }

  // Remove any non-numeric characters except comma and dot
  const cleaned = value.toString().replace(/[^\d,.]/g, '')

  // Replace comma with dot for decimal parsing
  const normalized = cleaned.replace(/,/g, '.')

  // Parse as float
  const num = parseFloat(normalized)

  if (isNaN(num)) {
    return { isValid: false, error: 'Vui lòng nhập số tiền hợp lệ' }
  }

  if (num <= 0) {
    return { isValid: false, error: 'Số tiền phải lớn hơn 0' }
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
  const validateDepositAmount = composeValidators(isRequired, isPositiveNumber)

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