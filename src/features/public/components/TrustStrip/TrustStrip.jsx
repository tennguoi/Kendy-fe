import { useTranslation } from 'react-i18next'
import './TrustStrip.css'

function TrustStrip({ items }) {
  const { t } = useTranslation()

  return (
    <section className="trust-strip" aria-label="Cam kết tạo niềm tin">
      {items.map((item, idx) => {
        const Icon = item.icon

        return (
          <article className="trust-strip-item" key={item.labelKey || idx}>
            <div className="trust-icon-box">
              <Icon size={22} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="trust-content-box">
              <strong>{item.labelKey ? t(item.labelKey, { defaultValue: item.label }) : item.label}</strong>
              <span>{item.detailKey ? t(item.detailKey, { defaultValue: item.detail }) : item.detail}</span>
            </div>
          </article>
        )
      })}
    </section>
  )
}

export default TrustStrip
