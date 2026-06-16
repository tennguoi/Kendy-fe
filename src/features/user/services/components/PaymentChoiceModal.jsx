import { CreditCard, Tag, Wallet, X } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { money } from '../../../../utils/currency'

function PaymentChoiceModal({
  balance,
  couponCode,
  couponError,
  couponQuote,
  couponSubmitting,
  onClose,
  onApplyCoupon,
  onCouponChange,
  onPayTransfer,
  onPayWallet,
  service,
  submitting,
}) {
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (service) setFormData({})
  }, [service])

  const schemaObj = useMemo(() => {
    try {
      return service?.inputSchema ? JSON.parse(service.inputSchema) : null
    } catch {
      return null
    }
  }, [service])

  if (!service) {
    return null
  }

  const price = Number(service.price) || 0
  const discountAmount = Number(couponQuote?.discountAmount || 0)
  const payableAmount = Number(couponQuote?.payableAmount || price)
  const canUseWallet = balance >= payableAmount
  const missingAmount = Math.max(0, payableAmount - balance)
  const isAccountStock = service.type === 'ACCOUNT_STOCK'
  const modalTitle = isAccountStock ? 'Mua tài khoản nhận ngay' : 'Đặt dịch vụ thủ công'
  const priceLabel = isAccountStock ? 'Giá tài khoản' : 'Giá dịch vụ'
  const walletAction = isAccountStock ? 'Mua bằng ví' : 'Đặt bằng ví'

  const requiredFields = schemaObj?.required || []
  const isFormValid = requiredFields.every((field) => formData[field] && formData[field].trim() !== '')

  return (
    <div className="payment-modal-layer" role="presentation">
      <section className="payment-modal" role="dialog" aria-modal="true" aria-label="Chọn phương thức thanh toán">
        <div className="payment-modal-head">
          <div>
            <span>{modalTitle}</span>
            <h2>{service.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng chọn thanh toán">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="payment-summary">
          <span>{priceLabel}</span>
          <strong>{service.priceText || money.format(price)}</strong>
          {discountAmount > 0 && (
            <div className="payment-discount-lines">
              <div>
                <small>Mã giảm giá</small>
                <b>-{money.format(discountAmount)}</b>
              </div>
              <div>
                <small>Cần thanh toán</small>
                <b>{money.format(payableAmount)}</b>
              </div>
            </div>
          )}
          <small>Số dư ví hiện tại: {money.format(balance)}</small>
        </div>

        <div className="payment-coupon">
          <label htmlFor="payment-coupon-code">Mã giảm giá</label>
          <div>
            <span aria-hidden="true"><Tag size={16} strokeWidth={2.1} /></span>
            <input
              id="payment-coupon-code"
              value={couponCode}
              onChange={(event) => onCouponChange(event.target.value)}
              placeholder="Nhập coupon"
            />
            <button
              type="button"
              disabled={couponSubmitting || submitting || !couponCode?.trim()}
              onClick={onApplyCoupon}
            >
              Áp dụng
            </button>
          </div>
          {(couponQuote?.valid || couponError) && (
            <small className={couponQuote?.valid ? 'success' : 'error'}>
              {couponQuote?.valid ? `Đã áp dụng ${couponQuote.couponCode}.` : couponError}
            </small>
          )}
        </div>

        {schemaObj && schemaObj.properties && (
          <div className="payment-inputs" style={{ padding: '0 20px 20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#1e293b' }}>Yêu cầu xử lý</h4>
            {Object.entries(schemaObj.properties).map(([key, prop]) => (
              <div key={key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' }}>
                  {prop.label || key} {requiredFields.includes(key) && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <input
                  type={prop.type === 'number' ? 'number' : 'text'}
                  value={formData[key] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={prop.placeholder || `Nhập ${prop.label || key}...`}
                  className="settings-input"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="payment-options">
          <button type="button" disabled={!canUseWallet || submitting || !isFormValid} onClick={() => onPayWallet(formData)}>
            <Wallet size={20} strokeWidth={2.2} />
            <span>
              <strong>{walletAction}</strong>
              <small>{canUseWallet ? (isAccountStock ? 'Trừ ví và giao tài khoản tự động.' : 'Trừ ví và gửi yêu cầu cho admin xử lý.') : `Thiếu ${money.format(missingAmount)} trong ví.`}</small>
            </span>
          </button>
          <button type="button" disabled={submitting || !isFormValid || payableAmount <= 1000} onClick={() => onPayTransfer(formData)}>
            <CreditCard size={20} strokeWidth={2.2} />
            <span>
              <strong>Thanh toán chuyển khoản</strong>
              <small>{payableAmount > 1000 ? 'Tạo mã QR đúng số tiền đơn hàng, không cần nạp thủ công trước.' : 'Số tiền chuyển khoản phải lớn hơn 1.000đ.'}</small>
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}

export default PaymentChoiceModal
