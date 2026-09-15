import { CheckCircle2, Shield, Wallet, Headphones, FileCheck, Award, Users, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './TrustStrip.css'

function TrustStrip({ items = [], className = '' }) {
  const { t } = useTranslation()

  const defaultItems = [
    {
      icon: CheckCircle2,
      label: t('public.trust.stats.order.label', { defaultValue: 'Đơn hàng có mã theo dõi' }),
      description: t('public.trust.stats.order.detail', { defaultValue: 'Mỗi đơn có trạng thái, thời gian xử lý và ghi chú bàn giao rõ ràng.' }),
    },
    {
      icon: Wallet,
      label: t('public.trust.stats.wallet.label', { defaultValue: 'Ví tiền minh bạch' }),
      description: t('public.trust.stats.wallet.detail', { defaultValue: 'Lịch sử nạp, mua và hoàn tiền được lưu để kiểm tra lại khi cần.' }),
    },
    {
      icon: Headphones,
      label: t('public.trust.stats.support.label', { defaultValue: 'Hỗ trợ sau mua' }),
      description: t('public.trust.stats.support.detail', { defaultValue: 'Ticket gắn với đơn hàng giúp xử lý vấn đề đúng ngữ cảnh.' }),
    },
    {
      icon: FileCheck,
      label: t('public.trust.stats.policy.label', { defaultValue: 'Chính sách rõ ràng' }),
      description: t('public.trust.stats.policy.detail', { defaultValue: 'Điều kiện bảo hành, hoàn tiền và thời gian xử lý được đặt trước hành động mua.' }),
    },
  ]

  const displayItems = items.length > 0 ? items : defaultItems

  return (
    <section className={`trust-strip ${className}`} aria-label="Điểm tin cậy">
      <div className="container">
        <div className="trust-strip__grid">
          {displayItems.map((item, index) => (
            <article key={index} className="trust-strip__item">
              <div className="trust-strip__icon">
                <item.icon size={24} strokeWidth={2} aria-hidden="true" />
              </div>
              <div className="trust-strip__content">
                <h3 className="trust-strip__label">{item.label}</h3>
                <p className="trust-strip__description">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustStrip