import { Save, Shield, Wallet } from 'lucide-react'
import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'
import { userDetailTabs, userRoles } from '../users.constants'

function UserDetailPanel({
  activeDetailTab,
  adjustForm,
  bulkStatusForm,
  detail,
  detailData,
  hasLoadedUsers,
  onActiveDetailTabChange,
  onAdjustFormChange,
  onAdjustWallet,
  onBulkStatusFormChange,
  onRevokeSession,
  onRoleFormChange,
  onRunBulkUserStatus,
  onUpdateRole,
  onUpdateStatus,
  roleForm,
  selectedUser,
  submitting,
}) {
  return (
    <aside className="admin-panel admin-detail-panel">
      <div className="admin-panel-head">
        <h3>{selectedUser ? selectedUser.name || selectedUser.email : 'Chọn user'}</h3>
        {selectedUser && <AdminStatusBadge status={selectedUser.status} />}
      </div>

      {!hasLoadedUsers ? (
        <AdminEmptyState message="Đang tải chi tiết user..." />
      ) : selectedUser ? (
        <>
          <dl className="admin-detail-list">
            <div><dt>Email</dt><dd>{selectedUser.email}</dd></div>
            <div><dt>Điện thoại</dt><dd>{selectedUser.phone || 'Chưa có'}</dd></div>
            <div><dt>Vai trò</dt><dd>{selectedUser.role}</dd></div>
            <div><dt>Số dư</dt><dd>{formatAdminMoney(selectedUser.balance)}</dd></div>
            <div><dt>2FA</dt><dd>{selectedUser.twoFactorEnabled ? 'Đã bật' : 'Chưa bật'}</dd></div>
            <div><dt>Ngày tạo</dt><dd>{formatAdminDate(selectedUser.createdAt)}</dd></div>
          </dl>

          {detail && (
            <div className="admin-report-grid compact-report">
              <div><span>Đơn</span><strong>{detail.orderCount}</strong></div>
              <div><span>Nạp</span><strong>{formatAdminMoney(detail.completedDepositAmount)}</strong></div>
              <div><span>Mua</span><strong>{formatAdminMoney(detail.purchaseAmount)}</strong></div>
              <div><span>Refund</span><strong>{formatAdminMoney(detail.refundAmount)}</strong></div>
            </div>
          )}

          <div className="admin-action-row">
            <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onUpdateStatus('ACTIVE')}>
              Mở user
            </button>
            <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => onUpdateStatus('LOCKED')}>
              Khóa user
            </button>
          </div>

          <form className="admin-form compact" onSubmit={(event) => event.preventDefault()}>
            <div className="admin-panel-head compact-head">
              <h3>Bulk trạng thái user</h3>
              <Shield size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <label>
              <span>User IDs</span>
              <textarea value={bulkStatusForm.ids} onChange={(event) => onBulkStatusFormChange((current) => ({ ...current, ids: event.target.value }))} rows="2" placeholder="VD: 1, 2, 3" />
            </label>
            <label>
              <span>Lý do</span>
              <textarea value={bulkStatusForm.reason} onChange={(event) => onBulkStatusFormChange((current) => ({ ...current, reason: event.target.value }))} rows="2" />
            </label>
            <div className="admin-action-row">
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onBulkStatusFormChange((current) => ({ ...current, ids: selectedUser ? String(selectedUser.id) : current.ids }))}>
                Dùng user đang chọn
              </button>
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onRunBulkUserStatus('ACTIVE')}>Bulk mở</button>
              <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => onRunBulkUserStatus('LOCKED')}>Bulk khóa</button>
            </div>
          </form>

          <form className="admin-form compact" onSubmit={onUpdateRole}>
            <div className="admin-panel-head compact-head">
              <h3>Vai trò</h3>
              <Shield size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <label>
              <span>Role</span>
              <select value={roleForm.role} onChange={(event) => onRoleFormChange((current) => ({ ...current, role: event.target.value }))}>
                {userRoles.map((role) => <option value={role} key={role}>{role}</option>)}
              </select>
            </label>
            <label>
              <span>Lý do</span>
              <textarea value={roleForm.reason} onChange={(event) => onRoleFormChange((current) => ({ ...current, reason: event.target.value }))} rows="2" />
            </label>
            <button type="submit" disabled={submitting}>
              <Save size={17} strokeWidth={2} aria-hidden="true" />
              <span>Lưu role</span>
            </button>
          </form>

          <form className="admin-form compact" onSubmit={onAdjustWallet}>
            <div className="admin-panel-head compact-head">
              <h3>Điều chỉnh ví</h3>
              <Wallet size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <label>
              <span>Loại</span>
              <select value={adjustForm.direction} onChange={(event) => onAdjustFormChange((current) => ({ ...current, direction: event.target.value }))}>
                <option value="CREDIT">Cộng tiền</option>
                <option value="DEBIT">Trừ tiền</option>
              </select>
            </label>
            <label>
              <span>Số tiền</span>
              <input value={adjustForm.amount} onChange={(event) => onAdjustFormChange((current) => ({ ...current, amount: event.target.value }))} inputMode="decimal" required />
            </label>
            <label>
              <span>Lý do</span>
              <textarea value={adjustForm.reason} onChange={(event) => onAdjustFormChange((current) => ({ ...current, reason: event.target.value }))} rows="3" required />
            </label>
            <label>
              <span>Mật khẩu xác nhận</span>
              <input value={adjustForm.confirmationPassword} onChange={(event) => onAdjustFormChange((current) => ({ ...current, confirmationPassword: event.target.value }))} type="password" required />
            </label>
            <button type="submit" disabled={submitting}>
              <Save size={17} strokeWidth={2} aria-hidden="true" />
              <span>Lưu điều chỉnh</span>
            </button>
          </form>

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
                {detailData.orders.length === 0 && <AdminEmptyState message="User chưa có đơn." />}
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
                {detailData.wallet.length === 0 && <AdminEmptyState message="User chưa có giao dịch ví." />}
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
                {detailData.tickets.length === 0 && <AdminEmptyState message="User chưa có ticket." />}
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
                {detailData.sessions.length === 0 && <AdminEmptyState message="User chưa có session." />}
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
                {detailData.audit.length === 0 && <AdminEmptyState message="Chưa có audit log liên quan." />}
              </div>
            )}
          </div>
        </>
      ) : (
        <AdminEmptyState message="Chọn một user để xem chi tiết." />
      )}
    </aside>
  )
}

export default UserDetailPanel
