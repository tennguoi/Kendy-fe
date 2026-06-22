import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  return (
    <div className="admin-grid two-columns">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>{t('admin.settings.twoFactor.title')}</h3>
          <button type="button" onClick={onBackupSettings} disabled={submitting}>Backup</button>
        </div>
        <div className="admin-panel-subsection">
          <div className="admin-panel-head compact-head">
            <h3>{t('admin.settings.twoFactor.admin2FA')}</h3>
            <AdminStatusBadge status={currentUser?.twoFactorEnabled ? 'ACTIVE' : 'DISABLED'} />
          </div>
          <p className="admin-empty-state">
            {currentUser?.twoFactorEnabled
              ? t('admin.settings.twoFactor.desc1')
              : t('admin.settings.twoFactor.desc2')}
          </p>
          {!currentUser?.twoFactorEnabled && (
            <form className="admin-form compact" onSubmit={enableEmailTwoFactor}>
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={onSendTwoFactorEnableCode}>
                {t('admin.settings.twoFactor.sendCode')}
              </button>
              {twoFactorEmailSent && (
                <label>
                  <span>{t('admin.settings.twoFactor.emailCode')}</span>
                  <input
                    value={twoFactorCode}
                    onChange={(event) => onSetTwoFactorCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    placeholder={t('admin.settings.twoFactor.codePlaceholder')}
                    required
                  />
                </label>
              )}
              {twoFactorEmailSent && (
                <button type="submit" disabled={submitting || twoFactorCode.length < 6}>
                  {t('admin.settings.twoFactor.confirm2FA')}
                </button>
              )}
            </form>
          )}
        </div>
        <div className="admin-check-row settings-row">
          <label>
            <input checked={twoFactorRequired} disabled={submitting} onChange={onToggleTwoFactor} type="checkbox" />
            <span>{t('admin.settings.twoFactor.require2FA')}</span>
          </label>
        </div>
      </div>
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>{t('admin.settings.system.title')}</h3>
          <span>{settings.length} key</span>
        </div>
        <div className="admin-filters single-filter">
          <SearchField value={settingSearch} onChange={(event) => onSetSettingSearch(event.target.value)} placeholder={t('admin.settings.system.searchKey')} />
        </div>
        <div className="admin-mini-list settings-key-list">
          {settings.map((setting) => (
            <article key={setting.key}>
              <strong>{setting.key}</strong>
              <span>{setting.value || t('admin.settings.system.emptyValue')} · {setting.publicSetting ? 'public' : 'private'}</span>
            </article>
          ))}
        </div>
        <details className="settings-advanced">
          <summary>Lịch sử và khôi phục nâng cao</summary>
          <div className="settings-advanced-content">
            <form className="admin-form compact" onSubmit={loadSettingHistory}>
              <div className="admin-panel-head compact-head">
                <h3>Lịch sử thay đổi</h3>
              </div>
              <label>
                <span>Setting key</span>
                <input value={settingHistoryKey} onChange={(event) => onSetSettingHistoryKey(event.target.value)} placeholder={t('admin.settings.system.keyPlaceholder')} />
              </label>
              <button type="submit" disabled={submitting}>{t('admin.settings.system.loadHistory')}</button>
            </form>
            <div className="admin-mini-list">
              {settingHistory.map((item) => (
                <article key={item.id}>
                  <strong>{item.key}</strong>
                  <span>{item.oldValue || t('admin.settings.system.emptyValue')} {'->'} {item.newValue || t('admin.settings.system.emptyValue')} · {formatAdminDate(item.createdAt)}</span>
                </article>
              ))}
            </div>
            <form className="admin-form compact settings-restore-form" onSubmit={onRestoreSettingsFromText}>
              <div className="admin-panel-head compact-head">
                <h3>Khôi phục từ JSON</h3>
              </div>
              <label>
                <span>JSON</span>
                <textarea value={restoreText} onChange={(event) => onSetRestoreText(event.target.value)} rows="6" />
              </label>
              <button type="submit" className="admin-danger-button" disabled={submitting}>Khôi phục</button>
            </form>
          </div>
        </details>
      </div>
    </div>
  )
}

export default SettingsTab
