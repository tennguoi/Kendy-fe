import { useTranslation } from 'react-i18next'
import './WhyChooseSection.css'

function WhyChooseSection({ items, policies, dynamicContent }) {
  const { t } = useTranslation()

  const eyebrow = dynamicContent?.eyebrow || t('public.whyChooseUs.eyebrow', { defaultValue: 'Tại sao chọn chúng tôi' })
  const title = dynamicContent?.title || t('public.whyChooseUs.title', { defaultValue: 'Mua tài khoản và dịch vụ Facebook cần rõ điều kiện ngay từ đầu' })
  const description = dynamicContent?.description || t('public.whyChooseUs.description', { defaultValue: 'Khách không chỉ cần giá. Khách cần biết tài khoản dùng cho việc gì, bảo hành ra sao, đơn đang xử lý tới đâu và nếu lỗi thì liên hệ ở đâu.' })

  return (
    <section className="public-section why-section" id="policies">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <p>{description}</p>
      </div>

      <div className="why-grid">
        {items.map((item, index) => {
          const Icon = item.icon

          return (
            <article className="why-card" key={item.titleKey || index}>
              <div className="why-icon-box">
                <Icon size={22} strokeWidth={2} aria-hidden="true" />
              </div>
              <div className="why-content-box">
                <h3>{item.titleKey ? t(item.titleKey, { defaultValue: item.title }) : item.title}</h3>
                <p>{item.textKey ? t(item.textKey, { defaultValue: item.text }) : item.text}</p>
              </div>
            </article>
          )
        })}
      </div>

      <div className="policy-strip" aria-label="Tóm tắt chính sách">
        {policies.map((item, index) => (
          <article key={item.labelKey || index}>
            <strong>{item.labelKey ? t(item.labelKey, { defaultValue: item.label }) : item.label}</strong>
            <span>{item.valueKey ? t(item.valueKey, { defaultValue: item.value }) : item.value}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default WhyChooseSection
