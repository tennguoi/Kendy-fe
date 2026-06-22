import { useTranslation } from 'react-i18next'
import { AdminEmptyState } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'
import { userDetailTabs } from '../users.constants'

function UserDetailActivity({
  activeDetailTab,
  detailData,
  onActiveDetailTabChange,
  onRevokeApiKey,
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

      {activeDetailTab === 'api-keys' && (
        <div className="admin-mini-list">
          {detailData.apiKeys.map((key) => (
            <article key={key.id}>
              <strong>{key.name}</strong>
              <span>
                {key.keyPrefix}...
                {key.scopes?.length > 0 && ` · ${key.scopes.join(', ')}`}
                {key.lastUsedAt ? ` · Used ${formatAdminDate(key.lastUsedAt)}` : ''}
                {key.revokedAt ? ` · Revoked ${formatAdminDate(key.revokedAt)}` : ''}
              </span>
              {!key.revokedAt && (
                <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={() => onRevokeApiKey(key.id)}>
                  Thu hồi
                </button>
              )}
            </article>
          ))}
          {detailData.apiKeys.length === 0 && <AdminEmptyState message="Chưa có API key nào" />}
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
