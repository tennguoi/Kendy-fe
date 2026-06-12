import { Save } from 'lucide-react'
import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate } from '../../adminFormat'

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
              <AdminStatusBadge status={selectedAdmin.status} />
            </div>
            <label>
              <span>Legacy role</span>
              <select value={adminEditor.legacyRole} onChange={(event) => onSetAdminEditor((current) => ({ ...current, legacyRole: event.target.value }))}>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </label>
            <label>
              <span>Lý do</span>
              <textarea value={adminEditor.reason} onChange={(event) => onSetAdminEditor((current) => ({ ...current, reason: event.target.value }))} rows="2" />
            </label>
            <div className="admin-check-row settings-row">
              {roles.map((role) => (
                <label key={role.id}>
                  <input
                    checked={adminEditor.roleIds.includes(role.id)}
                    onChange={() => onSetAdminEditor((current) => ({
                      ...current,
                      roleIds: current.roleIds.includes(role.id)
                        ? current.roleIds.filter((id) => id !== role.id)
                        : [...current.roleIds, role.id],
                    }))}
                    type="checkbox"
                  />
                  <span>{role.name}</span>
                </label>
              ))}
            </div>
            <div className="admin-check-row settings-row">
              {permissions.map((permission) => (
                <label key={permission.id}>
                  <input
                    checked={adminEditor.permissionCodes.includes(permission.code)}
                    onChange={() => onSetAdminEditor((current) => ({
                      ...current,
                      permissionCodes: current.permissionCodes.includes(permission.code)
                        ? current.permissionCodes.filter((code) => code !== permission.code)
                        : [...current.permissionCodes, permission.code],
                    }))}
                    type="checkbox"
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
            <select value={selectedRoleId || ''} onChange={(event) => onSelectRoleForEdit(event.target.value ? Number(event.target.value) : null)}>
              <option value="">Tạo role mới</option>
              {roles.map((role) => <option value={role.id} key={role.id}>{role.name}</option>)}
            </select>
            {selectedRole && !selectedRole.system && (
              <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={onDeleteRole}>Xóa role</button>
            )}
          </div>
          <label>
            <span>Tên role</span>
            <input value={roleDraft.name} onChange={(event) => onSetRoleDraft((current) => ({ ...current, name: event.target.value }))} required />
          </label>
          <label>
            <span>Mô tả</span>
            <textarea value={roleDraft.description} onChange={(event) => onSetRoleDraft((current) => ({ ...current, description: event.target.value }))} rows="2" />
          </label>
          <div className="admin-check-row settings-row">
            {permissions.map((permission) => (
              <label key={permission.id}>
                <input checked={roleDraft.permissionIds.includes(permission.id)} onChange={() => onTogglePermission(permission.id)} type="checkbox" />
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
              <input value={adminEditor.verificationCode} onChange={(event) => onSetAdminEditor((current) => ({ ...current, verificationCode: event.target.value.trim() }))} />
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
