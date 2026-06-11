import { Save, Shield, Wallet } from 'lucide-react'
import { userRoles } from '../users.constants'

function UserAdminTools({
  adjustForm,
  bulkStatusForm,
  onAdjustFormChange,
  onAdjustWallet,
  onBulkStatusFormChange,
  onRoleFormChange,
  onRunBulkUserStatus,
  onUpdateRole,
  onUpdateStatus,
  roleForm,
  selectedUser,
  submitting,
}) {
  return (
    <details className="user-tools-panel">
      <summary>
        <div>
          <strong>Công cụ quản trị</strong>
          <span>Khóa/mở user, đổi role, điều chỉnh ví</span>
        </div>
      </summary>

      <div className="user-tools-body">
        <section className="user-tool-section">
          <div className="user-tool-head">
            <Shield size={18} strokeWidth={2} aria-hidden="true" />
            <strong>Trạng thái</strong>
          </div>
          <div className="admin-action-row">
            <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onUpdateStatus('ACTIVE')}>
              Mở user
            </button>
            <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => onUpdateStatus('LOCKED')}>
              Khóa user
            </button>
          </div>
        </section>

        <form className="admin-form compact user-tool-section" onSubmit={(event) => event.preventDefault()}>
          <div className="user-tool-head">
            <Shield size={18} strokeWidth={2} aria-hidden="true" />
            <strong>Bulk trạng thái</strong>
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

        <form className="admin-form compact user-tool-section" onSubmit={onUpdateRole}>
          <div className="user-tool-head">
            <Shield size={18} strokeWidth={2} aria-hidden="true" />
            <strong>Vai trò</strong>
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

        <form className="admin-form compact user-tool-section" onSubmit={onAdjustWallet}>
          <div className="user-tool-head">
            <Wallet size={18} strokeWidth={2} aria-hidden="true" />
            <strong>Điều chỉnh ví</strong>
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
      </div>
    </details>
  )
}

export default UserAdminTools
