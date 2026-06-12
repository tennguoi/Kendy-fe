import { CreditCard, Wallet, X } from 'lucide-react'
import { money } from '../../../../utils/currency'

function PaymentChoiceModal({
  balance,
  onClose,
  onPayTransfer,
  onPayWallet,
  service,
  submitting,
}) {
  if (!service) {
    return null
  }

  const price = Number(service.price) || 0
  const canUseWallet = balance >= price
  const missingAmount = Math.max(0, price - balance)

  return (
    <div className="payment-modal-layer" role="presentation">
      <section className="payment-modal" role="dialog" aria-modal="true" aria-label="Chọn phương thức thanh toán">
        <div className="payment-modal-head">
          <div>
            <span>Thanh toán dịch vụ</span>
            <h2>{service.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng chọn thanh toán">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="payment-summary">
          <span>Giá dịch vụ</span>
          <strong>{service.priceText || money.format(price)}</strong>
          <small>Số dư ví hiện tại: {money.format(balance)}</small>
        </div>

        <div className="payment-options">
          <button type="button" disabled={!canUseWallet || submitting} onClick={onPayWallet}>
            <Wallet size={20} strokeWidth={2.2} />
            <span>
              <strong>Mua bằng ví</strong>
              <small>{canUseWallet ? 'Trừ trực tiếp từ số dư hiện có.' : `Thiếu ${money.format(missingAmount)} trong ví.`}</small>
            </span>
          </button>
          <button type="button" disabled={submitting} onClick={onPayTransfer}>
            <CreditCard size={20} strokeWidth={2.2} />
            <span>
              <strong>Thanh toán chuyển khoản</strong>
              <small>Tạo mã QR đúng số tiền dịch vụ, không cần nạp thủ công trước.</small>
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}

export default PaymentChoiceModal
