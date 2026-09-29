import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from '../../../../components/Button/Button'
import './HeroSection.css'

const FEED_COLUMNS = 4
const FEED_DURATIONS = [32, 42, 28, 38]

function buildFeedColumns(lines) {
  if (!lines.length) return []
  return Array.from({ length: FEED_COLUMNS }, (_, colIdx) => {
    const rotated = lines.map((_, i) => lines[(i + colIdx * 2) % lines.length])
    return rotated.concat(rotated)
  })
}

function HeroSection({ notice, onLoginClick, serviceSignals, dynamicContent }) {
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

  const feedStatuses = t('public.hero.feedStatuses', {
    returnObjects: true,
    defaultValue: ['Đang xử lý', 'Đã xác nhận', 'Hoàn tất', 'Đã bàn giao']
  })

  const resolvedSignals = Array.isArray(serviceSignals)
    ? serviceSignals.map((item) => ({
        icon: item.icon,
        label: item.labelKey ? t(item.labelKey, { defaultValue: item.label }) : item.label,
        value: item.valueKey ? t(item.valueKey, { defaultValue: item.value }) : item.value
      }))
    : []

  const feedLines = []
  if (Array.isArray(trustItems)) {
    trustItems.forEach((item, idx) => {
      feedLines.push({ text: `${item} — ${feedStatuses[idx % feedStatuses.length]}`, status: feedStatuses[idx % feedStatuses.length] })
    })
  }
  resolvedSignals.forEach((item) => {
    feedLines.push({ text: `${item.label} — ${item.value}`, status: null })
  })
  feedLines.push({
    text: `${t('public.hero.mockupBalance', { defaultValue: 'Số dư ví' })} — 1.250.000đ`,
    status: null
  })

  const feedColumns = buildFeedColumns(feedLines)

  const statusClass = (status) => {
    if (!status) return ''
    if (status === feedStatuses[0]) return ' feed-line--busy'
    return ' feed-line--done'
  }

  return (
    <section className="public-hero" id="top">
      <div className="hero-feed" aria-hidden="true">
        {feedColumns.map((col, ci) => (
          <div className="feed-col" key={ci}>
            <div
              className={`feed-col-track${ci % 2 ? ' feed-col-track--reverse' : ''}`}
              style={{
                animationDuration: `${FEED_DURATIONS[ci % FEED_DURATIONS.length]}s`
              }}
            >
              <div className="feed-col-group">
                {col.map((line, li) => (
                  <span className={`feed-line${statusClass(line.status)}`} key={`a-${li}`}>
                    {line.text}
                  </span>
                ))}
              </div>
              <div className="feed-col-group" aria-hidden="true">
                {col.map((line, li) => (
                  <span className={`feed-line${statusClass(line.status)}`} key={`b-${li}`}>
                    {line.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hero-vignette" aria-hidden="true" />

      <div className="hero-stage">
        

        {notice && <p className="hero-notice">{notice}</p>}

        <p className="hero-kicker">
          <CheckCircle2 size={16} strokeWidth={2} aria-hidden="true" />
          {kicker}
        </p>

        <h1 className="hero-title">{title}</h1>
        <p className="hero-desc">{description}</p>

        <div className="hero-actions">
          <Button variant="primary" href="#services">
            {primaryCta}
          </Button>
          <Button variant="glass" href="#contact">
            {secondaryCta}
          </Button>
        </div>

        <button type="button" className="hero-login" onClick={onLoginClick}>
          {t('public.hero.mockupLoginLink', { defaultValue: 'Đã có tài khoản? Đăng nhập' })}
        </button>

        {Array.isArray(trustItems) && trustItems.length > 0 && (
          <ul className="hero-trust">
            {trustItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        )}

        {resolvedSignals.length > 0 && (
          <ul className="hero-stats">
            {resolvedSignals.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.label}>
                  {Icon && <Icon size={14} strokeWidth={2} aria-hidden="true" />}
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

export default HeroSection