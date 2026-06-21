import { AlertCircle, Copy, QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './AutoDepositSection.css'

function AutoDepositSection({ flow, dynamicContent }) {
  const { t } = useTranslation()

  const eyebrow = dynamicContent?.eyebrow || t('public.depositFlow.eyebrow', { defaultValue: 'Nạp tiền tự động' })
  const title = dynamicContent?.title || t('public.depositFlow.title', { defaultValue: 'Tạo mã nạp, chuyển khoản đúng nội dung, số dư ví được cộng để mua dịch vụ' })
  const description = dynamicContent?.description || t('public.depositFlow.description', { defaultValue: 'Đây là điểm khác biệt giữa Kendy và cách bán thủ công: khách có ví, lịch sử nạp, lịch sử mua và mã đơn để kiểm tra lại khi cần hỗ trợ.' })
  const warning = dynamicContent?.warning || t('public.depositFlow.warning', { defaultValue: 'Điều quan trọng là chuyển khoản đúng nội dung. Nếu sai, bạn có thể tạo ticket để kiểm tra thủ công.' })

  return (
    <section className="public-section auto-deposit-section" id="deposit">
      <div className="deposit-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>

        <div className="deposit-warning">
          <AlertCircle size={19} strokeWidth={2} aria-hidden="true" />
          <span>{warning}</span>
        </div>
      </div>

      <div className="deposit-showcase">
        <div className="deposit-card">
          <div className="qr-box" aria-hidden="true">
            <QrCode size={54} strokeWidth={1.7} />
          </div>
          <div className="deposit-lines">
            <span>{t('deposit.amount', { defaultValue: 'Số tiền' })}</span>
            <strong>500.000đ</strong>
            <span>{t('deposit.transferContent', { defaultValue: 'Nội dung chuyển khoản' })}</span>
            <button type="button">
              KD-8F4N2L6Q
              <Copy size={15} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
          <em>{t('public.depositFlow.waiting', { defaultValue: 'Đang chờ giao dịch' })}</em>
        </div>

        <div className="deposit-flow" aria-label="Flow nạp tiền tự động">
          {flow.map((item, index) => {
            const Icon = item.icon

            return (
              <article className="deposit-flow-step" key={item.titleKey || index}>
                <span className="flow-index">{String(index + 1).padStart(2, '0')}</span>
                <Icon size={21} strokeWidth={2} aria-hidden="true" />
                <h3>{item.titleKey ? t(item.titleKey, { defaultValue: item.title }) : item.title}</h3>
                <p>{item.textKey ? t(item.textKey, { defaultValue: item.text }) : item.text}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default AutoDepositSection
