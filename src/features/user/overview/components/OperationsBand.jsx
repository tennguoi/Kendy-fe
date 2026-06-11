import { LifeBuoy, PlusCircle, ReceiptText, WalletCards } from 'lucide-react'

const actions = [
  { icon: WalletCards, label: 'Ví tiền', view: 'deposit' },
  { icon: ReceiptText, label: 'Đơn hàng', view: 'orders' },
  { icon: PlusCircle, label: 'Nạp tiền', view: 'deposit' },
  { icon: LifeBuoy, label: 'Ticket', view: 'support' },
]

function OperationsBand({ onViewChange }) {
  return (
    <section className="operations-band">
      <div>
        <span className="eyebrow">Workspace</span>
        <h2>Thao tác nhanh</h2>
      </div>
      <div className="ops-list">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <button type="button" key={action.label} onClick={() => onViewChange?.(action.view)}>
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
              {action.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default OperationsBand
