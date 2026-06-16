import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import { userApi } from '../../../api/user.api'
import AdminAccessTab from './components/AdminAccessTab'
import AuditTab from './components/AuditTab'
import FilesTab from './components/FilesTab'
import GuideTab from './components/GuideTab'
import HealthTab from './components/HealthTab'
import JobsTab from './components/JobsTab'
import NotificationsTab from './components/NotificationsTab'
import OperationsTab from './components/OperationsTab'
import SettingsTab from './components/SettingsTab'
import WebhooksTab from './components/WebhooksTab'
import { settingsTabs } from './settings.constants'
import {
  downloadBlobFile,
  downloadTextFile,
  mergeSettings,
  sepayConfigToObject,
  toSettingsMap,
} from './settings.utils'

function AdminSettingsView({
  currentUser,
  onCurrentUserChange,
  onSetError,
  onSetNotice,
  token,
}) {
  const [activeTab, setActiveTab] = useState('settings')
  const [admins, setAdmins] = useState([])
  const [adminEditor, setAdminEditor] = useState({
    legacyRole: 'ADMIN',
    permissionCodes: [],
    reason: '',
    roleIds: [],
    verificationCode: '',
  })
  const [adminSessions, setAdminSessions] = useState([])
  const [auditExportFormat, setAuditExportFormat] = useState('xlsx')
  const [auditFilter, setAuditFilter] = useState({ action: '', adminId: '', query: '', targetId: '', targetType: '' })
  const [auditLogs, setAuditLogs] = useState([])
  const [error, setError] = useState('')
  const [fileIdInput, setFileIdInput] = useState('')
  const [fileToUpload, setFileToUpload] = useState(null)
  const [health, setHealth] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationSetting, setNotificationSetting] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [retryForm, setRetryForm] = useState({ bankTransactionId: '', depositCode: '', reason: '' })
  const [restoreText, setRestoreText] = useState('{\n  "settings": []\n}')
  const [roleDraft, setRoleDraft] = useState({ description: '', name: '', permissionIds: [] })
  const [roles, setRoles] = useState([])
  const [selectedAudit, setSelectedAudit] = useState(null)
  const [selectedAdminId, setSelectedAdminId] = useState(null)
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const [sepayConfigText, setSepayConfigText] = useState('{}')
  const [sepayLogs, setSepayLogs] = useState([])
  const [sepayStatus, setSepayStatus] = useState(null)
  const [settings, setSettings] = useState([])
  const [settingHistory, setSettingHistory] = useState([])
  const [settingHistoryKey, setSettingHistoryKey] = useState('')
  const [settingSearch, setSettingSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [totpSetup, setTotpSetup] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorEmailSent, setTwoFactorEmailSent] = useState(false)

  const settingsMap = toSettingsMap(settings)
  const twoFactorRequired = settingsMap.admin_2fa_required === 'true'
  const selectedAdmin = admins.find((admin) => admin.id === selectedAdminId) || admins[0]
  const selectedRole = roles.find((role) => role.id === selectedRoleId)
  const activeTabMeta = settingsTabs.find((tab) => tab.id === activeTab) || settingsTabs[0]

  const setViewError = useCallback((message) => {
    setError(message)
    onSetError(message)
  }, [onSetError])

  const loadSettings = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setViewError('')
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
        adminApi.searchSettings({ query: settingSearch.trim() }, token),
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
      setSettings(settingsData)
      setSepayStatus(sepayStatusData)
      setSepayLogs(sepayLogsData)
      setSepayConfigText(JSON.stringify(sepayConfigToObject(sepayConfigData), null, 2))
      setNotificationSetting(notificationData)
      setNotifications(notificationItems)
      setAdmins(adminsData)
      setRoles(rolesData)
      setPermissions(permissionsData)
      setJobs(jobsData)
      setHealth(healthData)
      setSelectedAdminId((current) => (current && adminsData.some((admin) => admin.id === current) ? current : adminsData[0]?.id || null))
    } catch (err) {
      setViewError(err.message || 'Không tải được cài đặt hệ thống.')
    } finally {
      setLoading(false)
    }
  }, [setViewError, settingSearch, token])

  useEffect(() => {
    const timer = window.setTimeout(loadSettings, 250)
    return () => window.clearTimeout(timer)
  }, [loadSettings])

  useEffect(() => {
    if (!token || !selectedAdmin?.id) {
      return
    }

    let active = true
    async function loadAdminDetail() {
      try {
        const [legacyRoleData, permissionData, roleData, sessionsData] = await Promise.all([
          adminApi.getAdminLegacyRole(selectedAdmin.id, token),
          adminApi.getAdminPermissions(selectedAdmin.id, token),
          adminApi.getUserAdminRoles(selectedAdmin.id, token),
          adminApi.getAdminSessions(selectedAdmin.id, token),
        ])
        if (!active) {
          return
        }
        setAdminEditor((current) => ({
          ...current,
          legacyRole: legacyRoleData.role || selectedAdmin.role || 'ADMIN',
          permissionCodes: permissionData.permissions || [],
          roleIds: (roleData.roles || []).map((role) => role.id),
        }))
        setAdminSessions(sessionsData)
        setTotpSetup(null)
      } catch (err) {
        if (active) {
          setViewError(err.message || 'Không tải được chi tiết admin.')
        }
      }
    }

    loadAdminDetail()
    return () => {
      active = false
    }
  }, [selectedAdmin?.id, selectedAdmin?.role, setViewError, token])

  const toggleTwoFactor = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      const savedSettings = await adminApi.updateSettings({
        settings: [
          {
            key: 'admin_2fa_required',
            publicSetting: false,
            value: twoFactorRequired ? 'false' : 'true',
          },
        ],
      }, token)
      setSettings((current) => mergeSettings(current, savedSettings))
      onSetNotice(`Đã ${twoFactorRequired ? 'tắt' : 'bật'} yêu cầu 2FA.`)
    } catch (err) {
      setViewError(err.message || 'Không thể cập nhật cài đặt.')
    } finally {
      setSubmitting(false)
    }
  }

  const sendTwoFactorEnableCode = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      await userApi.sendTwoFactorEnableEmailCode(token)
      setTwoFactorEmailSent(true)
      onSetNotice(`Đã gửi mã xác thực tới ${currentUser?.email || 'email admin'}.`)
    } catch (err) {
      setViewError(err.message || 'Không gửi được mã xác thực 2FA.')
    } finally {
      setSubmitting(false)
    }
  }

  const enableEmailTwoFactor = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setViewError('')
    try {
      const savedUser = await userApi.enableEmailTwoFactor({ code: twoFactorCode.trim() }, token)
      setTwoFactorCode('')
      setTwoFactorEmailSent(false)
      onCurrentUserChange(savedUser)
      onSetNotice('Đã bật 2FA email cho tài khoản admin hiện tại.')
    } catch (err) {
      setViewError(err.message || 'Mã xác thực 2FA không hợp lệ hoặc đã hết hạn.')
    } finally {
      setSubmitting(false)
    }
  }

  const saveSepayConfig = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.updateSepayConfig({ config: JSON.parse(sepayConfigText) }, token)
      await loadSettings()
      onSetNotice('Đã lưu webhook config.')
    } catch (err) {
      setViewError(err.message || 'Webhook config phải là JSON hợp lệ.')
    } finally {
      setSubmitting(false)
    }
  }

  const retryWebhook = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.retrySepayWebhook({
        bankTransactionId: Number(retryForm.bankTransactionId),
        depositCode: retryForm.depositCode.trim() || undefined,
        reason: retryForm.reason.trim(),
      }, token)
      setRetryForm({ bankTransactionId: '', depositCode: '', reason: '' })
      await loadSettings()
      onSetNotice('Đã gửi retry webhook.')
    } catch (err) {
      setViewError(err.message || 'Không retry được webhook.')
    } finally {
      setSubmitting(false)
    }
  }

  const updateNotificationSetting = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.updateNotificationSettings({ value: notificationSetting?.value || '{}' }, token)
      await loadSettings()
      onSetNotice('Đã lưu notification settings.')
    } catch (err) {
      setViewError(err.message || 'Không lưu được notification settings.')
    } finally {
      setSubmitting(false)
    }
  }

  const runJobAction = async (jobId, action) => {
    setSubmitting(true)
    setViewError('')
    try {
      if (action === 'retry') {
        await adminApi.retryJob(jobId, token)
      } else {
        await adminApi.cancelJob(jobId, token)
      }
      await loadSettings()
      onSetNotice(`Đã ${action} job #${jobId}.`)
    } catch (err) {
      setViewError(err.message || 'Không xử lý được job.')
    } finally {
      setSubmitting(false)
    }
  }

  const backupSettings = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      const data = await adminApi.backupSettings(token)
      setSettings(data)
      onSetNotice(`Backup settings hoàn tất: ${data.length} key.`)
    } catch (err) {
      setViewError(err.message || 'Không backup được settings.')
    } finally {
      setSubmitting(false)
    }
  }

  const restoreSettingsFromText = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setViewError('')
    try {
      const parsed = JSON.parse(restoreText)
      const payload = Array.isArray(parsed) ? { settings: parsed } : parsed
      const saved = await adminApi.restoreSettings(payload, token)
      setSettings(saved)
      onSetNotice(`Restore settings hoàn tất: ${saved.length} key.`)
    } catch (err) {
      setViewError(err.message || 'JSON restore settings không hợp lệ.')
    } finally {
      setSubmitting(false)
    }
  }

  const loadSettingHistory = async (event) => {
    event.preventDefault()
    if (!settingHistoryKey.trim()) {
      setViewError('Nhập setting key cần xem lịch sử.')
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const data = await adminApi.getSettingHistory(settingHistoryKey.trim(), token)
      setSettingHistory(data)
      onSetNotice(`Đã tải ${data.length} lịch sử setting.`)
    } catch (err) {
      setViewError(err.message || 'Không tải được lịch sử setting.')
    } finally {
      setSubmitting(false)
    }
  }

  const loadAuditLogs = async (event) => {
    event?.preventDefault()
    setSubmitting(true)
    setViewError('')
    try {
      const params = {
        actorUserId: auditFilter.adminId ? Number(auditFilter.adminId) : undefined,
        action: auditFilter.action.trim(),
        query: auditFilter.query.trim(),
        targetId: auditFilter.targetId ? Number(auditFilter.targetId) : undefined,
        targetType: auditFilter.targetType.trim(),
      }
      const data = await adminApi.getAuditLogs(params, token)
      setAuditLogs(data)
      setSelectedAudit(data[0] || null)
      onSetNotice(`Đã tải ${data.length} audit log.`)
    } catch (err) {
      setViewError(err.message || 'Không tải được audit log.')
    } finally {
      setSubmitting(false)
    }
  }

  const loadAuditList = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      const data = await adminApi.listAuditLogs({ action: auditFilter.action.trim() }, token)
      setAuditLogs(data)
      setSelectedAudit(data[0] || null)
      onSetNotice(`Đã tải ${data.length} audit log cơ bản.`)
    } catch (err) {
      setViewError(err.message || 'Không tải được audit log cơ bản.')
    } finally {
      setSubmitting(false)
    }
  }

  const loadAdminActions = async () => {
    if (!auditFilter.adminId) {
      setViewError('Nhập Admin/User ID để tải admin actions.')
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const data = await adminApi.getAdminActions(Number(auditFilter.adminId), {}, token)
      setAuditLogs(data)
      setSelectedAudit(data[0] || null)
      onSetNotice(`Đã tải ${data.length} admin action.`)
    } catch (err) {
      setViewError(err.message || 'Không tải được admin actions.')
    } finally {
      setSubmitting(false)
    }
  }

  const loadAuditDetail = async (auditId) => {
    setSubmitting(true)
    setViewError('')
    try {
      setSelectedAudit(await adminApi.getAuditLogDetail(auditId, token))
    } catch (err) {
      setViewError(err.message || 'Không tải được chi tiết audit log.')
    } finally {
      setSubmitting(false)
    }
  }

  const exportAudit = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      const data = await adminApi.exportAuditLogs(token, auditExportFormat)
      if (auditExportFormat === 'xlsx') {
        downloadBlobFile('audit-logs.xlsx', data)
      } else {
        downloadTextFile('audit-logs.csv', data)
      }
      onSetNotice(`Đã export audit-logs.${auditExportFormat}.`)
    } catch (err) {
      setViewError(err.message || 'Không export được audit logs.')
    } finally {
      setSubmitting(false)
    }
  }

  const uploadAdminFile = async (event) => {
    event.preventDefault()
    if (!fileToUpload) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.uploadAdminFile(fileToUpload, token)
      setUploadedFiles((items) => [saved, ...items.filter((item) => item.id !== saved.id)])
      setFileIdInput(String(saved.id))
      setFileToUpload(null)
      onSetNotice(`Đã upload ${saved.fileName}.`)
    } catch (err) {
      setViewError(err.message || 'Không upload được file.')
    } finally {
      setSubmitting(false)
    }
  }

  const downloadAdminFile = async (mode, fileId = fileIdInput) => {
    const normalizedId = Number(fileId)
    if (!normalizedId) {
      setViewError('Nhập file ID hợp lệ.')
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const data = mode === 'preview'
        ? await adminApi.previewAdminFile(normalizedId, token)
        : await adminApi.downloadAdminFile(normalizedId, token)
      downloadBlobFile(`admin-file-${normalizedId}${mode === 'preview' ? '-preview' : ''}`, data)
      onSetNotice(`Đã tải file #${normalizedId}.`)
    } catch (err) {
      setViewError(err.message || 'Không tải được file.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteAdminFile = async (fileId = fileIdInput) => {
    const normalizedId = Number(fileId)
    if (!normalizedId) {
      setViewError('Nhập file ID hợp lệ.')
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.deleteAdminFile(normalizedId, token)
      setUploadedFiles((items) => items.filter((item) => item.id !== normalizedId))
      if (fileIdInput === String(normalizedId)) {
        setFileIdInput('')
      }
      onSetNotice(`Đã xóa file #${normalizedId}.`)
    } catch (err) {
      setViewError(err.message || 'Không xóa được file.')
    } finally {
      setSubmitting(false)
    }
  }

  const refreshJobStatus = async (jobId) => {
    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.getJobStatus(jobId, token)
      setJobs((items) => items.map((item) => (item.id === saved.id ? saved : item)))
      onSetNotice(`Đã cập nhật job #${jobId}.`)
    } catch (err) {
      setViewError(err.message || 'Không tải được trạng thái job.')
    } finally {
      setSubmitting(false)
    }
  }

  const loadJobLogs = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      setJobs(await adminApi.getJobLogs(token))
      onSetNotice('Đã tải job logs.')
    } catch (err) {
      setViewError(err.message || 'Không tải được job logs.')
    } finally {
      setSubmitting(false)
    }
  }

  const togglePermission = (permissionId) => {
    setRoleDraft((current) => ({
      ...current,
      permissionIds: current.permissionIds.includes(permissionId)
        ? current.permissionIds.filter((id) => id !== permissionId)
        : [...current.permissionIds, permissionId],
    }))
  }

  const selectRoleForEdit = (roleId) => {
    const role = roles.find((item) => item.id === roleId)
    setSelectedRoleId(roleId || null)
    setRoleDraft(role
      ? {
          description: role.description || '',
          name: role.name || '',
          permissionIds: permissions.filter((permission) => role.permissions?.includes(permission.code)).map((permission) => permission.id),
        }
      : { description: '', name: '', permissionIds: [] })
  }

  const saveRole = async (event) => {
    event.preventDefault()
    if (!roleDraft.name.trim()) {
      setViewError('Tên role không được để trống.')
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const payload = {
        description: roleDraft.description.trim(),
        name: roleDraft.name.trim(),
        permissionIds: roleDraft.permissionIds,
      }
      const saved = selectedRole
        ? await adminApi.updateRole(selectedRole.id, payload, token)
        : await adminApi.createRole(payload, token)
      setSelectedRoleId(saved.id)
      await loadSettings()
      onSetNotice(`Đã lưu role ${saved.name}.`)
    } catch (err) {
      setViewError(err.message || 'Không lưu được role.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteRole = async () => {
    if (!selectedRole) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.deleteRole(selectedRole.id, token)
      setSelectedRoleId(null)
      setRoleDraft({ description: '', name: '', permissionIds: [] })
      await loadSettings()
      onSetNotice(`Đã xóa role ${selectedRole.name}.`)
    } catch (err) {
      setViewError(err.message || 'Không xóa được role.')
    } finally {
      setSubmitting(false)
    }
  }

  const saveAdminAccess = async (event) => {
    event.preventDefault()
    if (!selectedAdmin) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await Promise.all([
        adminApi.updateAdminLegacyRole(selectedAdmin.id, {
          reason: adminEditor.reason.trim(),
          role: adminEditor.legacyRole,
        }, token),
        adminApi.updateAdminPermissions(selectedAdmin.id, {
          permissions: adminEditor.permissionCodes,
          reason: adminEditor.reason.trim(),
        }, token),
        adminApi.setUserAdminRoles(selectedAdmin.id, adminEditor.roleIds, token),
      ])
      await loadSettings()
      onSetNotice(`Đã lưu quyền cho ${selectedAdmin.email}.`)
    } catch (err) {
      setViewError(err.message || 'Không lưu được quyền admin.')
    } finally {
      setSubmitting(false)
    }
  }

  const setAdminStatus = async (status) => {
    if (!selectedAdmin) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const payload = { ids: [selectedAdmin.id], reason: adminEditor.reason.trim() || 'Cập nhật từ màn hình quản trị' }
      if (status === 'LOCKED') {
        await adminApi.bulkLockAdmins(payload, token)
      } else {
        await adminApi.bulkUnlockAdmins(payload, token)
      }
      await loadSettings()
      onSetNotice(`Đã cập nhật trạng thái ${selectedAdmin.email}.`)
    } catch (err) {
      setViewError(err.message || 'Không cập nhật được trạng thái admin.')
    } finally {
      setSubmitting(false)
    }
  }

  const runAdminTwoFactor = async (action) => {
    if (!selectedAdmin) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      if (action === 'setup') {
        setTotpSetup(await adminApi.setupAdminTwoFactor(selectedAdmin.id, token))
      } else if (action === 'reset') {
        setTotpSetup(await adminApi.resetAdminTwoFactor(selectedAdmin.id, token))
      } else if (action === 'enable') {
        await adminApi.enableAdminTwoFactor(selectedAdmin.id, { code: adminEditor.verificationCode.trim() }, token)
        setTotpSetup(null)
        await loadSettings()
      } else {
        await adminApi.disableAdminTwoFactor(selectedAdmin.id, token)
        await loadSettings()
      }
      onSetNotice(`Đã xử lý 2FA cho ${selectedAdmin.email}.`)
    } catch (err) {
      setViewError(err.message || 'Không xử lý được 2FA admin.')
    } finally {
      setSubmitting(false)
    }
  }

  const revokeAdminSession = async (sessionId) => {
    if (!selectedAdmin) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.revokeAdminSession(selectedAdmin.id, sessionId, token)
      setAdminSessions(await adminApi.getAdminSessions(selectedAdmin.id, token))
      onSetNotice(`Đã thu hồi session #${sessionId}.`)
    } catch (err) {
      setViewError(err.message || 'Không thu hồi được session admin.')
    } finally {
      setSubmitting(false)
    }
  }

  const markAllNotificationsRead = async () => {
    const unreadIds = notifications.filter((item) => !item.readAt).map((item) => item.id)
    if (unreadIds.length === 0) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.bulkReadNotifications({ ids: unreadIds }, token)
      setNotifications(saved)
      onSetNotice(`Đã đọc ${unreadIds.length} notification.`)
    } catch (err) {
      setViewError(err.message || 'Không cập nhật được notification.')
    } finally {
      setSubmitting(false)
    }
  }

  const markNotificationRead = async (notificationId) => {
    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.markNotificationRead(notificationId, token)
      setNotifications((items) => items.map((item) => (item.id === saved.id ? saved : item)))
    } catch (err) {
      setViewError(err.message || 'Không cập nhật được notification.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-view settings-view">
      <div className="admin-toolbar settings-toolbar">
        <div>
          <h2>Cài đặt hệ thống</h2>
          <p>Quản trị vận hành, bảo mật, audit và các cấu hình nền của hệ thống.</p>
        </div>
        <button type="button" className="admin-icon-button" onClick={loadSettings} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {(error || loading) && (
        <p className={error ? 'admin-message error' : 'admin-message'}>
          {error || 'Đang tải cài đặt...'}
        </p>
      )}

      <div className="settings-layout">
        <aside className="settings-rail" aria-label="Nhóm cài đặt">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                type="button"
                className={activeTab === tab.id ? 'active' : ''}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {Icon && <Icon size={17} strokeWidth={2} aria-hidden="true" />}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </aside>

        <div className="settings-main">
          <div className="settings-section-head">
            <div>
              <span>{activeTabMeta.kicker || 'System'}</span>
              <h3>{activeTabMeta.title || activeTabMeta.label}</h3>
            </div>
            {activeTabMeta.description && <p>{activeTabMeta.description}</p>}
          </div>

          <div className="settings-content">
            {activeTab === 'settings' && (
              <SettingsTab
                currentUser={currentUser}
                enableEmailTwoFactor={enableEmailTwoFactor}
                loadSettingHistory={loadSettingHistory}
                onBackupSettings={backupSettings}
                onRestoreSettingsFromText={restoreSettingsFromText}
                onSendTwoFactorEnableCode={sendTwoFactorEnableCode}
                onSetRestoreText={setRestoreText}
                onSetSettingHistoryKey={setSettingHistoryKey}
                onSetSettingSearch={setSettingSearch}
                onSetTwoFactorCode={setTwoFactorCode}
                onToggleTwoFactor={toggleTwoFactor}
                restoreText={restoreText}
                settingHistory={settingHistory}
                settingHistoryKey={settingHistoryKey}
                settingSearch={settingSearch}
                settings={settings}
                submitting={submitting}
                twoFactorCode={twoFactorCode}
                twoFactorEmailSent={twoFactorEmailSent}
                twoFactorRequired={twoFactorRequired}
              />
            )}

            {activeTab === 'webhooks' && (
              <WebhooksTab
                onRetryFormChange={(patch) => setRetryForm((current) => ({ ...current, ...patch }))}
                onSaveSepayConfig={saveSepayConfig}
                onSetSepayConfigText={setSepayConfigText}
                retryForm={retryForm}
                retryWebhook={retryWebhook}
                sepayConfigText={sepayConfigText}
                sepayLogs={sepayLogs}
                sepayStatus={sepayStatus}
                submitting={submitting}
              />
            )}

            {activeTab === 'operations' && (
              <OperationsTab
                onSaved={(savedSettings) => setSettings((current) => mergeSettings(current, savedSettings))}
                onSetError={setViewError}
                onSetNotice={onSetNotice}
                settingsMap={settingsMap}
                submitting={submitting}
                token={token}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab
                notifications={notifications}
                notificationSetting={notificationSetting}
                onMarkAllNotificationsRead={markAllNotificationsRead}
                onMarkNotificationRead={markNotificationRead}
                onSetNotificationSetting={setNotificationSetting}
                onUpdateNotificationSetting={updateNotificationSetting}
                submitting={submitting}
              />
            )}

            {activeTab === 'admins' && (
              <AdminAccessTab
                adminEditor={adminEditor}
                adminSessions={adminSessions}
                admins={admins}
                onDeleteRole={deleteRole}
                onRevokeAdminSession={revokeAdminSession}
                onRunAdminTwoFactor={runAdminTwoFactor}
                onSaveAdminAccess={saveAdminAccess}
                onSaveRole={saveRole}
                onSelectAdmin={setSelectedAdminId}
                onSelectRoleForEdit={selectRoleForEdit}
                onSetAdminEditor={setAdminEditor}
                onSetAdminStatus={setAdminStatus}
                onSetRoleDraft={setRoleDraft}
                onTogglePermission={togglePermission}
                permissions={permissions}
                roleDraft={roleDraft}
                roles={roles}
                selectedAdmin={selectedAdmin}
                selectedRole={selectedRole}
                selectedRoleId={selectedRoleId}
                submitting={submitting}
                totpSetup={totpSetup}
              />
            )}

            {activeTab === 'audit' && (
              <AuditTab
                auditExportFormat={auditExportFormat}
                auditFilter={auditFilter}
                auditLogs={auditLogs}
                loadAdminActions={loadAdminActions}
                loadAuditDetail={loadAuditDetail}
                loadAuditList={loadAuditList}
                loadAuditLogs={loadAuditLogs}
                onExportAudit={exportAudit}
                onSetAuditExportFormat={setAuditExportFormat}
                onSetAuditFilter={setAuditFilter}
                selectedAudit={selectedAudit}
                submitting={submitting}
              />
            )}

            {activeTab === 'files' && (
              <FilesTab
                fileIdInput={fileIdInput}
                fileToUpload={fileToUpload}
                onDeleteAdminFile={deleteAdminFile}
                onDownloadAdminFile={downloadAdminFile}
                onSetFileIdInput={setFileIdInput}
                onSetFileToUpload={setFileToUpload}
                onUploadAdminFile={uploadAdminFile}
                submitting={submitting}
                uploadedFiles={uploadedFiles}
              />
            )}

            {activeTab === 'jobs' && (
              <JobsTab
                jobs={jobs}
                loadJobLogs={loadJobLogs}
                onRefreshJobStatus={refreshJobStatus}
                onRunJobAction={runJobAction}
                submitting={submitting}
              />
            )}

            {activeTab === 'health' && <HealthTab health={health} />}

            {activeTab === 'guide' && <GuideTab />}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminSettingsView
