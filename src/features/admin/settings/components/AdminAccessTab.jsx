import { Save } from 'lucide-react'
import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate } from '../../adminFormat'
import BaseInput from '../../../../components/ui/BaseInput'
import BaseSelect from '../../../../components/ui/BaseSelect'
import BaseTextarea from '../../../../components/ui/BaseTextarea'
import { composeValidators, isRequired, validateRequired } from '../../../../utils/validation'

function AdminAccessTab({
  adminEditor,
  adminSessions,
  admins,
  onDeleteRole,
  onRevokeAdminSession,
  onRunAdminTwoFactor,
  onSaveAdminAccess,
  onSaveRole,
  onSelectAdmin,
  onSelectRoleForEdit,
  onSetAdminEditor,
  onSetAdminStatus,
  onSetRoleDraft,
  onTogglePermission,
  permissions,
  roleDraft,
  roles,
  selectedAdmin,
  selectedRole,
  selectedRoleId,
  submitting,
  totpSetup,
}) {
  // Validation functions
    const validateRoleName = composeValidators(isRequired);

  return (
    <div className="admin-grid two-columns">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Admins</h3>
          <span>{admins.length} admin</span>
        </div>
        <div className="admin-mini-list">
          {admins.map((admin) => (
            <article key={admin.id}>
              <strong>{admin.name || admin.email}</strong>
              <span>{admin.email} · {admin.role} · {admin.status}</span>
              <button type="button" className="admin-icon-button slim" onClick={() => onSelectAdmin(admin.id)}>
                Chọn
              </button>
            </article>
          ))}
          {admins.length === 0 && <AdminEmptyState message="Chưa có admin." />}
        </div>
        {selectedAdmin && (
          <form className="admin-form compact" onSubmit={onSaveAdminAccess}>
            <div className="admin-panel-head compact-head">
              <h3>{selectedAdmin.email}</h3>
              <AdminStatusBadge status={selectedAdmin.status} type="user" />
            </div>
            <label>
              <span>Legacy role</span>
              <BaseSelect
                value={adminEditor.legacyRole}
                onChange={(value) => onSetAdminEditor((current) => ({ ...current, legacyRole: value }))}
                options={[
                  { value: 'ADMIN', label: 'ADMIN' },
                  { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN' }
                ]}
                placeholder="Chọn role"
              />
            </label>
            <label>
              <span>Lý do</span>
              <BaseTextarea
                value={adminEditor.reason}
                onChange={(value) => onSetAdminEditor((current) => ({ ...current, reason: value }))}
                rows="2"
              />
            </label>
            <div className="admin-check-row settings-row">
              {roles.map((role) => (
                <label key={role.id}>
                  <BaseInput
                    type="checkbox"
                    checked={adminEditor.roleIds.includes(role.id)}
                    onChange={() => onSetAdminEditor((current) => {
                      const roleIds = current.roleIds.includes(role.id)
                        ? current.roleIds.filter((id) => id !== role.id)
                        : [...current.roleIds, role.id];
                      return { ...current, roleIds };
                    })}
                  />
                  <span>{role.name}</span>
                </label>
              ))}
            </div>
            <div className="admin-check-row settings-row">
              {permissions.map((permission) => (
                <label key={permission.id}>
                  <BaseInput
                    type="checkbox"
                    checked={adminEditor.permissionCodes.includes(permission.code)}
                    onChange={() => onSetAdminEditor((current) => {
                      const permissionCodes = current.permissionCodes.includes(permission.code)
                        ? current.permissionCodes.filter((code) => code !== permission.code)
                        : [...current.permissionCodes, permission.code];
                      return { ...current, permissionCodes };
                    })}
                  />
                  <span>{permission.code}</span>
                </label>
              ))}
            </div>
            <div className="admin-action-row">
              <button type="submit" disabled={submitting}>Lưu quyền</button>
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onSetAdminStatus('ACTIVE')}>Mở khóa</button>
              <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => onSetAdminStatus('LOCKED')}>Khóa</button>
            </div>
          </form>
        )}
      </div>
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Roles & permissions</h3>
          <span>{roles.length} role · {permissions.length} permission</span>
        </div>
        <form className="admin-form compact" onSubmit={onSaveRole}>
          <div className="admin-action-row">
            <BaseSelect
              value={selectedRoleId || ''}
              onChange={(value) => onSelectRoleForEdit(value ? Number(value) : null)}
              options={[
                { value: '', label: 'Tạo role mới' },
                ...roles.map((role) => ({ value: role.id, label: role.name }))
              ]}
              placeholder="Chọn role hoặc tạo mới"
            />
            {selectedRole && !selectedRole.system && (
              <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={onDeleteRole}>
                Xóa role
              </button>
            )}
          </div>
          <label>
            <span>Tên role</span>
            <BaseInput
              value={roleDraft.name}
              onChange={(value) => onSetRoleDraft((current) => ({ ...current, name: value }))}
              validators={[validateRoleName]}
              errorMessage="Tên role là bắt buộc"
              required
            />
          </label>
          <label>
            <span>Mô tả</span>
            <BaseTextarea
              value={roleDraft.description}
              onChange={(value) => onSetRoleDraft((current) => ({ ...current, description: value }))}
              rows="2"
            />
          </label>
          <div className="admin-check-row settings-row">
            {permissions.map((permission) => (
              <label key={permission.id}>
                <BaseInput
                  type="checkbox"
                  checked={roleDraft.permissionIds.includes(permission.id)}
                  onChange={() => onTogglePermission(permission.id)}
                />
                <span>{permission.code}</span>
              </label>
            ))}
          </div>
          <button type="submit" disabled={submitting || selectedRole?.system}>
            <Save size={17} strokeWidth={2} aria-hidden="true" />
            <span>{selectedRole ? 'Lưu role' : 'Tạo role'}</span>
          </button>
        </form>
        <div className="admin-mini-list">
          {roles.map((role) => (
            <article key={role.id || role.name}>
              <strong>{role.name}</strong>
              <span>{role.description || 'Không có mô tả'} · {(role.permissions || []).join(', ') || 'Chưa có permission'}</span>
            </article>
          ))}
        </div>
      </div>
      {selectedAdmin && (
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Admin 2FA</h3>
            <AdminStatusBadge status={selectedAdmin.twoFactorEnabled ? 'ACTIVE' : 'DISABLED'} />
          </div>
          <div className="admin-action-row">
            <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onRunAdminTwoFactor('setup')}>Setup</button>
            <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onRunAdminTwoFactor('reset')}>Reset</button>
            <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => onRunAdminTwoFactor('disable')}>Disable</button>
          </div>
          {totpSetup && (
            <div className="admin-code-block">
              <strong>Secret</strong>
              <pre>{totpSetup.secret}</pre>
              {totpSetup.qrCodeBase64 && <img alt="Admin 2FA QR" src={`data:image/png;base64,${totpSetup.qrCodeBase64}`} />}
              <pre>{(totpSetup.backupCodes || []).join('\n')}</pre>
            </div>
          )}
          <form className="admin-form compact" onSubmit={(event) => { event.preventDefault(); onRunAdminTwoFactor('enable') }}>
            <label>
              <span>Mã xác thực</span>
              <BaseInput
                value={adminEditor.verificationCode}
                onChange={(value) => onSetAdminEditor((current) => ({ ...current, verificationCode: value.trim() }))}
                validators={[validateRequired]}
                errorMessage="Mã xác thực là bắt buộc"
              />
            </label>
            <button type="submit" disabled={submitting || !adminEditor.verificationCode}>Enable 2FA</button>
          </form>
        </div>
      )}
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Admin sessions</h3>
          <span>{adminSessions.length} session</span>
        </div>
        <div className="admin-mini-list">
          {adminSessions.map((session) => (
            <article key={session.id}>
              <strong>Session #{session.id}</strong>
              <span>Tạo {formatAdminDate(session.createdAt)} · Hết hạn {formatAdminDate(session.expiresAt)}</span>
              <button type="button" className="admin-danger-button slim" disabled={submitting || session.revokedAt} onClick={() => onRevokeAdminSession(session.id)}>
                Thu hồi
              </button>
            </article>
          ))}
          {adminSessions.length === 0 && <AdminEmptyState message="Admin chưa có session." />}
        </div>
      </div>
    </div>
  )
}

export default AdminAccessTab
