import { AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate } from '../../adminFormat'
import SearchField from '../../../../components/SearchField/SearchField'

function SettingsTab({
  currentUser,
  enableEmailTwoFactor,
  onBackupSettings,
  onRestoreSettingsFromText,
  onSendTwoFactorEnableCode,
  onSetRestoreText,
  onSetSettingHistoryKey,
  onSetSettingSearch,
  onSetTwoFactorCode,
  onToggleTwoFactor,
  restoreText,
  settingHistory,
  settingHistoryKey,
  settingSearch,
  settings,
  submitting,
  twoFactorCode,
  twoFactorEmailSent,
  twoFactorRequired,
  loadSettingHistory,
}) {
  return (
    <div className="admin-grid two-columns">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Bảo mật</h3>
          <button type="button" onClick={onBackupSettings} disabled={submitting}>Backup</button>
        </div>
        <div className="admin-panel-subsection">
          <div className="admin-panel-head compact-head">
            <h3>2FA tài khoản admin</h3>
            <AdminStatusBadge status={currentUser?.twoFactorEnabled ? 'ACTIVE' : 'DISABLED'} />
          </div>
          <p className="admin-empty-state">
            {currentUser?.twoFactorEnabled
              ? 'Tài khoản này sẽ nhận mã email ở mỗi lần đăng nhập.'
              : 'Bật 2FA sẽ gửi mã xác thực qua email và yêu cầu mã này ở mỗi lần đăng nhập.'}
          </p>
          {!currentUser?.twoFactorEnabled && (
            <form className="admin-form compact" onSubmit={enableEmailTwoFactor}>
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={onSendTwoFactorEnableCode}>
                Gửi mã xác thực
              </button>
              {twoFactorEmailSent && (
                <label>
                  <span>Mã email</span>
                  <input
                    value={twoFactorCode}
                    onChange={(event) => onSetTwoFactorCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    placeholder="Nhập mã 6 số"
                    required
                  />
                </label>
              )}
              {twoFactorEmailSent && (
                <button type="submit" disabled={submitting || twoFactorCode.length < 6}>
                  Xác nhận bật 2FA
                </button>
              )}
            </form>
          )}
        </div>
        <div className="admin-check-row settings-row">
          <label>
            <input checked={twoFactorRequired} disabled={submitting} onChange={onToggleTwoFactor} type="checkbox" />
            <span>Policy: yêu cầu admin dùng 2FA khi truy cập admin</span>
          </label>
        </div>
      </div>
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>System settings</h3>
          <span>{settings.length} key</span>
        </div>
        <div className="admin-filters single-filter">
          <SearchField value={settingSearch} onChange={(event) => onSetSettingSearch(event.target.value)} placeholder="Tìm setting key" />
        </div>
        <div className="admin-mini-list">
          {settings.map((setting) => (
            <article key={setting.key}>
              <strong>{setting.key}</strong>
              <span>{setting.value || 'Trống'} · {setting.publicSetting ? 'public' : 'private'}</span>
            </article>
          ))}
        </div>
        <form className="admin-form compact" onSubmit={loadSettingHistory}>
          <div className="admin-panel-head compact-head">
            <h3>Setting history</h3>
          </div>
          <label>
            <span>Setting key</span>
            <input value={settingHistoryKey} onChange={(event) => onSetSettingHistoryKey(event.target.value)} placeholder="VD: admin_2fa_required" />
          </label>
          <button type="submit" disabled={submitting}>Tải history</button>
        </form>
        <div className="admin-mini-list">
          {settingHistory.map((item) => (
            <article key={item.id}>
              <strong>{item.key}</strong>
              <span>{item.oldValue || 'Trống'} {'->'} {item.newValue || 'Trống'} · {formatAdminDate(item.createdAt)}</span>
            </article>
          ))}
        </div>
        <form className="admin-form compact" onSubmit={onRestoreSettingsFromText}>
          <div className="admin-panel-head compact-head">
            <h3>Restore settings</h3>
          </div>
          <label>
            <span>JSON</span>
            <textarea value={restoreText} onChange={(event) => onSetRestoreText(event.target.value)} rows="6" />
          </label>
          <button type="submit" className="admin-danger-button" disabled={submitting}>Restore</button>
        </form>
      </div>
    </div>
  )
}

export default SettingsTab
