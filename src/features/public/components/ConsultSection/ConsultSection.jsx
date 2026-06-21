import { Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from '../../../../components/Button/Button'
import './ConsultSection.css'

function ConsultSection({ onSubmit, dynamicContent }) {
  const { t } = useTranslation()

  const eyebrow = dynamicContent?.eyebrow || t('public.consult.eyebrow', { defaultValue: 'Tư vấn quảng cáo' })
  const title = dynamicContent?.title || t('public.consult.title', { defaultValue: 'Cần chạy quảng cáo Facebook? Gửi brief ngắn để được tư vấn loại dịch vụ phù hợp' })
  const description = dynamicContent?.description || t('public.consult.description', { defaultValue: 'Dịch vụ quảng cáo cần hiểu sản phẩm, ngân sách và mục tiêu trước khi báo giá. Form này giúp đội tư vấn nắm nhanh bối cảnh thay vì hỏi lại từng thông tin.' })

  const defaultBudgets = [
    t('public.consult.budget1', { defaultValue: 'Dưới 5 triệu/tháng' }),
    t('public.consult.budget2', { defaultValue: '5-20 triệu/tháng' }),
    t('public.consult.budget3', { defaultValue: 'Trên 20 triệu/tháng' })
  ]
  const budgetOptions = dynamicContent?.budgetOptions || defaultBudgets

  return (
    <section className="public-section consult-section" id="contact">
      <div className="consult-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <form className="consult-form" onSubmit={onSubmit}>
        <label>
          <span>{t('public.consult.labelName', { defaultValue: 'Họ tên' })}</span>
          <input name="name" placeholder={t('auth.namePlaceholder', { defaultValue: 'Nguyễn Văn A' })} required />
        </label>
        <label>
          <span>{t('public.consult.labelPhone', { defaultValue: 'Số điện thoại/Zalo' })}</span>
          <input name="phone" placeholder={t('auth.phonePlaceholder', { defaultValue: '0900000000' })} required />
        </label>
        <label>
          <span>{t('public.consult.labelIndustry', { defaultValue: 'Ngành hàng' })}</span>
          <input name="industry" placeholder="Mỹ phẩm, thời trang, giáo dục..." />
        </label>
        <label>
          <span>{t('public.consult.labelBudget', { defaultValue: 'Ngân sách dự kiến' })}</span>
          <select name="budget" defaultValue="">
            <option value="" disabled>
              {t('public.consult.selectBudget', { defaultValue: 'Chọn mức ngân sách' })}
            </option>
            {budgetOptions.map((opt, idx) => (
              <option key={idx}>{opt}</option>
            ))}
          </select>
        </label>
        <label className="wide">
          <span>{t('public.consult.labelGoal', { defaultValue: 'Mục tiêu cần tư vấn' })}</span>
          <textarea name="goal" placeholder={t('public.consult.placeholderGoal', { defaultValue: 'Tin nhắn, đơn hàng, traffic, branding hoặc vấn đề đang gặp...' })} rows="4" />
        </label>
        <Button type="submit" variant="primary">
          <span>{t('public.consult.submit', { defaultValue: 'Gửi yêu cầu tư vấn' })}</span>
          <Send size={17} strokeWidth={2} aria-hidden="true" />
        </Button>
      </form>
    </section>
  )
}

export default ConsultSection
