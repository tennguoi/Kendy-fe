import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from '../../../../components/Button/Button'
import './HeroSection.css'

function HeroSection({ logo, notice, onLoginClick, serviceSignals, dynamicContent }) {
  const { t } = useTranslation()

  const kicker = dynamicContent?.kicker || t('public.hero.kicker', { defaultValue: 'Mua tài khoản, nâng cấp gói và đăng ký dịch vụ Facebook' })
  const title = dynamicContent?.title || t('public.hero.title', { defaultValue: 'Mua tài khoản CapCut, Facebook và dịch vụ quảng cáo nhanh chóng, minh bạch' })
  const description = dynamicContent?.description || t('public.hero.description', { defaultValue: 'Kendy Digital giúp bạn mua tài khoản, nâng cấp gói, nạp tiền tự động, theo dõi đơn hàng và nhận hỗ trợ sau mua trên một hệ thống có ví tiền, mã đơn và ticket rõ ràng.' })
  const primaryCta = dynamicContent?.primaryCta || t('public.hero.primaryCta', { defaultValue: 'Xem dịch vụ' })
  const secondaryCta = dynamicContent?.secondaryCta || t('public.hero.secondaryCta', { defaultValue: 'Liên hệ tư vấn' })
  
  const defaultTrustItems = [
    t('public.signals.fbAds', { defaultValue: 'Facebook Ads' }),
    t('public.signals.upgradeValue', { defaultValue: 'CapCut Pro' }),
    t('public.policies.service.link3', { defaultValue: 'Nâng cấp tài khoản' }),
    t('public.signals.clearTermsValue', { defaultValue: 'Bảo hành rõ điều kiện' })
  ]
  const trustItems = dynamicContent?.trustItems || t('public.hero.trustItems', { returnObjects: true, defaultValue: defaultTrustItems })

  return (
    <section className="public-hero" id="top">
      <div className="public-pixel-layer" aria-hidden="true" />
      <img className="public-hero-mark" src={logo} alt="" aria-hidden="true" />

      <div className="public-hero-inner">
        <div className="hero-copy-block">
          {notice && <p className="public-notice">{notice}</p>}

          <span className="public-kicker">
            <CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" />
            {kicker}
          </span>

          <h1>{title}</h1>
          <p className="public-hero-copy">{description}</p>

          <div className="public-hero-actions">
            <Button variant="primary" className="hero-main" href="#services">
              <span>{primaryCta}</span>
              <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button variant="glass" href="#contact">
              {secondaryCta}
            </Button>
          </div>

          <div className="public-trust-strip" aria-label="Điểm nổi bật">
            {Array.isArray(trustItems) && trustItems.map((item, idx) => (
              <span key={idx}>{item}</span>
            ))}
          </div>
        </div>

        <div className="hero-service-card" aria-label="Mô phỏng dịch vụ nổi bật">
          <div className="mockup-topbar">
            <strong>{t('public.hero.mockupTitle', { defaultValue: 'Ví, đơn hàng và dịch vụ' })}</strong>
          </div>

          <div className="wallet-preview">
            <span>{t('public.hero.mockupBalance', { defaultValue: 'Số dư ví' })}</span>
            <strong>1.250.000đ</strong>
            <small>{t('public.hero.mockupBalanceDetail', { defaultValue: 'Giao dịch nạp tiền thành công: +500.000đ' })}</small>
          </div>

          <div className="hero-service-stack">
            <span>{t('public.policies.service.link1', { defaultValue: 'CapCut Pro' })}</span>
            <span>{t('public.policies.service.link2', { defaultValue: 'Tài khoản Facebook' })}</span>
            <span>{t('public.policies.service.link3', { defaultValue: 'Nâng cấp tài khoản' })}</span>
            <span>{t('public.policies.service.link4', { defaultValue: 'Chạy quảng cáo' })}</span>
          </div>

          <div className="signal-grid">
            {serviceSignals.map((item) => {
              const Icon = item.icon

              return (
                <article className="signal-card" key={item.label}>
                  <Icon size={18} strokeWidth={2} aria-hidden="true" />
                  <span>{item.labelKey ? t(item.labelKey, { defaultValue: item.label }) : item.label}</span>
                  <strong>{item.valueKey ? t(item.valueKey, { defaultValue: item.value }) : item.value}</strong>
                </article>
              )
            })}
          </div>

          <div className="order-preview">
            <div>
              <span>{t('public.hero.mockupRecentOrder', { defaultValue: 'Đơn gần đây' })}</span>
              <strong>{t('public.hero.mockupService', { defaultValue: 'Nâng cấp CapCut Pro 12 tháng' })}</strong>
            </div>
            <em>{t('public.hero.mockupProcessing', { defaultValue: 'Đang xử lý' })}</em>
          </div>

          <button type="button" className="hero-login-link" onClick={onLoginClick}>
            {t('public.hero.mockupLoginLink', { defaultValue: 'Đã có tài khoản? Đăng nhập để theo dõi đơn' })}
          </button>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
