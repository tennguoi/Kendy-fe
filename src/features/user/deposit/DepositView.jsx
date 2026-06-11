import InfoLine from '../../../components/bank/InfoLine'
import StatusBadge from '../../../components/status/StatusBadge'
import { money } from '../../../utils/currency'

const quickAmounts = [5000, 10000, 100000, 250000, 500000, 1000000]

function formatDate(value) {
  if (!value) {
    return 'Chưa có'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function DepositView({
  activeDeposit,
  amountNumber,
  copied,
  depositAmount,
  deposits = [],
  onAmountChange,
  onCancelDeposit,
  onCopy,
  onCreateDeposit,
  onRefreshDeposit,
}) {
  const transferContent = activeDeposit?.transferContent || activeDeposit?.depositCode || ''

  return (
    <div className="admin-view">
      <section className="deposit-tool">
        <div className="deposit-form">
          <span className="eyebrow">Tạo mã nạp</span>
          <h2>Nạp tiền qua chuyển khoản</h2>
          <label>
            Số tiền
            <input
              value={depositAmount}
              inputMode="text"
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="250k, 500k, 1tr..."
            />
          </label>
          <div className="quick-amounts">
            {quickAmounts.map((amount) => (
              <button key={amount} type="button" onClick={() => onAmountChange(String(amount))}>
                {money.format(amount)}
              </button>
            ))}
          </div>
          <button className="primary-button" type="button" onClick={onCreateDeposit}>
            Tạo yêu cầu nạp
          </button>
        </div>

        <div className="bank-panel">
          <div className="qr-box real-qr">
            {activeDeposit?.qrImageUrl ? (
              <img alt={`QR nạp ${activeDeposit.depositCode}`} src={activeDeposit.qrImageUrl} />
            ) : (
              <div className="qr-mark">Tạo yêu cầu nạp để lấy QR</div>
            )}
          </div>
          <div className="bank-lines">
            <InfoLine label="Ngân hàng" value={activeDeposit?.bankName || 'Chưa tạo'} copied={copied} onCopy={onCopy} />
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
              value={activeDeposit ? money.format(Number(activeDeposit.amount)) : money.format(amountNumber)}
              copied={copied}
              onCopy={onCopy}
            />
            <InfoLine label="Nội dung" value={transferContent || 'Chưa tạo'} copied={copied} onCopy={onCopy} strong />
            {activeDeposit && (
              <div className="admin-action-row">
                <button type="button" className="admin-icon-button" onClick={() => onRefreshDeposit?.(activeDeposit.depositCode)}>
                  Kiểm tra trạng thái
                </button>
                <button type="button" className="admin-danger-button" disabled={activeDeposit.status !== 'PENDING'} onClick={() => onCancelDeposit?.(activeDeposit)}>
                  Hủy yêu cầu
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="table-panel">
        <div className="section-head">
          <h2>Lịch sử nạp tiền</h2>
          <button type="button" onClick={() => onRefreshDeposit?.()}>Tải lại</button>
        </div>
        <div className="data-table">
          <div className="deposit-row table-head">
            <span>Mã nạp</span>
            <span>Số tiền</span>
            <span>Trạng thái</span>
            <span>Hết hạn</span>
            <span>Hoàn tất</span>
          </div>
          {deposits.map((deposit) => (
            <button className="deposit-row" key={deposit.depositCode} type="button" onClick={() => onRefreshDeposit?.(deposit.depositCode)}>
              <strong>{deposit.depositCode}</strong>
              <span>{money.format(deposit.amount)}</span>
              <StatusBadge status={deposit.status} />
              <span>{formatDate(deposit.expiredAt)}</span>
              <span>{formatDate(deposit.completedAt)}</span>
            </button>
          ))}
          {deposits.length === 0 && <p className="admin-empty-state">Chưa có yêu cầu nạp tiền.</p>}
        </div>
      </section>
    </div>
  )
}

export default DepositView
