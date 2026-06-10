import { AlertCircle, Copy, QrCode } from 'lucide-react'
import './AutoDepositSection.css'

function AutoDepositSection({ flow }) {
  return (
    <section className="public-section auto-deposit-section" id="deposit">
      <div className="deposit-copy">
        <span className="eyebrow">Nạp tiền tự động</span>
        <h2>Tạo mã nạp, chuyển khoản đúng nội dung, số dư ví được cộng để mua dịch vụ</h2>
        <p>
          Đây là điểm khác biệt giữa Kendy và cách bán thủ công: khách có ví, lịch sử nạp, lịch sử mua và mã đơn để
          kiểm tra lại khi cần hỗ trợ.
        </p>

        <div className="deposit-warning">
          <AlertCircle size={19} strokeWidth={2} aria-hidden="true" />
          <span>Điều quan trọng là chuyển khoản đúng nội dung. Nếu sai, bạn có thể tạo ticket để kiểm tra thủ công.</span>
        </div>
      </div>

      <div className="deposit-showcase">
        <div className="deposit-card">
          <div className="qr-box" aria-hidden="true">
            <QrCode size={54} strokeWidth={1.7} />
          </div>
          <div className="deposit-lines">
            <span>Số tiền</span>
            <strong>500.000đ</strong>
            <span>Nội dung chuyển khoản</span>
            <button type="button">
              KD-8F4N2L6Q
              <Copy size={15} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
          <em>Đang chờ giao dịch</em>
        </div>

        <div className="deposit-flow" aria-label="Flow nạp tiền tự động">
          {flow.map((item, index) => {
            const Icon = item.icon

            return (
              <article className="deposit-flow-step" key={item.title}>
                <span className="flow-index">{String(index + 1).padStart(2, '0')}</span>
                <Icon size={21} strokeWidth={2} aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default AutoDepositSection
