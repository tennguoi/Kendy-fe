import { ArrowRight, LogIn } from 'lucide-react'

function FinalCta({ onLoginClick }) {
  return (
    <section className="final-cta" id="contact">
      <div>
        <span className="eyebrow">Kendy Digital</span>
        <h2>Cần tài khoản Facebook, CapCut Pro hoặc dịch vụ quảng cáo?</h2>
        <p>
          Đăng nhập để xem dịch vụ, điều kiện mua, thời gian xử lý và gửi yêu cầu hỗ trợ sau khi đặt đơn.
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
