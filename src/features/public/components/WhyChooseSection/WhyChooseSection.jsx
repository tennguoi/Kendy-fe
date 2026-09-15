import { History, ReceiptText, MessageSquare, FileCheck, ShieldCheck, LifeBuoy, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './WhyChooseSection.css'

function WhyChooseSection({ items = [], policies = [] }) {
  const { t } = useTranslation()

  const defaultItems = [
    {
      icon: History,
      title: t('public.whyChooseUs.reputation.title', { defaultValue: 'Uy tín tài chính' }),
      description: t('public.whyChooseUs.reputation.text', { defaultValue: 'Ví tiền có lịch sử cộng, trừ và hoàn tiền để người dùng kiểm tra lại khi cần.' }),
    },
    {
      icon: ReceiptText,
      title: t('public.whyChooseUs.transparency.title', { defaultValue: 'Trạng thái đơn minh bạch' }),
      description: t('public.whyChooseUs.transparency.text', { defaultValue: 'Đơn hàng được theo dõi theo từng trạng thái thay vì trao đổi thủ công rời rạc.' }),
    },
    {
      icon: MessageSquare,
      title: t('public.whyChooseUs.ticket.title', { defaultValue: 'Ticket theo từng đơn' }),
      description: t('public.whyChooseUs.ticket.text', { defaultValue: 'Khi có lỗi, nội dung hỗ trợ gắn với đúng đơn và đúng giao dịch.' }),
    },
    {
      icon: FileCheck,
      title: t('public.whyChooseUs.policy.title', { defaultValue: 'Chính sách rõ ràng' }),
      description: t('public.whyChooseUs.policy.text', { defaultValue: 'Điều kiện sử dụng, bảo hành và hoàn tiền được hiển thị trước khi mua.' }),
    },
    {
      icon: ShieldCheck,
      title: t('public.whyChooseUs.security.title', { defaultValue: 'Bảo mật tài khoản' }),
      description: t('public.whyChooseUs.security.text', { defaultValue: 'Luồng đăng nhập, token và thông tin giao dịch được tách khỏi public site.' }),
    },
    {
      icon: LifeBuoy,
      title: t('public.whyChooseUs.support.title', { defaultValue: 'Hỗ trợ vận hành' }),
      description: t('public.whyChooseUs.support.text', { defaultValue: 'Đội hỗ trợ tiếp nhận yêu cầu riêng, lỗi đơn và vấn đề thanh toán qua ticket.' }),
    },
  ]

  const displayItems = items.length > 0 ? items : defaultItems

  return (
    <section className="why-choose" id="why-choose" aria-labelledby="why-choose-title">
      <div className="container">
        <header className="why-choose__header">
          <span className="eyebrow">{t('public.whyChooseUs.eyebrow', { defaultValue: 'Tại sao chọn Kendy Digital' })}</span>
          <h2 id="why-choose-title" className="why-choose__title text-heading-1">
            {t('public.whyChooseUs.title', { defaultValue: 'Hệ thống mua bán dịch vụ số minh bạch, an toàn' })}
          </h2>
          <p className="why-choose__description text-body-lg">
            {t('public.whyChooseUs.description', { defaultValue: 'Chúng tôi xây dựng quy trình chuẩn hóa từ chọn dịch vụ đến sau mua, giúp bạn an tâm mọi giao dịch.' })}
          </p>
        </header>

        <div className="why-choose__grid">
          {displayItems.map((item, index) => (
            <article key={index} className="why-choose__card">
              <div className="why-choose__icon">
                <item.icon size={24} strokeWidth={2} aria-hidden="true" />
              </div>
              <div className="why-choose__content">
                <h3 className="why-choose__card-title">
                  {item.titleKey ? t(item.titleKey, { defaultValue: item.title }) : item.title}
                </h3>
                <p className="why-choose__card-description">
                  {item.textKey ? t(item.textKey, { defaultValue: item.description || item.text }) : (item.description || item.text)}
                </p>
              </div>
              <div className="why-choose__check">
                <CheckCircle2 size={20} strokeWidth={2.5} aria-hidden="true" />
              </div>
            </article>
          ))}
        </div>

        {policies.length > 0 && (
          <div className="why-choose__policies">
            <h3 className="why-choose__policies-title">{t('public.whyChooseUs.policiesTitle', { defaultValue: 'Chính sách bảo vệ người mua' })}</h3>
            <ul className="why-choose__policies-list">
              {policies.map((policy, index) => {
                if (typeof policy === 'string') {
                  return (
                    <li key={index} className="why-choose__policy-item">
                      <CheckCircle2 size={18} strokeWidth={2.5} aria-hidden="true" />
                      <span>{policy}</span>
                    </li>
                  )
                }

                const label = policy?.labelKey ? t(policy.labelKey, { defaultValue: policy.label }) : policy?.label
                const value = policy?.valueKey ? t(policy.valueKey, { defaultValue: policy.value }) : (policy?.value || policy?.text || policy?.description)

                return (
                  <li key={index} className="why-choose__policy-item">
                    <CheckCircle2 size={18} strokeWidth={2.5} aria-hidden="true" />
                    <span>
                      {label ? <strong>{label}: </strong> : null}
                      {value}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

export default WhyChooseSection