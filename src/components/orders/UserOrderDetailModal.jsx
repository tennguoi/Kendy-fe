import { Download, ShieldAlert, X } from 'lucide-react'
import { useState } from 'react'
import { money } from '../../utils/currency'
import { printOrderInvoice } from '../../utils/invoicePrint'
import { userApi } from '../../api/user.api'
import StatusBadge from '../status/StatusBadge'

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function safeBlock(value) {
  if (!value) return 'Không có'
  if (typeof value !== 'string') return JSON.stringify(value, null, 2)
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

function UserOrderDetailModal({
  currentUser,
  loading,
  onClose,
  onSetNotice,
  order,
  token,
}) {
  const [showWarrantyForm, setShowWarrantyForm] = useState(false)
  const [warrantyReason, setWarrantyReason] = useState('')
  const [warrantyEvidence, setWarrantyEvidence] = useState('')
  const [warrantySubmitting, setWarrantySubmitting] = useState(false)
  const [warrantySent, setWarrantySent] = useState(false)
  const [warrantyError, setWarrantyError] = useState('')

  if (!order) return null
  const delivery = order.delivery
  const canRequestWarranty = order.status === 'COMPLETED' && delivery?.warrantyUntil
    && new Date(delivery.warrantyUntil) > new Date()

  const handleSubmitWarranty = async (event) => {
    event.preventDefault()
    if (!warrantyReason.trim()) return
    setWarrantySubmitting(true)
    setWarrantyError('')
    try {
      await userApi.createWarranty(order.orderCode || order.code, {
        reason: warrantyReason.trim(),
        evidenceText: warrantyEvidence.trim() || null,
      }, token)
      setWarrantySent(true)
      setShowWarrantyForm(false)
      if (onSetNotice) onSetNotice('Yêu cầu bảo hành đã được gửi.')
    } catch (err) {
      setWarrantyError(err.message || 'Không gửi được yêu cầu bảo hành.')
    } finally {
      setWarrantySubmitting(false)
    }
  }

  return (
    <div className="order-detail-layer" role="presentation">
      <section className="order-detail-modal" role="dialog" aria-modal="true" aria-label="Chi tiết đơn hàng">
        <div className="order-detail-head">
          <div>
            <span>Chi tiết đơn hàng</span>
            <h2>{order.orderCode || order.code}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng chi tiết đơn hàng">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {loading ? (
          <p className="order-detail-loading">Đang tải chi tiết đơn hàng...</p>
        ) : (
          <>
            <div className="invoice-preview-card">
              <div className="invoice-preview-top">
                <div>
                  <span>Biểu mẫu hóa đơn</span>
                  <strong>Kendy Digital</strong>
                </div>
                <button
                  type="button"
                  onClick={() => printOrderInvoice(order, { customer: currentUser })}
                >
                  <Download size={17} />
                  <span>Xuất hóa đơn</span>
                </button>
              </div>

              <div className="invoice-preview-grid">
                <div>
                  <span>Khách hàng</span>
                  <strong>{currentUser?.name || currentUser?.email || 'Khách hàng'}</strong>
                  <small>{currentUser?.email || '-'}</small>
                </div>
                <div>
                  <span>Trạng thái</span>
                  <StatusBadge status={order.status} />
                </div>
                <div>
                  <span>Dịch vụ</span>
                  <strong>{order.serviceName || order.service || '-'}</strong>
                </div>
                <div>
                  <span>Số tiền</span>
                  <strong>{money.format(order.amount)}</strong>
                </div>
              </div>
            </div>

            <dl className="order-detail-list">
              <div><dt>Mã đơn</dt><dd>{order.orderCode || order.code}</dd></div>
              <div><dt>Ngày tạo</dt><dd>{formatDate(order.createdAt)}</dd></div>
              <div><dt>Hạn xử lý</dt><dd>{formatDate(order.processingDeadlineAt)}</dd></div>
              <div><dt>Hoàn thành</dt><dd>{formatDate(order.completedAt)}</dd></div>
            </dl>

            {delivery && (
              <div className="order-detail-block">
                <strong>Thông tin đăng nhập đã giao</strong>
                <dl className="order-detail-list" style={{ marginTop: '10px' }}>
                  <div><dt>Tài khoản</dt><dd>{delivery.loginIdentifier || '-'}</dd></div>
                  <div><dt>Mật khẩu</dt><dd>{delivery.passwordSecret || '-'}</dd></div>
                  <div><dt>Recovery</dt><dd>{delivery.recoveryInfo || '-'}</dd></div>
                  <div><dt>2FA</dt><dd>{delivery.twoFactorSecret || '-'}</dd></div>
                  <div><dt>Đã giao</dt><dd>{formatDate(delivery.deliveredAt)}</dd></div>
                  <div><dt>Hạn tài khoản</dt><dd>{formatDate(delivery.expiresAt)}</dd></div>
                  <div><dt>Bảo hành đến</dt><dd>{formatDate(delivery.warrantyUntil)}</dd></div>
                </dl>
                {delivery.usageNote && <pre>{delivery.usageNote}</pre>}
              </div>
            )}

            {canRequestWarranty && !warrantySent && (
              <div className="order-detail-block">
                {!showWarrantyForm ? (
                  <button
                    type="button"
                    className="order-warranty-button"
                    onClick={() => setShowWarrantyForm(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '10px 16px', background: 'var(--kd-warning-bg, #fff3cd)',
                      color: 'var(--kd-warning-text, #856404)', border: '1px solid var(--kd-warning-border, #ffc107)',
                      borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
                    }}
                  >
                    <ShieldAlert size={18} />
                    <span>Yêu cầu bảo hành / Đổi tài khoản</span>
                  </button>
                ) : (
                  <form onSubmit={handleSubmitWarranty} style={{ display: 'grid', gap: '10px' }}>
                    <strong>Gửi yêu cầu bảo hành</strong>
                    {warrantyError && (
                      <p style={{ color: '#dc3545', fontSize: '13px', margin: 0 }}>{warrantyError}</p>
                    )}
                    <label style={{ display: 'grid', gap: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>Lý do *</span>
                      <textarea
                        value={warrantyReason}
                        onChange={(event) => setWarrantyReason(event.target.value)}
                        placeholder="Mô tả vấn đề: không đăng nhập được, hết hạn, sai thông tin..."
                        rows="3"
                        required
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '14px' }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>Bằng chứng (tuỳ chọn)</span>
                      <textarea
                        value={warrantyEvidence}
                        onChange={(event) => setWarrantyEvidence(event.target.value)}
                        placeholder="Link ảnh chụp lỗi, video, mô tả chi tiết..."
                        rows="2"
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '14px' }}
                      />
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="submit"
                        disabled={warrantySubmitting || !warrantyReason.trim()}
                        style={{
                          padding: '8px 16px', background: 'var(--kd-danger, #dc3545)', color: '#fff',
                          border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500,
                        }}
                      >
                        {warrantySubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowWarrantyForm(false)}
                        style={{
                          padding: '8px 16px', background: 'transparent', color: 'var(--kd-muted)',
                          border: '1px solid var(--kd-border)', borderRadius: '6px', cursor: 'pointer',
                        }}
                      >
                        Huỷ
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {warrantySent && (
              <div className="order-detail-block" style={{ background: '#d4edda', padding: '12px', borderRadius: '8px' }}>
                <strong style={{ color: '#155724' }}>Yêu cầu bảo hành đã được gửi</strong>
                <p style={{ color: '#155724', margin: '4px 0 0', fontSize: '13px' }}>
                  Admin sẽ xem xét và phản hồi trong thời gian sớm nhất.
                </p>
              </div>
            )}

            <div className="order-detail-block">
              <strong>Thông tin đã gửi</strong>
              <pre>{safeBlock(order.inputData)}</pre>
            </div>
            <div className="order-detail-block">
              <strong>Kết quả xử lý</strong>
              <pre>{delivery ? 'Thông tin đăng nhập đã được giao trong mục bên trên.' : safeBlock(order.resultData)}</pre>
            </div>
            <div className="order-detail-block">
              <strong>Ghi chú</strong>
              <pre>{order.userNote || 'Chưa có ghi chú.'}</pre>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default UserOrderDetailModal
