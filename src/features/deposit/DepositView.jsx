import InfoLine from '../../components/bank/InfoLine'
import { money } from '../../utils/currency'

const quickAmounts = [100000, 250000, 500000, 1000000]

function DepositView({
  activeDeposit,
  amountNumber,
  copied,
  depositAmount,
  depositCode,
  onAmountChange,
  onCopy,
  onCreateDeposit,
}) {
  return (
    <section className="deposit-tool">
      <div className="deposit-form">
        <span className="eyebrow">Tạo mã nạp</span>
        <h2>Nạp tiền qua chuyển khoản</h2>
        <label>
          Số tiền
          <input value={depositAmount} inputMode="numeric" onChange={(event) => onAmountChange(event.target.value)} />
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
        <div className="qr-box">
          <div className="qr-mark">{depositCode}</div>
        </div>
        <div className="bank-lines">
          <InfoLine label="Ngân hàng" value={activeDeposit?.bankName || 'ACB'} copied={copied} onCopy={onCopy} />
          <InfoLine
            label="Số tài khoản"
            value={activeDeposit?.bankAccount || '0000000000'}
            copied={copied}
            onCopy={onCopy}
          />
          <InfoLine
            label="Chủ tài khoản"
            value={activeDeposit?.bankOwner || 'KENDY DIGITAL'}
            copied={copied}
            onCopy={onCopy}
          />
          <InfoLine
            label="Số tiền"
            value={money.format(Number(activeDeposit?.amount ?? amountNumber))}
            copied={copied}
            onCopy={onCopy}
          />
          <InfoLine label="Nội dung" value={depositCode} copied={copied} onCopy={onCopy} strong />
        </div>
      </div>
    </section>
  )
}

export default DepositView
