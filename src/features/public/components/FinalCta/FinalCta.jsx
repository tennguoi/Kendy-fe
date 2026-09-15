import { ArrowRight, Shield, Zap, Headphones } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './FinalCta.css'

function FinalCta({ onLoginClick }) {
  const { t } = useTranslation()

  return (
    <section className="final-cta" id="contact" aria-labelledby="final-cta-title">
      <div className="container">
        <div className="final-cta__card">
          <div className="final-cta__bg" aria-hidden="true">
            <div className="final-cta__gradient" />
            <div className="final-cta__pattern" />
          </div>

          <div className="final-cta__content">
            <div className="final-cta__text">
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {t('public.finalCta.eyebrow', { defaultValue: 'Sẵn sàng bắt đầu?' })}
              </span>
              <h2 id="final-cta-title" className="final-cta__title">
                {t('public.finalCta.title', { defaultValue: 'Bắt đầu mua dịch vụ ngay hôm nay' })}
              </h2>
              <p className="final-cta__description">
                {t('public.finalCta.description', { defaultValue: 'Tham gia 50.000+ khách hàng đã tin dùng Kendy Digital. Mua tài khoản, nâng cấp, nạp ví và chạy quảng cáo chỉ trong vài phút.' })}
              </p>

              <ul className="final-cta__benefits" aria-label="Lợi ích khi mua tại Kendy Digital">
                <li>
                  <Zap size={18} strokeWidth={2} aria-hidden="true" />
                  <span>{t('public.finalCta.benefit1', { defaultValue: 'Kích hoạt tức thì sau thanh toán' })}</span>
                </li>
                <li>
                  <Shield size={18} strokeWidth={2} aria-hidden="true" />
                  <span>{t('public.finalCta.benefit2', { defaultValue: 'Bảo hành rõ ràng, minh bạch' })}</span>
                </li>
                <li>
                  <Headphones size={18} strokeWidth={2} aria-hidden="true" />
                  <span>{t('public.finalCta.benefit3', { defaultValue: 'Hỗ trợ 24/7 qua ticket' })}</span>
                </li>
              </ul>

              <div className="final-cta__actions">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {t('public.finalCta.primaryAction', { defaultValue: 'Xem dịch vụ ngay' })}
                  <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-lg"
                  onClick={onLoginClick}
                  style={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: '#FFFFFF',
                  }}
                >
                  {t('public.finalCta.secondaryAction', { defaultValue: 'Đăng nhập / Đăng ký' })}
                </button>
              </div>
            </div>

            <div className="final-cta__visual" aria-hidden="true">
              <div className="final-cta__mockup">
                <div className="final-cta__mockup-header">
                  <div className="final-cta__mockup-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
                <div className="final-cta__mockup-content">
                  <div className="final-cta__mockup-search">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input type="text" placeholder="Tìm CapCut Pro, Facebook Ads..." readOnly />
                  </div>
                  <div className="final-cta__mockup-cards">
                    <div className="final-cta__mockup-card">
                      <div className="final-cta__mockup-card-icon" style={{ background: 'var(--color-primary-500)' }}>🎬</div>
                      <div className="final-cta__mockup-card-info">
                        <div className="final-cta__mockup-card-title">CapCut Pro 12 tháng</div>
                        <div className="final-cta__mockup-card-price">299.000đ</div>
                      </div>
                    </div>
                    <div className="final-cta__mockup-card">
                      <div className="final-cta__mockup-card-icon" style={{ background: '#1877F2' }}>📘</div>
                      <div className="final-cta__mockup-card-info">
                        <div className="final-cta__mockup-card-title">FB Ads Agency</div>
                        <div className="final-cta__mockup-card-price">Tư vấn báo giá</div>
                      </div>
                    </div>
                    <div className="final-cta__mockup-card">
                      <div className="final-cta__mockup-card-icon" style={{ background: 'var(--color-secondary-500)' }}>⬆️</div>
                      <div className="final-cta__mockup-card-info">
                        <div className="final-cta__mockup-card-title">Nâng cấp Fanpage</div>
                        <div className="final-cta__mockup-card-price">199.000đ</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCta