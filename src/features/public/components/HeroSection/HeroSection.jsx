import { ArrowRight, CheckCircle2 } from 'lucide-react'
import './HeroSection.css'

function HeroSection({ logo, notice, onLoginClick, serviceSignals }) {
  return (
    <section className="public-hero" id="top">
      <div className="public-pixel-layer" aria-hidden="true" />
      <img className="public-hero-mark" src={logo} alt="" aria-hidden="true" />

      <div className="public-hero-inner">
        <div className="hero-copy-block">
          {notice && <p className="public-notice">{notice}</p>}

          <span className="public-kicker">
            <CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />
            Mua tài khoản, nâng cấp gói và đăng ký dịch vụ Facebook
          </span>

          <h1>Mua tài khoản CapCut, Facebook và dịch vụ quảng cáo nhanh chóng, minh bạch</h1>
          <p className="public-hero-copy">
            Kendy Digital giúp bạn mua tài khoản, nâng cấp gói, nạp tiền tự động, theo dõi đơn hàng và nhận hỗ trợ sau
            mua trên một hệ thống có ví tiền, mã đơn và ticket rõ ràng.
          </p>

          <div className="public-hero-actions">
            <a className="public-btn primary hero-main" href="#services">
              <span>Xem dịch vụ</span>
              <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </a>
            <a className="public-btn glass" href="#contact">
              Liên hệ tư vấn
            </a>
          </div>

          <div className="public-trust-strip" aria-label="Điểm nổi bật">
            <span>Facebook Ads</span>
            <span>CapCut Pro</span>
            <span>Nâng cấp tài khoản</span>
            <span>Bảo hành rõ điều kiện</span>
          </div>
        </div>

        <div className="hero-service-card" aria-label="Mô phỏng dịch vụ nổi bật">
          <div className="mockup-topbar">
            <span>Mockup giao dịch</span>
            <strong>Ví, đơn hàng và dịch vụ</strong>
          </div>

          <div className="wallet-preview">
            <span>Số dư ví</span>
            <strong>1.250.000đ</strong>
            <small>Giao dịch nạp tiền thành công: +500.000đ</small>
          </div>

          <div className="hero-service-stack">
            <span>CapCut Pro</span>
            <span>Tài khoản Facebook</span>
            <span>Nâng cấp tài khoản</span>
            <span>Chạy quảng cáo</span>
          </div>

          <div className="signal-grid">
            {serviceSignals.map((item) => {
              const Icon = item.icon

              return (
                <article className="signal-card" key={item.label}>
                  <Icon size={18} strokeWidth={2} aria-hidden="true" />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              )
            })}
          </div>

          <div className="order-preview">
            <div>
              <span>Đơn gần đây</span>
              <strong>Nâng cấp CapCut Pro 12 tháng</strong>
            </div>
            <em>Đang xử lý</em>
          </div>

          <button type="button" className="hero-login-link" onClick={onLoginClick}>
            Đã có tài khoản? Đăng nhập để theo dõi đơn
          </button>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
