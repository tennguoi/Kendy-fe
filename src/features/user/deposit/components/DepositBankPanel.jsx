import { useState } from 'react'
import InfoLine from '../../../../components/bank/InfoLine'
import { money } from '../../../../utils/currency'

function DepositBankPanel({
  activeDeposit,
  amountNumber,
  copied,
  onCancelDeposit,
  onCopy,
  onRefreshDeposit,
}) {
  const [zoomQR, setZoomQR] = useState(false)
  const transferContent = activeDeposit?.transferContent || activeDeposit?.depositCode || ''

  return (
    <div className="bank-panel">
      <div className="qr-box real-qr">
        {activeDeposit?.qrImageUrl ? (
          <>
            <img
              alt={`QR nạp ${activeDeposit.depositCode}`}
              src={activeDeposit.qrImageUrl}
              onClick={() => setZoomQR(true)}
              style={{
                cursor: 'zoom-in',
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
            {zoomQR && (
              <div
                onClick={() => setZoomQR(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  cursor: 'zoom-out',
                }}
              >
                <img
                  src={activeDeposit.qrImageUrl}
                  alt="QR phóng to"
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    objectFit: 'contain',
                    borderRadius: 12,
                    boxShadow: '0 0 40px rgba(0,0,0,0.6)',
                  }}
                />
                <button
                  type="button"
                  className="qr-zoom-close"
                  aria-label="Đóng QR phóng to"
                  onClick={(event) => {
                    event.stopPropagation()
                    setZoomQR(false)
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="qr-mark">Tạo yêu cầu nạp để lấy QR</div>
        )}
      </div>

      <div className="bank-lines">
        <InfoLine
          label="Ngân hàng"
          value={activeDeposit?.bankName || 'Chưa tạo'}
          copied={copied}
          onCopy={onCopy}
        />
        <InfoLine
          label="Số tài khoản"
          value={activeDeposit?.bankAccount || 'Chưa tạo'}
          copied={copied}
          onCopy={onCopy}
        />
        <InfoLine
          label="Chủ tài khoản"
          value={activeDeposit?.bankOwner || 'Chưa tạo'}
          copied={copied}
          onCopy={onCopy}
        />
        <InfoLine
          label="Số tiền"
          value={
            activeDeposit
              ? money.format(Number(activeDeposit.amount))
              : money.format(amountNumber)
          }
          copied={copied}
          onCopy={onCopy}
        />
        <InfoLine
          label="Nội dung"
          value={transferContent || 'Chưa tạo'}
          copied={copied}
          onCopy={onCopy}
          strong
        />
        {activeDeposit && (
          <div className="admin-action-row">
            <button
              type="button"
              className="admin-icon-button"
              onClick={() => onRefreshDeposit?.(activeDeposit.depositCode)}
            >
              Kiểm tra trạng thái
            </button>
            <button
              type="button"
              className="admin-danger-button"
              disabled={activeDeposit.status !== 'PENDING'}
              onClick={() => onCancelDeposit?.(activeDeposit)}
            >
              Hủy yêu cầu
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DepositBankPanel
