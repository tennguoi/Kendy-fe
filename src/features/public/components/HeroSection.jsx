import { ArrowRight, CheckCircle2 } from 'lucide-react'

function HeroSection({ logo, notice, onLoginClick, platformSignals }) {
  return (
    <section className="public-hero" id="top">
      <div className="public-pixel-layer" aria-hidden="true" />
      <img className="public-hero-mark" src={logo} alt="" aria-hidden="true" />

      <div className="public-hero-inner">
        <div className="hero-copy-block">
          {notice && <p className="public-notice">{notice}</p>}

          <span className="public-kicker">
            <CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />
            Nền tảng dịch vụ digital có ví, đơn hàng và ticket hỗ trợ
          </span>

          <h1>Nền tảng mua dịch vụ digital nhanh chóng, minh bạch và tự động</h1>
          <p className="public-hero-copy">
            Kendy Digital giúp bạn nạp tiền qua SePay, mua dịch vụ bằng ví, theo dõi đơn hàng và gửi ticket hỗ trợ
            trên một hệ thống rõ ràng thay vì trao đổi thủ công rời rạc.
          </p>

          <div className="public-hero-actions">
            <button type="button" className="public-btn primary hero-main" onClick={onLoginClick}>
              <span>Bắt đầu ngay</span>
              <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </button>
            <a className="public-btn glass" href="#services">
              Xem dịch vụ
            </a>
          </div>

          <div className="public-trust-strip" aria-label="Điểm nổi bật">
            <span>Nạp tiền tự động</span>
            <span>Xử lý đơn 24/7</span>
            <span>Lịch sử ví minh bạch</span>
            <span>Hỗ trợ theo ticket</span>
          </div>
        </div>

        <div className="hero-platform-card" aria-label="Mockup giao diện ví và đơn hàng">
          <div className="mockup-topbar">
            <span>Kendy Wallet</span>
            <strong>Dashboard preview</strong>
          </div>

          <div className="wallet-preview">
            <span>Số dư ví</span>
            <strong>1.250.000đ</strong>
            <small>Giao dịch gần nhất: +500.000đ đã cộng vào ví</small>
          </div>

          <div className="signal-grid">
            {platformSignals.map((item) => {
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
              <span>Đơn hàng</span>
              <strong>CapCut Pro 12 tháng</strong>
            </div>
            <em>Đang xử lý</em>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
