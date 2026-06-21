import { LifeBuoy, PlusCircle, ReceiptText, WalletCards } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function OperationsBand({ onViewChange }) {
  const { t } = useTranslation()

  const actions = [
    { icon: WalletCards, label: t('overview.wallet'), view: 'deposit' },
    { icon: ReceiptText, label: t('overview.orders'), view: 'orders' },
    { icon: PlusCircle, label: t('overview.deposit'), view: 'deposit' },
    { icon: LifeBuoy, label: t('overview.ticket'), view: 'support' },
  ]

  return (
    <section className="operations-band">
      <div>
        <h2>{t('overview.quickActions')}</h2>
      </div>
      <div className="ops-list">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <button type="button" key={action.label} onClick={() => onViewChange?.(action.view)}>
              <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
              <span>{action.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default OperationsBand
