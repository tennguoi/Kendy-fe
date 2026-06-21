import { ArrowRight, Clock3 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { serverNow } from '../../../../utils/serverTime'
import './PromoBanner.css'

function getRemainingTime(endsAt, now) {
  const endTime = Date.parse(endsAt)
  if (!Number.isFinite(endTime)) return null

  const totalSeconds = Math.max(0, Math.floor((endTime - now) / 1000))
  return {
    expired: totalSeconds <= 0,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

function PromoBanner({ config }) {
  const [now, setNow] = useState(() => serverNow())
  const { t } = useTranslation()

  useEffect(() => {
    if (!config?.enabled || !config.countdownEnabled || !config.endsAt) return undefined
    const timer = window.setInterval(() => setNow(serverNow()), 1000)
    return () => window.clearInterval(timer)
  }, [config?.countdownEnabled, config?.enabled, config?.endsAt])

  const remaining = useMemo(
    () => getRemainingTime(config?.endsAt, now),
    [config?.endsAt, now],
  )

  if (!config?.enabled || (config.countdownEnabled && remaining?.expired)) {
    return null
  }

  const style = {
    '--promo-background': config.backgroundColor,
    '--promo-text': config.textColor,
  }
  const isInternalLink = config.ctaUrl?.startsWith('/')

  return (
    <section className="promo-banner" style={style} aria-label="Chương trình khuyến mãi">
      <div className="promo-banner-copy">
        {config.eyebrow && <span>{config.eyebrow}</span>}
        <strong>{config.title}</strong>
        {config.description && <p>{config.description}</p>}
      </div>

      {config.countdownEnabled && remaining && (
        <div className="promo-countdown" aria-label="Thời gian còn lại">
          <Clock3 size={18} aria-hidden="true" />
          {remaining.days > 0 && <b>{remaining.days} {t('common.days', { defaultValue: 'ngày' })}</b>}
          <b>{String(remaining.hours).padStart(2, '0')}:</b>
          <b>{String(remaining.minutes).padStart(2, '0')}:</b>
          <b>{String(remaining.seconds).padStart(2, '0')}</b>
        </div>
      )}

      {config.ctaLabel && config.ctaUrl && (
        isInternalLink ? (
          <Link className="promo-banner-cta" to={config.ctaUrl}>
            {config.ctaLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        ) : (
          <a className="promo-banner-cta" href={config.ctaUrl} rel="noreferrer" target="_blank">
            {config.ctaLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        )
      )}
    </section>
  )
}

export default PromoBanner
