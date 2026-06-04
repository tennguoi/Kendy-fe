import { AlertCircle } from 'lucide-react'

function AutoDepositSection({ flow }) {
  return (
    <section className="public-section auto-deposit-section" id="deposit">
      <div className="deposit-copy">
        <span className="eyebrow">Nạp tiền tự động</span>
        <h2>Chuyển khoản đúng nội dung để SePay đối soát và cộng ví tự động</h2>
        <p>
          Kendy Digital không yêu cầu người dùng gửi biên lai khi giao dịch hợp lệ. Mỗi yêu cầu nạp có nội dung riêng,
          hệ thống nhận webhook từ SePay, đối soát và ghi lịch sử ví sau khi cộng tiền.
        </p>
        <div className="deposit-warning">
          <AlertCircle size={19} strokeWidth={2} aria-hidden="true" />
          <span>Sai nội dung chuyển khoản có thể cần kiểm tra thủ công qua ticket hỗ trợ.</span>
        </div>
      </div>

      <div className="deposit-flow" aria-label="Flow nạp tiền tự động">
        {flow.map((item, index) => {
          const Icon = item.icon

          return (
            <article className="deposit-flow-step" key={item.title}>
              <span className="flow-index">{String(index + 1).padStart(2, '0')}</span>
              <Icon size={22} strokeWidth={2} aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default AutoDepositSection
