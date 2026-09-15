import { PackageCheck, LockKeyhole, Wallet, ReceiptText, LifeBuoy, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './WorkflowSection.css'

function WorkflowSection({ steps = [] }) {
  const { t } = useTranslation()

  const defaultSteps = [
    {
      icon: PackageCheck,
      title: t('public.workflow.steps.step1.title', { defaultValue: 'Chọn dịch vụ' }),
      description: t('public.workflow.steps.step1.text', { defaultValue: 'Xem gói CapCut, Facebook, nâng cấp hoặc quảng cáo theo nhu cầu.' }),
    },
    {
      icon: LockKeyhole,
      title: t('public.workflow.steps.step2.title', { defaultValue: 'Đăng nhập / tạo tài khoản' }),
      description: t('public.workflow.steps.step2.text', { defaultValue: 'Tài khoản giúp lưu lịch sử đơn, ví tiền và ticket hỗ trợ.' }),
    },
    {
      icon: Wallet,
      title: t('public.workflow.steps.step3.title', { defaultValue: 'Nạp ví hoặc gửi tư vấn' }),
      description: t('public.workflow.steps.step3.text', { defaultValue: 'Gói mua nhanh dùng số dư ví; dịch vụ quảng cáo tạo yêu cầu tư vấn.' }),
    },
    {
      icon: ReceiptText,
      title: t('public.workflow.steps.step4.title', { defaultValue: 'Theo dõi đơn hàng' }),
      description: t('public.workflow.steps.step4.text', { defaultValue: 'Kiểm tra trạng thái, nhận kết quả và gửi ticket nếu cần hỗ trợ.' }),
    },
    {
      icon: LifeBuoy,
      title: t('public.workflow.steps.step5.title', { defaultValue: 'Nhận hỗ trợ / bảo hành' }),
      description: t('public.workflow.steps.step5.text', { defaultValue: 'Nếu lỗi thuộc phạm vi bảo hành, tạo ticket gắn với đúng mã đơn.' }),
    },
  ]

  const displaySteps = steps.length > 0 ? steps : defaultSteps

  return (
    <section className="workflow" id="workflow" aria-labelledby="workflow-title">
      <div className="container">
        <header className="workflow__header">
          <span className="eyebrow">{t('public.workflow.eyebrow', { defaultValue: 'Cách thức hoạt động' })}</span>
          <h2 id="workflow-title" className="workflow__title text-heading-1">
            {t('public.workflow.title', { defaultValue: '5 bước đơn giản để mua dịch vụ' })}
          </h2>
          <p className="workflow__description text-body-lg">
            {t('public.workflow.description', { defaultValue: 'Quy trình chuẩn hóa, minh bạch từ lúc chọn dịch vụ đến khi nhận kết quả và hỗ trợ sau mua.' })}
          </p>
        </header>

        <div className="workflow__steps">
          {displaySteps.map((step, index) => (
            <article key={index} className="workflow__step">
              <div className="workflow__step-number">
                <span>{index + 1}</span>
              </div>
              <div className="workflow__step-connector" aria-hidden="true">
                <ChevronRight size={20} strokeWidth={2.5} />
              </div>
              <div className="workflow__step-content">
                <div className="workflow__step-icon">
                  <step.icon size={24} strokeWidth={2} aria-hidden="true" />
                </div>
                <h3 className="workflow__step-title">{step.title}</h3>
                <p className="workflow__step-description">{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WorkflowSection