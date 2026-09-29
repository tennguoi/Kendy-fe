import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from '../../../../components/Button/Button'
import BaseInput from '../../../../components/ui/BaseInput'
import BaseSelect from '../../../../components/ui/BaseSelect'
import BaseTextarea from '../../../../components/ui/BaseTextarea'
import { isRequired, composeValidators, isValidPhoneVn } from '../../../../utils/validation'
import './ConsultSection.css'

const initialFormState = {
  name: '',
  phone: '',
  industry: '',
  budget: '',
  goal: '',
}

function ConsultSection({ onSubmit, dynamicContent, submitting = false }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState(initialFormState)
  const [validated, setValidated] = useState(false)

  const eyebrow = dynamicContent?.eyebrow || t('public.consult.eyebrow', { defaultValue: 'Tư vấn dịch vụ & quảng cáo' })
  const title = dynamicContent?.title || t('public.consult.title', { defaultValue: 'Cần tư vấn dịch vụ? Gửi brief ngắn để được hỗ trợ giải pháp phù hợp' })
  const description = dynamicContent?.description || t('public.consult.description', { defaultValue: 'Để xuất giải pháp và báo giá chính xác, form này giúp đội ngũ KendyDigital nắm nhanh nhu cầu, ngân sách và mục tiêu của bạn.' })

  const defaultBudgets = [
    t('public.consult.budget1', { defaultValue: 'Dưới 5 triệu/tháng' }),
    t('public.consult.budget2', { defaultValue: '5 - 20 triệu/tháng' }),
    t('public.consult.budget3', { defaultValue: 'Trên 20 triệu/tháng' }),
    t('public.consult.budgetOther', { defaultValue: 'Chưa xác định / Cần tư vấn thêm' }),
  ]
  const budgetOptions = (dynamicContent?.budgetOptions || defaultBudgets).map((opt) => ({
    value: opt,
    label: opt,
  }))

  const validateRequired = composeValidators(isRequired)
  const validatePhone = composeValidators(isRequired, isValidPhoneVn)

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setValidated(true)

    // Basic required check
    if (!formData.name?.trim() || !formData.phone?.trim() || !formData.goal?.trim()) {
      return
    }

    // Phone validation
    const phoneResult = isValidPhoneVn(formData.phone)
    if (phoneResult && phoneResult.isValid === false) {
      return
    }

    if (onSubmit) {
      onSubmit(formData, () => {
        setFormData(initialFormState)
        setValidated(false)
      })
    }
  }

  return (
    <section className="public-section consult-section" id="contact">
      <div className="consult-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <form className="consult-form" onSubmit={handleSubmit}>
        <label>
          <span>{t('public.consult.labelName', { defaultValue: 'Họ tên' })} *</span>
          <BaseInput
            name="name"
            value={formData.name}
            onChange={(val) => handleChange('name', val)}
            placeholder={t('auth.namePlaceholder', { defaultValue: 'Nguyễn Văn A' })}
            validators={[validateRequired]}
            errorMessage={t('settings.nameRequired', { defaultValue: 'Tên hiển thị không được để trống.' })}
            disabled={submitting}
            required
          />
        </label>

        <label>
          <span>{t('public.consult.labelPhone', { defaultValue: 'Số điện thoại/Zalo' })} *</span>
          <BaseInput
            name="phone"
            value={formData.phone}
            onChange={(val) => handleChange('phone', val)}
            placeholder={t('auth.phonePlaceholder', { defaultValue: '0900000000' })}
            validators={[validatePhone]}
            errorMessage={t('settings.phoneInvalid', { defaultValue: 'Số điện thoại không hợp lệ.' })}
            disabled={submitting}
            required
          />
        </label>

        <label>
          <span>{t('public.consult.labelIndustry', { defaultValue: 'Ngành hàng / Lĩnh vực' })}</span>
          <BaseInput
            name="industry"
            value={formData.industry}
            onChange={(val) => handleChange('industry', val)}
            placeholder="Tài khoản số, thời trang, giáo dục, giải trí..."
            disabled={submitting}
          />
        </label>

        <label>
          <span>{t('public.consult.labelBudget', { defaultValue: 'Ngân sách dự kiến' })}</span>
          <BaseSelect
            name="budget"
            value={formData.budget}
            onChange={(val) => handleChange('budget', val)}
            options={budgetOptions}
            placeholder={t('public.consult.selectBudget', { defaultValue: 'Chọn mức ngân sách' })}
            disabled={submitting}
          />
        </label>

        <label className="wide">
          <span>{t('public.consult.labelGoal', { defaultValue: 'Mục tiêu / Nhu cầu cần tư vấn' })} *</span>
          <BaseTextarea
            name="goal"
            value={formData.goal}
            onChange={(val) => handleChange('goal', val)}
            placeholder={t('public.consult.placeholderGoal', {
              defaultValue: 'Nhu cầu loại tài khoản, số lượng, thời hạn, ngân sách hoặc vấn đề đang gặp phải...',
            })}
            rows="4"
            validators={[validateRequired]}
            errorMessage={t('public.consult.goalRequired', { defaultValue: 'Vui lòng nhập nhu cầu cần tư vấn.' })}
            disabled={submitting}
            required
          />
        </label>

        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={17} className="spin" aria-hidden="true" />
              <span>{t('common.sending', { defaultValue: 'Đang gửi yêu cầu...' })}</span>
            </>
          ) : (
            <>
              <span>{t('public.consult.submit', { defaultValue: 'Gửi yêu cầu tư vấn' })}</span>
              <Send size={17} strokeWidth={2} aria-hidden="true" />
            </>
          )}
        </Button>
      </form>
    </section>
  )
}

export default ConsultSection