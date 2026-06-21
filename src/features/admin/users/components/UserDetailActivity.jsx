import { useTranslation } from 'react-i18next'
import { AdminEmptyState } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'
import { userDetailTabs } from '../users.constants'

function UserDetailActivity({
  activeDetailTab,
  detailData,
  onActiveDetailTabChange,
  onRevokeSession,
  submitting,
}) {
  const { t } = useTranslation()
  return (
    <div className="admin-panel-subsection">
      <div className="admin-tabs">
        {userDetailTabs.map((tab) => (
          <button
            type="button"
            className={activeDetailTab === tab.id ? 'active' : ''}
            key={tab.id}
            onClick={() => onActiveDetailTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeDetailTab === 'orders' && (
        <div className="admin-mini-list">
          {detailData.orders.map((order) => (
            <article key={order.id}>
              <strong>{order.orderCode}</strong>
              <span>{order.serviceName} · {formatAdminMoney(order.amount)} · {order.status}</span>
            </article>
          ))}
          {detailData.orders.length === 0 && <AdminEmptyState message={t('admin.users.detail.noOrders')} />}
        </div>
      )}

      {activeDetailTab === 'wallet' && (
        <div className="admin-mini-list">
          {detailData.wallet.map((item) => (
            <article key={item.id}>
              <strong>{item.transactionCode}</strong>
              <span>{item.type} · {item.direction} · {formatAdminMoney(item.amount)}</span>
            </article>
          ))}
          {detailData.wallet.length === 0 && <AdminEmptyState message={t('admin.users.detail.noWalletTxns')} />}
        </div>
      )}

      {activeDetailTab === 'tickets' && (
        <div className="admin-mini-list">
          {detailData.tickets.map((ticket) => (
            <article key={ticket.id}>
              <strong>{ticket.ticketCode}</strong>
              <span>{ticket.subject} · {ticket.status}</span>
            </article>
          ))}
          {detailData.tickets.length === 0 && <AdminEmptyState message={t('admin.users.detail.noTickets')} />}
        </div>
      )}

      {activeDetailTab === 'sessions' && (
        <div className="admin-mini-list">
          {detailData.sessions.map((session) => (
            <article key={session.id}>
              <strong>Session #{session.id}</strong>
              <span>Tạo {formatAdminDate(session.createdAt)} · Hết hạn {formatAdminDate(session.expiresAt)}</span>
              <button type="button" className="admin-danger-button slim" disabled={submitting || session.revokedAt} onClick={() => onRevokeSession(session.id)}>
                Thu hồi
              </button>
            </article>
          ))}
          {detailData.sessions.length === 0 && <AdminEmptyState message={t('admin.users.detail.noSessions')} />}
        </div>
      )}

      {activeDetailTab === 'audit' && (
        <div className="admin-mini-list">
          {detailData.audit.map((item) => (
            <article key={item.id}>
              <strong>{item.action}</strong>
              <span>{item.targetType || 'SYSTEM'} #{item.targetId || '-'} · {formatAdminDate(item.createdAt)}</span>
            </article>
          ))}
          {detailData.audit.length === 0 && <AdminEmptyState message={t('admin.users.detail.noAudit')} />}
        </div>
      )}
    </div>
  )
}

export default UserDetailActivity
