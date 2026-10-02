import { ChevronDown, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../api/admin.api'
import AdminAccessTab from './components/AdminAccessTab'
import AuditTab from './components/AuditTab'
import BrandTab from './components/BrandTab'
import FilesTab from './components/FilesTab'
import GuideTab from './components/GuideTab'
import HealthTab from './components/HealthTab'
import JobsTab from './components/JobsTab'
import LanguageTab from './components/LanguageTab'
import NotificationsTab from './components/NotificationsTab'
import OperationsTab from './components/OperationsTab'
import SettingsTab from './components/SettingsTab'
import WebhooksTab from './components/WebhooksTab'
import { useAdminAccess } from './hooks/useAdminAccess'
import { useAdminFiles } from './hooks/useAdminFiles'
import { useAdminJobs } from './hooks/useAdminJobs'
import { useAdminNotifications } from './hooks/useAdminNotifications'
import { useAuditSettings } from './hooks/useAuditSettings'
import { useSepaySettings } from './hooks/useSepaySettings'
import { useSystemSettings } from './hooks/useSystemSettings'
import { settingsGroups, settingsTabs } from './settings.constants'
import { mergeSettings, sepayConfigToObject } from './settings.utils'
import { resolveAdminError } from '../adminErrorResolver'

function AdminSettingsView({
  currentUser,
  onCurrentUserChange,
  onSetError,
  onSetNotice,
  token,
}) {
  const [activeTab, setActiveTab] = useState('settings')
  const [openSettingsGroup, setOpenSettingsGroup] = useState(null)
  const settingsNavRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [health, setHealth] = useState(null)

  const { t } = useTranslation()

  const setViewError = useCallback((error, fallback = '') => {
    if (!error) return
    onSetError(resolveAdminError(error, fallback))
  }, [onSetError])

  const systemSettings = useSystemSettings({
    currentUser,
    onCurrentUserChange,
    onSetNotice,
    setSubmitting,
    setViewError,
    token,
  })

  const loadSettingsRef = useRef(null)
  const refreshSettings = useCallback((...args) => loadSettingsRef.current?.(...args), [])

  const sepaySettings = useSepaySettings({
    loadSettings: refreshSettings,
    onSetNotice,
    setSubmitting,
    setViewError,
    token,
  })

  const adminAccess = useAdminAccess({
    loadSettings: refreshSettings,
    onSetNotice,
    setSubmitting,
    setViewError,
    token,
  })

  const auditSettings = useAuditSettings({
    onSetNotice,
    setSubmitting,
    setViewError,
    token,
  })

  const adminFiles = useAdminFiles({
    onSetNotice,
    setSubmitting,
    setViewError,
    token,
  })

  const adminJobs = useAdminJobs({
    loadSettings: refreshSettings,
    onSetNotice,
    setSubmitting,
    setViewError,
    token,
  })

  const notifications = useAdminNotifications({
    loadSettings: refreshSettings,
    onSetNotice,
    setSubmitting,
    setViewError,
    token,
  })

  const loadSettings = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    try {
      const [
        settingsData,
        sepayStatusData,
        sepayLogsData,
        sepayConfigData,
        notificationData,
        notificationItems,
        adminsData,
        rolesData,
        permissionsData,
        jobsData,
        healthData,
      ] = await Promise.all([
        adminApi.searchSettings({ query: systemSettings.settingSearch.trim() }, token),
        adminApi.getSepayStatus(token),
        adminApi.getSepayLogs(token),
        adminApi.getSepayConfig(token),
        adminApi.getNotificationSettings(token),
        adminApi.getAdminNotifications(token),
        adminApi.getAdmins(token),
        adminApi.getRoles(token),
        adminApi.getPermissions(token),
        adminApi.getJobs(token),
        adminApi.getHealth(token),
      ])

      systemSettings.setSettings(settingsData)
      sepaySettings.setSepayStatus(sepayStatusData)
      sepaySettings.setSepayLogs(sepayLogsData)
      sepaySettings.setSepayConfigText(JSON.stringify(sepayConfigToObject(sepayConfigData), null, 2))
      notifications.setNotificationSetting(notificationData)
      notifications.setNotifications(notificationItems)
      adminAccess.setAdmins(adminsData)
      adminAccess.setRoles(rolesData)
      adminAccess.setPermissions(permissionsData)
      adminJobs.setJobs(jobsData)
      setHealth(healthData)
      adminAccess.setSelectedAdminId((current) => (current && adminsData.some((admin) => admin.id === current) ? current : adminsData[0]?.id || null))
    } catch (err) {
      const msg = resolveAdminError(err, t('admin.settings.loadError'))
      onSetError(msg)
    } finally {
      setLoading(false)
    }
  }, [
    adminAccess,
    adminJobs,
    notifications,
    onSetError,
    sepaySettings,
    systemSettings,
    token,
    t,
  ])

  useEffect(() => {
    loadSettingsRef.current = loadSettings
  }, [loadSettings])

  useEffect(() => {
    const timer = window.setTimeout(loadSettings, 250)
    return () => window.clearTimeout(timer)
  }, [loadSettings])

  useEffect(() => {
    if (!openSettingsGroup) return undefined

    const closeDropdown = (event) => {
      if (settingsNavRef.current && !settingsNavRef.current.contains(event.target)) {
        setOpenSettingsGroup(null)
      }
    }

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpenSettingsGroup(null)
    }

    document.addEventListener('mousedown', closeDropdown)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeDropdown)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [openSettingsGroup])

  const activeTabMeta = settingsTabs.find((tab) => tab.id === activeTab) || settingsTabs[0]
  const activeGroupId = activeTabMeta.group

  return (
    <section className="admin-view settings-view">
      <div className="admin-toolbar settings-toolbar">
        <div>
          <h2>{t('admin.settings.title')}</h2>
          <p>{t('admin.settings.description')}</p>
        </div>
        <button type="button" className="admin-icon-button" onClick={loadSettings} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>{t('admin.common.reload')}</span>
        </button>
      </div>

      {loading && (
        <p className="admin-message">
          {t('admin.settings.loading')}
        </p>
      )}

      <div className="settings-layout">
        <nav className="settings-rail" aria-label={t('admin.settings.settingsGroup')} ref={settingsNavRef}>
          {settingsGroups.map((group) => {
            const groupTabs = settingsTabs.filter((tab) => tab.group === group.id)
            const isOpen = openSettingsGroup === group.id
            const isActive = activeGroupId === group.id

            return (
              <div className={`settings-nav-group ${isOpen ? 'open' : ''}`} key={group.id}>
                <button
                  type="button"
                  className={`settings-group-trigger ${isActive ? 'active' : ''}`}
                  onClick={() => setOpenSettingsGroup((current) => (current === group.id ? null : group.id))}
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                >
                  <span>{group.label}</span>
                  <ChevronDown size={15} strokeWidth={2.2} aria-hidden="true" />
                </button>

                {isOpen && (
                  <div className="settings-dropdown" role="menu">
                    {groupTabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          type="button"
                          className={`settings-dropdown-item ${activeTab === tab.id ? 'active' : ''}`}
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id)
                            setOpenSettingsGroup(null)
                          }}
                          aria-current={activeTab === tab.id ? 'page' : undefined}
                          role="menuitem"
                        >
                          {Icon && <Icon size={17} className="menu-icon" strokeWidth={2.2} aria-hidden="true" />}
                          <span>
                            <strong>{t(`admin.settings.tabs.${tab.id}`, { defaultValue: tab.label })}</strong>
                            <small>{tab.description}</small>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="settings-main">
          <div className="settings-section-head">
            <div>
              <span>{activeTabMeta.kicker || t('admin.common.system')}</span>
              <h3>{t(`admin.settings.tabTitle.${activeTabMeta.id}`, { defaultValue: activeTabMeta.title || activeTabMeta.label })}</h3>
            </div>
            {activeTabMeta.description && <p>{activeTabMeta.description}</p>}
          </div>

          <div className="settings-content">
            {activeTab === 'settings' && (
              <SettingsTab
                currentUser={currentUser}
                enableEmailTwoFactor={systemSettings.enableEmailTwoFactor}
                loadSettingHistory={systemSettings.loadSettingHistory}
                onBackupSettings={systemSettings.backupSettings}
                onRestoreSettingsFromText={systemSettings.restoreSettingsFromText}
                onSendTwoFactorEnableCode={systemSettings.sendTwoFactorEnableCode}
                onSetRestoreText={systemSettings.setRestoreText}
                onSetSettingHistoryKey={systemSettings.setSettingHistoryKey}
                onSetSettingSearch={systemSettings.setSettingSearch}
                onSetTwoFactorCode={systemSettings.setTwoFactorCode}
                onToggleTwoFactor={systemSettings.toggleTwoFactor}
                restoreText={systemSettings.restoreText}
                settingHistory={systemSettings.settingHistory}
                settingHistoryKey={systemSettings.settingHistoryKey}
                settingSearch={systemSettings.settingSearch}
                settings={systemSettings.settings}
                submitting={submitting}
                twoFactorCode={systemSettings.twoFactorCode}
                twoFactorEmailSent={systemSettings.twoFactorEmailSent}
                twoFactorRequired={systemSettings.twoFactorRequired}
              />
            )}

            {activeTab === 'webhooks' && (
              <WebhooksTab
                onRetryFormChange={(patch) => sepaySettings.setRetryForm((current) => ({ ...current, ...patch }))}
                onSaveSepayConfig={sepaySettings.saveSepayConfig}
                onSetSepayConfigText={sepaySettings.setSepayConfigText}
                retryForm={sepaySettings.retryForm}
                retryWebhook={sepaySettings.retryWebhook}
                sepayConfigText={sepaySettings.sepayConfigText}
                sepayLogs={sepaySettings.sepayLogs}
                sepayStatus={sepaySettings.sepayStatus}
                submitting={submitting}
              />
            )}

            {activeTab === 'operations' && (
              <OperationsTab
                onSaved={(savedSettings) => systemSettings.setSettings((current) => mergeSettings(current, savedSettings))}
                onSetError={setViewError}
                onSetNotice={onSetNotice}
                settingsMap={systemSettings.settingsMap}
                submitting={submitting}
                token={token}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab
                notifications={notifications.notifications}
                notificationSetting={notifications.notificationSetting}
                onMarkAllNotificationsRead={notifications.markAllNotificationsRead}
                onMarkNotificationRead={notifications.markNotificationRead}
                onSetNotificationSetting={notifications.setNotificationSetting}
                onUpdateNotificationSetting={notifications.updateNotificationSetting}
                submitting={submitting}
              />
            )}

            {activeTab === 'admins' && (
              <AdminAccessTab
                adminEditor={adminAccess.adminEditor}
                adminSessions={adminAccess.adminSessions}
                admins={adminAccess.admins}
                onDeleteRole={adminAccess.deleteRole}
                onRevokeAdminSession={adminAccess.revokeAdminSession}
                onRunAdminTwoFactor={adminAccess.runAdminTwoFactor}
                onSaveAdminAccess={adminAccess.saveAdminAccess}
                onSaveRole={adminAccess.saveRole}
                onSelectAdmin={adminAccess.setSelectedAdminId}
                onSelectRoleForEdit={adminAccess.selectRoleForEdit}
                onSetAdminEditor={adminAccess.setAdminEditor}
                onSetAdminStatus={adminAccess.setAdminStatus}
                onSetRoleDraft={adminAccess.setRoleDraft}
                onTogglePermission={adminAccess.togglePermission}
                permissions={adminAccess.permissions}
                roleDraft={adminAccess.roleDraft}
                roles={adminAccess.roles}
                selectedAdmin={adminAccess.selectedAdmin}
                selectedRole={adminAccess.selectedRole}
                selectedRoleId={adminAccess.selectedRoleId}
                submitting={submitting}
                totpSetup={adminAccess.totpSetup}
              />
            )}

            {activeTab === 'audit' && (
              <AuditTab
                auditExportFormat={auditSettings.auditExportFormat}
                auditFilter={auditSettings.auditFilter}
                auditLogs={auditSettings.auditLogs}
                loadAdminActions={auditSettings.loadAdminActions}
                loadAuditDetail={auditSettings.loadAuditDetail}
                loadAuditList={auditSettings.loadAuditList}
                loadAuditLogs={auditSettings.loadAuditLogs}
                onExportAudit={auditSettings.exportAudit}
                onSetAuditExportFormat={auditSettings.setAuditExportFormat}
                onSetAuditFilter={auditSettings.setAuditFilter}
                selectedAudit={auditSettings.selectedAudit}
                submitting={submitting}
              />
            )}

            {activeTab === 'files' && (
              <FilesTab
                fileIdInput={adminFiles.fileIdInput}
                fileToUpload={adminFiles.fileToUpload}
                onDeleteAdminFile={adminFiles.deleteAdminFile}
                onDownloadAdminFile={adminFiles.downloadAdminFile}
                onSetFileIdInput={adminFiles.setFileIdInput}
                onSetFileToUpload={adminFiles.setFileToUpload}
                onUploadAdminFile={adminFiles.uploadAdminFile}
                submitting={submitting}
                uploadedFiles={adminFiles.uploadedFiles}
              />
            )}

            {activeTab === 'jobs' && (
              <JobsTab
                jobs={adminJobs.jobs}
                loadJobLogs={adminJobs.loadJobLogs}
                onRefreshJobStatus={adminJobs.refreshJobStatus}
                onRunJobAction={adminJobs.runJobAction}
                submitting={submitting}
              />
            )}

            {activeTab === 'health' && <HealthTab health={health} />}

            {activeTab === 'guide' && <GuideTab />}

            {activeTab === 'language' && <LanguageTab />}

            {activeTab === 'brand' && (
              <BrandTab
                onSetError={setViewError}
                onSetNotice={onSetNotice}
                token={token}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminSettingsView
