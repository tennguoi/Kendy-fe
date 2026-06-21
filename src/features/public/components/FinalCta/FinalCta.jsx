import { ArrowRight, LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from '../../../../components/Button/Button'
import './FinalCta.css'

function FinalCta({ onLoginClick, dynamicContent }) {
  const { t } = useTranslation()

  const brand = dynamicContent?.brand || 'Kendy Digital'
  const title = dynamicContent?.title || t('public.finalCta.title', { defaultValue: 'Cần tài khoản Facebook, CapCut Pro hoặc dịch vụ quảng cáo?' })
  const description = dynamicContent?.description || t('public.finalCta.description', { defaultValue: 'Đăng nhập để xem dịch vụ, điều kiện mua, thời gian xử lý và gửi yêu cầu hỗ trợ sau khi đặt đơn.' })
  const primaryCta = dynamicContent?.primaryCta || t('public.finalCta.primaryCta', { defaultValue: 'Đăng ký / Đăng nhập' })
  const secondaryCta = dynamicContent?.secondaryCta || t('public.finalCta.secondaryCta', { defaultValue: 'Xem dịch vụ' })

  return (
    <section className="final-cta" id="contact">
      <div>
        <span className="eyebrow">{brand}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="final-actions">
        <Button variant="primary" onClick={onLoginClick}>
          <LogIn size={18} strokeWidth={2} aria-hidden="true" />
          <span>{primaryCta}</span>
        </Button>
        <Button variant="glass" href="#pricing">
          <span>{secondaryCta}</span>
          <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>
    </section>
  )
}

export default FinalCta
