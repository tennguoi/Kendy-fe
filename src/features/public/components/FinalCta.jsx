import { ArrowRight, LogIn } from 'lucide-react'

function FinalCta({ onLoginClick }) {
  return (
    <section className="final-cta" id="contact">
      <div>
        <span className="eyebrow">Kendy Digital</span>
        <h2>Bắt đầu bằng tài khoản, sau đó quản lý ví và đơn hàng trong dashboard</h2>
        <p>
          Đăng ký hoặc đăng nhập để nạp tiền, mua dịch vụ, theo dõi xử lý đơn và gửi ticket hỗ trợ khi cần.
        </p>
      </div>
      <div className="final-actions">
        <button type="button" className="public-btn primary" onClick={onLoginClick}>
          <LogIn size={18} strokeWidth={2} aria-hidden="true" />
          <span>Đăng ký / Đăng nhập</span>
        </button>
        <a className="public-btn glass" href="#pricing">
          <span>Xem dịch vụ</span>
          <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}

export default FinalCta
