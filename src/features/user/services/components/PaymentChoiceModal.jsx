import { CreditCard, Wallet, X } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { money } from '../../../../utils/currency'

function PaymentChoiceModal({
  balance,
  onClose,
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
  const canUseWallet = balance >= price
  const missingAmount = Math.max(0, price - balance)

  const requiredFields = schemaObj?.required || []
  const isFormValid = requiredFields.every((field) => formData[field] && formData[field].trim() !== '')

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

        {schemaObj && schemaObj.properties && (
          <div className="payment-inputs" style={{ padding: '0 20px 20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#1e293b' }}>Thông tin cần cung cấp:</h4>
            {Object.entries(schemaObj.properties).map(([key, prop]) => (
              <div key={key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' }}>
                  {key} {requiredFields.includes(key) && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <input
                  type={prop.type === 'number' ? 'number' : 'text'}
                  value={formData[key] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={`Nhập ${key}...`}
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
              <strong>Mua bằng ví</strong>
              <small>{canUseWallet ? 'Trừ trực tiếp từ số dư hiện có.' : `Thiếu ${money.format(missingAmount)} trong ví.`}</small>
            </span>
          </button>
          <button type="button" disabled={submitting || !isFormValid} onClick={() => onPayTransfer(formData)}>
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
