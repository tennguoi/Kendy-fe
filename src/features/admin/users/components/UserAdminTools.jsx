import { Eye, EyeOff, Lock, Save, Shield, Unlock, UserRoundCog, Wallet, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { userRoles, userRoleLabels } from '../users.constants'
import BaseInput from '../../../../components/ui/BaseInput'
import BaseSelect from '../../../../components/ui/BaseSelect'
import BaseTextarea from '../../../../components/ui/BaseTextarea'
import { isRequired, composeValidators } from '../../../../utils/validation'


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
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)

  const validateRequired = composeValidators(isRequired)

  const userToolTabs = useMemo(() => [
    { id: 'bulk', label: 'Bulk', icon: Shield },
    { id: 'role', label: t('admin.users.detail.roles'), icon: UserRoundCog },
    { id: 'wallet', label: t('admin.users.detail.wallet'), icon: Wallet },
  ], [t])

  return (
    <section className="admin-panel user-tools-panel">
      <div className="admin-panel-head">
        <div>
          <h3>{t('admin.users.detail.toolsLabel')}</h3>
          <span>{selectedUser?.email || t('admin.users.detail.toolsLabel')}</span>
        </div>
        <button type="button" onClick={onClose}><X size={16} /> Đóng</button>
      </div>
      <div className="user-tool-tabs" role="tablist" aria-label={t('admin.users.detail.toolsLabel')}>
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
              <BaseTextarea
                value={bulkStatusForm.ids}
                onChange={(event) => onBulkStatusFormChange((current) => ({ ...current, ids: event.target.value }))}
                rows="2"
                placeholder={t('admin.users.detail.bulkPlaceholder')}
                validators={[validateRequired]}
                errorMessage={t('admin.users.detail.bulkRequired', { defaultValue: 'Vui lòng nhập ít nhất một ID người dùng' })}
              />
            </label>
            <label>
              <span>Lý do</span>
              <BaseTextarea
                value={bulkStatusForm.reason}
                onChange={(event) => onBulkStatusFormChange((current) => ({ ...current, reason: event.target.value }))}
                rows="2"
                validators={[validateRequired]}
                errorMessage={t('admin.users.detail.bulkReasonRequired', { defaultValue: 'Lý do là bắt buộc' })}
              />
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
              <strong>{t('admin.users.detail.roles')}</strong>
            </div>
            <label>
              <span>Role</span>
              <BaseSelect
                value={roleForm.role}
                onChange={(value) => onRoleFormChange((current) => ({ ...current, role: value }))}
                options={userRoles.map((role) => ({ value: role, label: userRoleLabels[role] || role }))}
                placeholder={t('admin.users.detail.selectRole', { defaultValue: 'Chọn vai trò' })}
                validators={[validateRequired]}
                errorMessage={t('admin.users.detail.roleRequired', { defaultValue: 'Vai trò là bắt buộc' })}
              />
            </label>
            <label>
              <span>Lý do</span>
              <BaseTextarea
                value={roleForm.reason}
                onChange={(event) => onRoleFormChange((current) => ({ ...current, reason: event.target.value }))}
                rows="2"
                validators={[validateRequired]}
                errorMessage={t('admin.users.detail.roleReasonRequired', { defaultValue: 'Lý do thay đổi vai trò là bắt buộc' })}
              />
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
              <strong>{t('admin.users.detail.wallet')}</strong>
            </div>
            <label>
              <span>Loại</span>
              <BaseSelect
                value={adjustForm.direction}
                onChange={(value) => onAdjustFormChange((current) => ({ ...current, direction: value }))}
                options={[
                  { value: 'CREDIT', label: 'Cộng tiền' },
                  { value: 'DEBIT', label: 'Trừ tiền' }
                ]}
                placeholder={t('admin.users.detail.selectWalletAction', { defaultValue: 'Chọn hành động ví' })}
                validators={[validateRequired]}
                errorMessage={t('admin.users.detail.walletActionRequired', { defaultValue: 'Hành động ví là bắt buộc' })}
              />
            </label>
            <label>
              <span>Số tiền</span>
              <BaseInput
                type="number"
                value={adjustForm.amount}
                onChange={(event) => onAdjustFormChange((current) => ({ ...current, amount: event.target.value }))}
                inputMode="decimal"
                min="0"
                step="any"
                autoComplete="off"
                validators={[validateRequired]}
                errorMessage={t('admin.users.detail.walletAmountRequired', { defaultValue: 'Số tiền là bắt buộc' })}
              />
            </label>
            <label>
              <span>Lý do</span>
              <BaseTextarea
                value={adjustForm.reason}
                onChange={(event) => onAdjustFormChange((current) => ({ ...current, reason: event.target.value }))}
                rows="3"
                validators={[validateRequired]}
                errorMessage={t('admin.users.detail.walletReasonRequired', { defaultValue: 'Lý do thay đổi ví là bắt buộc' })}
              />
            </label>
            <label>
              <span>Mật khẩu xác nhận</span>
              <span className="user-password-control">
                <BaseInput
                  value={adjustForm.confirmationPassword}
                  onChange={(event) => onAdjustFormChange((current) => ({ ...current, confirmationPassword: event.target.value }))}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  validators={[validateRequired]}
                  errorMessage={t('admin.users.detail.walletPasswordRequired', { defaultValue: 'Mật khẩu xác nhận là bắt buộc' })}
                />
                <button
                  type="button"
                  aria-label={showPassword ? t('admin.users.detail.hidePassword') : t('admin.users.detail.showPassword')}
                  title={showPassword ? t('admin.users.detail.hidePassword') : t('admin.users.detail.showPassword')}
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