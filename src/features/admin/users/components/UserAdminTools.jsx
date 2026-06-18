import { Eye, EyeOff, Lock, Save, Shield, Unlock, UserRoundCog, Wallet, X } from 'lucide-react'
import { useState } from 'react'
import { userRoles, userRoleLabels } from '../users.constants'

const userToolTabs = [
  { id: 'bulk', label: 'Bulk', icon: Shield },
  { id: 'role', label: 'Vai trò', icon: UserRoundCog },
  { id: 'wallet', label: 'Ví', icon: Wallet },
]

function UserAdminTools({
  activeToolTab,
  adjustForm,
  bulkStatusForm,
  onActiveToolTabChange,
  onAdjustFormChange,
  onAdjustWallet,
  onBulkStatusFormChange,
  onRoleFormChange,
  onRunBulkUserStatus,
  onUpdateRole,
  onClose,
  roleForm,
  selectedUser,
  submitting,
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <section className="admin-panel user-tools-panel">
      <div className="admin-panel-head">
        <div>
          <h3>Công cụ quản trị user</h3>
          <span>{selectedUser?.email || 'User đang chọn'}</span>
        </div>
        <button type="button" onClick={onClose}><X size={16} /> Đóng</button>
      </div>
      <div className="user-tool-tabs" role="tablist" aria-label="Công cụ quản trị user">
        {userToolTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              type="button"
              className={activeToolTab === tab.id ? 'active' : ''}
              key={tab.id}
              role="tab"
              aria-selected={activeToolTab === tab.id}
              onClick={() => onActiveToolTabChange(tab.id)}
            >
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
      <div className="user-tools-body">
        {activeToolTab === 'bulk' && (
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
            <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onRunBulkUserStatus('ACTIVE')}>
              <Unlock size={16} /> Mở
            </button>
            <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => onRunBulkUserStatus('LOCKED')}>
              <Lock size={16} /> Khóa
            </button>
          </div>
        </form>
        )}

        {activeToolTab === 'role' && (
        <form className="admin-form compact user-tool-section" id="user-role-form" onSubmit={onUpdateRole}>
          <div className="user-tool-head">
            <UserRoundCog size={18} strokeWidth={2} aria-hidden="true" />
            <strong>Vai trò</strong>
          </div>
          <label>
            <span>Role</span>
            <select value={roleForm.role} onChange={(event) => onRoleFormChange((current) => ({ ...current, role: event.target.value }))}>
              {userRoles.map((role) => <option value={role} key={role}>{userRoleLabels[role] || role}</option>)}
            </select>
          </label>
          <label>
            <span>Lý do</span>
            <textarea value={roleForm.reason} onChange={(event) => onRoleFormChange((current) => ({ ...current, reason: event.target.value }))} rows="2" />
          </label>
          <button type="submit" className="admin-primary-button" disabled={submitting}>
            <Save size={16} /> Lưu vai trò
          </button>
        </form>
        )}

        {activeToolTab === 'wallet' && (
        <form className="admin-form compact user-tool-section" id="user-wallet-form" onSubmit={onAdjustWallet}>
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
            <input
              type="number"
              value={adjustForm.amount}
              onChange={(event) => onAdjustFormChange((current) => ({ ...current, amount: event.target.value }))}
              inputMode="decimal"
              min="0"
              step="any"
              autoComplete="off"
              required
            />
          </label>
          <label>
            <span>Lý do</span>
            <textarea value={adjustForm.reason} onChange={(event) => onAdjustFormChange((current) => ({ ...current, reason: event.target.value }))} rows="3" required />
          </label>
          <label>
            <span>Mật khẩu xác nhận</span>
            <span className="user-password-control">
              <input
                value={adjustForm.confirmationPassword}
                onChange={(event) => onAdjustFormChange((current) => ({ ...current, confirmationPassword: event.target.value }))}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Eye size={18} strokeWidth={2} aria-hidden="true" />
                )}
              </button>
            </span>
          </label>
          <button type="submit" className="admin-primary-button" disabled={submitting}>
            <Save size={16} /> Lưu điều chỉnh ví
          </button>
        </form>
        )}
      </div>
    </section>
  )
}

export default UserAdminTools
