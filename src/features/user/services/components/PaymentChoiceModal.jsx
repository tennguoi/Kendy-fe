import { CreditCard, Tag, Wallet, X } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
  const hasValidCoupon = couponQuote?.valid === true
  const discountAmount = hasValidCoupon ? Number(couponQuote.discountAmount) || 0 : 0
  const quotedPayableAmount = Number(couponQuote?.payableAmount)
  const payableAmount = hasValidCoupon && Number.isFinite(quotedPayableAmount)
    ? quotedPayableAmount
    : price
  const canUseWallet = balance >= payableAmount
  const missingAmount = Math.max(0, payableAmount - balance)
  const isAccountStock = service.type === 'ACCOUNT_STOCK'
  const modalTitle = isAccountStock
    ? t('checkout.buyAccountTitle', { defaultValue: 'Mua tài khoản nhận ngay' })
    : t('checkout.orderServiceTitle', { defaultValue: 'Đặt dịch vụ thủ công' })
  const priceLabel = isAccountStock
    ? t('checkout.accountPrice', { defaultValue: 'Giá tài khoản' })
    : t('checkout.servicePrice', { defaultValue: 'Giá dịch vụ' })
  const walletAction = isAccountStock
    ? t('checkout.buyWithWallet', { defaultValue: 'Mua bằng ví' })
    : t('checkout.orderWithWallet', { defaultValue: 'Đặt bằng ví' })

  const requiredFields = schemaObj?.required || []
  const isFormValid = requiredFields.every((field) => formData[field] && formData[field].trim() !== '')

  return (
    <div className="payment-modal-layer" role="presentation">
      <section className="payment-modal" role="dialog" aria-modal="true" aria-label={t('checkout.selectPayment', { defaultValue: 'Chọn phương thức thanh toán' })}>
        <div className="payment-modal-head">
          <div>
            <span>{modalTitle}</span>
            <h2>{service.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={t('checkout.closePayment', { defaultValue: 'Đóng chọn thanh toán' })}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="payment-summary">
          <span>{priceLabel}</span>
          <strong>{service.priceText || money.format(price)}</strong>
          {discountAmount > 0 && (
            <div className="payment-discount-lines">
              <div>
                <small>{t('checkout.discountCode', { defaultValue: 'Mã giảm giá' })}</small>
                <b>-{money.format(discountAmount)}</b>
              </div>
              <div>
                <small>{t('checkout.needToPay', { defaultValue: 'Cần thanh toán' })}</small>
                <b>{money.format(payableAmount)}</b>
              </div>
            </div>
          )}
          <small>{t('checkout.currentBalance', { amount: money.format(balance), defaultValue: 'Số dư ví hiện tại: {{amount}}' })}</small>
        </div>

        <div className="payment-coupon">
          <label htmlFor="payment-coupon-code">{t('checkout.discountCode', { defaultValue: 'Mã giảm giá' })}</label>
          <div>
            <span aria-hidden="true"><Tag size={16} strokeWidth={2.1} /></span>
            <input
              id="payment-coupon-code"
              value={couponCode}
              onChange={(event) => onCouponChange(event.target.value)}
              placeholder={t('checkout.couponPlaceholder', { defaultValue: 'Nhập coupon' })}
            />
            <button
              type="button"
              disabled={couponSubmitting || submitting || !couponCode?.trim()}
              onClick={onApplyCoupon}
            >
              {t('checkout.couponApply', { defaultValue: 'Áp dụng' })}
            </button>
          </div>
          {(couponQuote?.valid || couponError) && (
            <small className={couponQuote?.valid ? 'success' : 'error'}>
              {couponQuote?.valid ? t('checkout.couponApplied', { code: couponQuote.couponCode, defaultValue: 'Đã áp dụng {{code}}.' }) : couponError}
            </small>
          )}
        </div>

        {schemaObj && schemaObj.properties && (
          <div className="payment-inputs" style={{ padding: '0 20px 20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--kd-text)' }}>{t('checkout.inputRequirements', { defaultValue: 'Yêu cầu xử lý' })}</h4>
            {Object.entries(schemaObj.properties).map(([key, prop]) => (
              <div key={key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--kd-muted)' }}>
                  {prop.label || key} {requiredFields.includes(key) && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <input
                  type={prop.type === 'number' ? 'number' : 'text'}
                  value={formData[key] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={prop.placeholder || t('checkout.inputPlaceholder', { label: prop.label || key, defaultValue: 'Nhập {{label}}...' })}
                  className="settings-input"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--kd-border)', borderRadius: '8px', fontSize: '14px', background: 'var(--kd-card)', color: 'var(--kd-text)' }}
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
              <small>
                {canUseWallet
                  ? (isAccountStock
                      ? t('checkout.walletDeductAuto', { defaultValue: 'Trừ ví và giao tài khoản tự động.' })
                      : t('checkout.walletDeductManual', { defaultValue: 'Trừ ví và gửi yêu cầu cho admin xử lý.' }))
                  : t('checkout.walletInsufficient', { amount: money.format(missingAmount), defaultValue: 'Thiếu {{amount}} trong ví.' })
                }
              </small>
            </span>
          </button>
          <button type="button" disabled={submitting || !isFormValid || payableAmount <= 1000} onClick={() => onPayTransfer(formData)}>
            <CreditCard size={20} strokeWidth={2.2} />
            <span>
              <strong>{t('checkout.payByTransfer', { defaultValue: 'Thanh toán chuyển khoản' })}</strong>
              <small>
                {payableAmount > 1000
                  ? t('checkout.transferQRNote', { defaultValue: 'Tạo mã QR đúng số tiền đơn hàng, không cần nạp thủ công trước.' })
                  : t('checkout.transferMinAmount', { defaultValue: 'Số tiền chuyển khoản phải lớn hơn 1.000đ.' })
                }
              </small>
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}

export default PaymentChoiceModal
