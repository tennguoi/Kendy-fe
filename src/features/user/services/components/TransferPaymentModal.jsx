import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, X, Loader2, CheckCircle2, AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
import { money } from '../../../../utils/currency'
import '../../services/services.css' // Reuse services.css or add customized styling

function TransferPaymentModal({
  activeCheckout,
  copied,
  onCopy,
  onRefresh,
  onCancel,
  onClose,
}) {
  const { t } = useTranslation()
  const [zoomQR, setZoomQR] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const deposit = activeCheckout?.deposit
  const status = deposit?.status || activeCheckout?.status || 'PENDING'
  const checkoutStatus = String(activeCheckout?.status || '').toUpperCase()
  const normalizedStatus = String(status).toUpperCase()
  const hasOrder = Boolean(activeCheckout?.order)
  const walletCreditedWithoutOrder = checkoutStatus === 'WALLET_CREDITED'

  // Auto-polling when state is PENDING
  useEffect(() => {
    if (!deposit?.depositCode || normalizedStatus !== 'PENDING') {
      return
    }

    const interval = setInterval(() => {
      onRefresh?.(deposit.depositCode)
    }, 5000) // Poll status every 5 seconds

    return () => clearInterval(interval)
  }, [deposit?.depositCode, normalizedStatus, onRefresh])

  if (!activeCheckout || !deposit) {
    return null
  }

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh?.(deposit.depositCode)
    } finally {
      setIsRefreshing(false)
    }
  }

  const transferContent = deposit.transferContent || deposit.depositCode || ''
  const serviceName = activeCheckout.serviceName || t('common.service', { defaultValue: 'Dịch vụ' })
  const amountNumber = Number(deposit.amount) || 0

  return (
    <div className="payment-modal-layer" role="presentation">
      <section className="payment-modal" role="dialog" aria-modal="true" style={{ width: 'min(680px, 100%)' }} aria-label={t('transfer.title', { defaultValue: 'Thanh toán chuyển khoản' })}>
        {/* Header */}
        <div className="payment-modal-head">
          <div>
            <span>{t('transfer.title', { defaultValue: 'Thanh toán chuyển khoản' })}</span>
            <h2 style={{ fontSize: '18px', marginTop: '4px' }}>{serviceName}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={t('transfer.closePayment', { defaultValue: 'Đóng thanh toán' })}>
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body Content */}
        <div className="kd-modal-body" style={{ padding: '20px', display: 'grid', gap: '20px' }}>
          
          {/* Status Alert Banner */}
          {normalizedStatus === 'PENDING' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              color: '#1e40af',
              fontSize: '13.5px'
            }}>
              <Loader2 className="animate-spin" size={18} />
              <span>{t('transfer.waitingMessage', { defaultValue: 'Hệ thống đang chờ giao dịch chuyển khoản. Mã QR sẽ tự nhận diện số tiền và nội dung.' })}</span>
            </div>
          )}

          {walletCreditedWithoutOrder && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              color: '#92400e',
              fontSize: '13.5px'
            }}>
              <AlertCircle size={18} />
              <span>{activeCheckout.statusMessage || t('transfer.walletCreditedMessage', { defaultValue: 'Thanh toán đã được cộng vào ví, nhưng đơn hàng chưa được tạo tự động. Bạn có thể đặt lại bằng số dư ví hoặc liên hệ admin hỗ trợ.' })}</span>
            </div>
          )}

          {normalizedStatus === 'COMPLETED' && !walletCreditedWithoutOrder && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              color: '#166534',
              fontSize: '13.5px'
            }}>
              <CheckCircle2 size={18} />
              <span>{hasOrder ? t('transfer.completedWithOrder', { defaultValue: 'Thanh toán hoàn tất. Đơn hàng của bạn đã được khởi tạo thành công.' }) : t('transfer.completedWithoutOrder', { defaultValue: 'Thanh toán hoàn tất. Hệ thống đang khởi tạo đơn hàng, vui lòng kiểm tra lại trạng thái.' })}</span>
            </div>
          )}

          {normalizedStatus === 'MANUAL_REVIEW' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              color: '#92400e',
              fontSize: '13.5px'
            }}>
              <AlertCircle size={18} />
              <span>{t('transfer.manualReview', { defaultValue: 'Giao dịch lệch số tiền hoặc sai nội dung. Vui lòng liên hệ Admin hỗ trợ xử lý thủ công.' })}</span>
            </div>
          )}

          {normalizedStatus === 'CANCELLED' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              color: '#991b1b',
              fontSize: '13.5px'
            }}>
              <AlertCircle size={18} />
              <span>{t('transfer.cancelled', { defaultValue: 'Yêu cầu thanh toán này đã bị hủy.' })}</span>
            </div>
          )}

          {/* Main layout (QR & Bank details side by side) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            alignItems: 'start'
          }}>
            {/* QR Side */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div 
                style={{
                  width: '180px',
                  height: '180px',
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'zoom-in',
                  position: 'relative'
                }}
                onClick={() => setZoomQR(true)}
              >
                {deposit.qrImageUrl ? (
                  <img 
                    src={deposit.qrImageUrl} 
                    alt={t('transfer.zoomQRAlt', { defaultValue: 'QR phóng to' })} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#94a3b8',
                    fontSize: '13px'
                  }}>
                    {t('transfer.noQR', { defaultValue: 'Không có QR' })}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {t('transfer.zoomQR', { defaultValue: 'Nhấn vào QR để phóng to. Mở app ngân hàng quét mã để thanh toán nhanh.' })}
              </span>
            </div>

            {/* Bank details side */}
            <div style={{ display: 'grid', gap: '10px' }}>
              <DetailRow label={t('transfer.bankName', { defaultValue: 'Ngân hàng' })} value={deposit.bankName} copied={copied} onCopy={onCopy} />
              <DetailRow label={t('transfer.accountNumber', { defaultValue: 'Số tài khoản' })} value={deposit.bankAccount} copied={copied} onCopy={onCopy} />
              <DetailRow label={t('transfer.accountOwner', { defaultValue: 'Chủ tài khoản' })} value={deposit.bankOwner} copied={copied} onCopy={onCopy} />
              <DetailRow label={t('transfer.amount', { defaultValue: 'Số tiền' })} value={money.format(amountNumber)} copied={copied} onCopy={onCopy} highlight />
              <DetailRow label={t('transfer.transferContent', { defaultValue: 'Nội dung ck' })} value={transferContent} copied={copied} onCopy={onCopy} highlight strong />
            </div>
          </div>

          {/* Action Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #edf2f7',
            paddingTop: '16px',
            marginTop: '8px',
            gap: '12px'
          }}>
            <div>
              {normalizedStatus === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => onCancel?.(deposit)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#b91c1c',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  <Trash2 size={16} />
                  {t('transfer.cancelRequest', { defaultValue: 'Hủy yêu cầu' })}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {normalizedStatus === 'PENDING' && (
                <button
                  type="button"
                  disabled={isRefreshing}
                  onClick={handleManualRefresh}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#334155',
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                  {t('transfer.checkStatus', { defaultValue: 'Kiểm tra trạng thái' })}
                </button>
              )}
              
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: normalizedStatus === 'COMPLETED' ? '#2563eb' : '#64748b',
                  color: '#fff',
                  border: '0',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {normalizedStatus === 'COMPLETED' && hasOrder ? t('transfer.closeAndViewOrder', { defaultValue: 'Đóng và Xem đơn hàng' }) : t('transfer.close', { defaultValue: 'Đóng' })}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Large Zoom QR overlay */}
      {zoomQR && deposit.qrImageUrl && (
        <div
          onClick={() => setZoomQR(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'zoom-out',
            padding: '20px',
            backdropFilter: 'blur(4px)'
          }}
        >
          <img
            src={deposit.qrImageUrl}
            alt={t('transfer.zoomQRAlt', { defaultValue: 'QR phóng to' })}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 12,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}
          />
          <button 
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              borderRadius: '999px',
              width: '40px',
              height: '40px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.stopPropagation()
              setZoomQR(false)
            }}
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value, copied, onCopy, highlight = false, strong = false }) {
  const { t } = useTranslation()
  if (!value) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '100px minmax(0, 1fr) auto',
      gap: '12px',
      alignItems: 'center',
      padding: '8px 12px',
      background: highlight ? '#f8fafc' : 'transparent',
      border: highlight ? '1px dashed #cbd5e1' : 'none',
      borderRadius: '8px'
    }}>
      <span style={{ fontSize: '13px', color: '#64748b' }}>{label}</span>
      <span style={{ 
        fontSize: strong ? '15px' : '14px', 
        fontWeight: strong || highlight ? '700' : '500', 
        color: strong ? '#1e3a8a' : '#1e293b',
        wordBreak: 'break-all'
      }}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onCopy?.(label, value)}
        style={{
          border: '0',
          background: 'transparent',
          color: copied === label ? '#166534' : '#2563eb',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          fontWeight: '600'
        }}
      >
        <Copy size={13} />
        {copied === label ? t('common.copied', { defaultValue: 'Đã copy' }) : t('common.copy', { defaultValue: 'Copy' })}
      </button>
    </div>
  )
}

export default TransferPaymentModal
