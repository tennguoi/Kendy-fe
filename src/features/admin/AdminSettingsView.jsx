import { RefreshCw, RotateCcw, Save } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../api/admin.api'
import { userApi } from '../../api/user.api'
import { AdminEmptyState, AdminStatusBadge } from './AdminShared'
import { formatAdminDate } from './adminFormat'

const tabs = [
  { id: 'settings', label: 'Settings' },
  { id: 'webhooks', label: 'Webhook' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'admins', label: 'Admins' },
  { id: 'audit', label: 'Audit' },
  { id: 'files', label: 'Files' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'health', label: 'Health' },
]

function downloadBlobFile(fileName, blob) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

function downloadTextFile(fileName, content) {
  downloadBlobFile(fileName, new Blob([content], { type: 'text/csv;charset=utf-8' }))
}

function toMap(settingsList) {
  const map = {}
  settingsList.forEach((setting) => {
    map[setting.key] = setting.value
  })
  return map
}

function configToObject(items) {
  const config = {}
  items.forEach((item) => {
    config[item.key.replace(/^sepay\./, '')] = item.value
  })
  return config
}

function mergeSettings(currentSettings, savedSettings) {
  const savedByKey = new Map(savedSettings.map((setting) => [setting.key, setting]))
  const merged = currentSettings.map((setting) => savedByKey.get(setting.key) || setting)

  savedSettings.forEach((setting) => {
    if (!currentSettings.some((item) => item.key === setting.key)) {
      merged.push(setting)
    }
  })

  return merged
}

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

  const settingsMap = toMap(settings)
  const twoFactorRequired = settingsMap.admin_2fa_required === 'true'
  const selectedAdmin = admins.find((admin) => admin.id === selectedAdminId) || admins[0]
  const selectedRole = roles.find((role) => role.id === selectedRoleId)

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
      setSepayConfigText(JSON.stringify(configToObject(sepayConfigData), null, 2))
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

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">Settings</span>
          <h2>Cài đặt hệ thống</h2>
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

      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button type="button" className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'settings' && (
        <div className="admin-grid two-columns">
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Bảo mật</h3>
              <button type="button" onClick={backupSettings} disabled={submitting}>Backup</button>
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
                  <button type="button" className="admin-icon-button" disabled={submitting} onClick={sendTwoFactorEnableCode}>
                    Gửi mã xác thực
                  </button>
                  {twoFactorEmailSent && (
                    <label>
                      <span>Mã email</span>
                      <input
                        value={twoFactorCode}
                        onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
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
                <input checked={twoFactorRequired} disabled={submitting} onChange={toggleTwoFactor} type="checkbox" />
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
              <input value={settingSearch} onChange={(event) => setSettingSearch(event.target.value)} placeholder="Tìm setting key" type="search" />
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
                <input value={settingHistoryKey} onChange={(event) => setSettingHistoryKey(event.target.value)} placeholder="VD: admin_2fa_required" />
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
            <form className="admin-form compact" onSubmit={restoreSettingsFromText}>
              <div className="admin-panel-head compact-head">
                <h3>Restore settings</h3>
              </div>
              <label>
                <span>JSON</span>
                <textarea value={restoreText} onChange={(event) => setRestoreText(event.target.value)} rows="6" />
              </label>
              <button type="submit" className="admin-danger-button" disabled={submitting}>Restore</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="admin-grid two-columns">
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Webhook status</h3>
              <AdminStatusBadge status={sepayStatus?.requireApiKey ? 'PROTECTED' : 'OPEN'} />
            </div>
            <dl className="admin-detail-list">
              <div><dt>API key</dt><dd>{sepayStatus?.requireApiKey ? 'Bắt buộc' : 'Không bắt buộc'}</dd></div>
              <div><dt>Header</dt><dd>{sepayStatus?.apiKeyHeader || 'Chưa cấu hình'}</dd></div>
              <div><dt>HMAC</dt><dd>{sepayStatus?.requireHmac ? 'Bật' : 'Tắt'}</dd></div>
              <div><dt>Signature</dt><dd>{sepayStatus?.signatureHeader || 'Chưa cấu hình'}</dd></div>
            </dl>
            <label className="admin-form">
              <span>Webhook config JSON</span>
              <textarea value={sepayConfigText} onChange={(event) => setSepayConfigText(event.target.value)} rows="10" />
            </label>
            <button type="button" className="admin-primary-button" onClick={saveSepayConfig} disabled={submitting}>
              <Save size={17} strokeWidth={2} aria-hidden="true" />
              <span>Lưu config</span>
            </button>
          </div>
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Webhook logs & retry</h3>
            </div>
            <form className="admin-form compact" onSubmit={retryWebhook}>
              <label>
                <span>Bank transaction ID</span>
                <input value={retryForm.bankTransactionId} onChange={(event) => setRetryForm((current) => ({ ...current, bankTransactionId: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" required />
              </label>
              <label>
                <span>Mã nạp</span>
                <input value={retryForm.depositCode} onChange={(event) => setRetryForm((current) => ({ ...current, depositCode: event.target.value }))} />
              </label>
              <label>
                <span>Lý do</span>
                <textarea value={retryForm.reason} onChange={(event) => setRetryForm((current) => ({ ...current, reason: event.target.value }))} rows="3" required />
              </label>
              <button type="submit" disabled={submitting}>
                <RotateCcw size={17} strokeWidth={2} aria-hidden="true" />
                <span>Retry</span>
              </button>
            </form>
            <div className="admin-mini-list">
              {sepayLogs.map((log) => (
                <article key={log.id}>
                  <strong>{log.action}</strong>
                  <span>{log.metadata || 'Không có metadata'} · {formatAdminDate(log.createdAt)}</span>
                </article>
              ))}
              {sepayLogs.length === 0 && <AdminEmptyState message="Chưa có webhook log." />}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="admin-grid two-columns">
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Notification settings</h3>
              <button type="button" onClick={updateNotificationSetting} disabled={submitting}>Lưu</button>
            </div>
            <label className="admin-form">
              <span>JSON value</span>
              <textarea value={notificationSetting?.value || '{}'} onChange={(event) => setNotificationSetting((current) => ({ ...(current || {}), value: event.target.value }))} rows="10" />
            </label>
          </div>
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Admin notifications</h3>
              <button type="button" onClick={markAllNotificationsRead} disabled={submitting}>Đọc tất cả</button>
            </div>
            <div className="admin-mini-list">
              {notifications.map((notification) => (
                <article key={notification.id}>
                  <strong>{notification.title || notification.type || `Notification #${notification.id}`}</strong>
                  <span>{notification.message || notification.payload || 'Không có nội dung'} · {formatAdminDate(notification.createdAt)}</span>
                  {!notification.readAt && (
                    <button type="button" className="admin-icon-button slim" disabled={submitting} onClick={async () => {
                      const saved = await adminApi.markNotificationRead(notification.id, token)
                      setNotifications((items) => items.map((item) => (item.id === saved.id ? saved : item)))
                    }}>
                      Đã đọc
                    </button>
                  )}
                </article>
              ))}
              {notifications.length === 0 && <AdminEmptyState message="Chưa có notification." />}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admins' && (
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
                  <button type="button" className="admin-icon-button slim" onClick={() => setSelectedAdminId(admin.id)}>
                    Chọn
                  </button>
                </article>
              ))}
              {admins.length === 0 && <AdminEmptyState message="Chưa có admin." />}
            </div>
            {selectedAdmin && (
              <form className="admin-form compact" onSubmit={saveAdminAccess}>
                <div className="admin-panel-head compact-head">
                  <h3>{selectedAdmin.email}</h3>
                  <AdminStatusBadge status={selectedAdmin.status} />
                </div>
                <label>
                  <span>Legacy role</span>
                  <select value={adminEditor.legacyRole} onChange={(event) => setAdminEditor((current) => ({ ...current, legacyRole: event.target.value }))}>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </label>
                <label>
                  <span>Lý do</span>
                  <textarea value={adminEditor.reason} onChange={(event) => setAdminEditor((current) => ({ ...current, reason: event.target.value }))} rows="2" />
                </label>
                <div className="admin-check-row settings-row">
                  {roles.map((role) => (
                    <label key={role.id}>
                      <input
                        checked={adminEditor.roleIds.includes(role.id)}
                        onChange={() => setAdminEditor((current) => ({
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
                        onChange={() => setAdminEditor((current) => ({
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
                  <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => setAdminStatus('ACTIVE')}>Mở khóa</button>
                  <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => setAdminStatus('LOCKED')}>Khóa</button>
                </div>
              </form>
            )}
          </div>
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Roles & permissions</h3>
              <span>{roles.length} role · {permissions.length} permission</span>
            </div>
            <form className="admin-form compact" onSubmit={saveRole}>
              <div className="admin-action-row">
                <select value={selectedRoleId || ''} onChange={(event) => selectRoleForEdit(event.target.value ? Number(event.target.value) : null)}>
                  <option value="">Tạo role mới</option>
                  {roles.map((role) => <option value={role.id} key={role.id}>{role.name}</option>)}
                </select>
                {selectedRole && !selectedRole.system && (
                  <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={deleteRole}>Xóa role</button>
                )}
              </div>
              <label>
                <span>Tên role</span>
                <input value={roleDraft.name} onChange={(event) => setRoleDraft((current) => ({ ...current, name: event.target.value }))} required />
              </label>
              <label>
                <span>Mô tả</span>
                <textarea value={roleDraft.description} onChange={(event) => setRoleDraft((current) => ({ ...current, description: event.target.value }))} rows="2" />
              </label>
              <div className="admin-check-row settings-row">
                {permissions.map((permission) => (
                  <label key={permission.id}>
                    <input checked={roleDraft.permissionIds.includes(permission.id)} onChange={() => togglePermission(permission.id)} type="checkbox" />
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
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => runAdminTwoFactor('setup')}>Setup</button>
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => runAdminTwoFactor('reset')}>Reset</button>
                <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => runAdminTwoFactor('disable')}>Disable</button>
              </div>
              {totpSetup && (
                <div className="admin-code-block">
                  <strong>Secret</strong>
                  <pre>{totpSetup.secret}</pre>
                  {totpSetup.qrCodeBase64 && <img alt="Admin 2FA QR" src={`data:image/png;base64,${totpSetup.qrCodeBase64}`} />}
                  <pre>{(totpSetup.backupCodes || []).join('\n')}</pre>
                </div>
              )}
              <form className="admin-form compact" onSubmit={(event) => { event.preventDefault(); runAdminTwoFactor('enable') }}>
                <label>
                  <span>Mã xác thực</span>
                  <input value={adminEditor.verificationCode} onChange={(event) => setAdminEditor((current) => ({ ...current, verificationCode: event.target.value.trim() }))} />
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
                  <button type="button" className="admin-danger-button slim" disabled={submitting || session.revokedAt} onClick={() => revokeAdminSession(session.id)}>
                    Thu hồi
                  </button>
                </article>
              ))}
              {adminSessions.length === 0 && <AdminEmptyState message="Admin chưa có session." />}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="admin-grid two-columns">
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Audit logs</h3>
              <div className="admin-action-row">
                <span className="admin-format-toggle">
                  <button type="button" className={auditExportFormat === 'csv' ? 'active' : ''} onClick={() => setAuditExportFormat('csv')}>CSV</button>
                  <button type="button" className={auditExportFormat === 'xlsx' ? 'active' : ''} onClick={() => setAuditExportFormat('xlsx')}>XLSX</button>
                </span>
                <button type="button" onClick={exportAudit} disabled={submitting}>Export</button>
              </div>
            </div>
            <form className="admin-form compact" onSubmit={loadAuditLogs}>
              <div className="admin-form-grid single">
                <label>
                  <span>Từ khóa</span>
                  <input value={auditFilter.query} onChange={(event) => setAuditFilter((current) => ({ ...current, query: event.target.value }))} />
                </label>
                <label>
                  <span>Action</span>
                  <input value={auditFilter.action} onChange={(event) => setAuditFilter((current) => ({ ...current, action: event.target.value }))} />
                </label>
                <label>
                  <span>Admin/User ID</span>
                  <input value={auditFilter.adminId} onChange={(event) => setAuditFilter((current) => ({ ...current, adminId: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" />
                </label>
                <label>
                  <span>Target type</span>
                  <input value={auditFilter.targetType} onChange={(event) => setAuditFilter((current) => ({ ...current, targetType: event.target.value }))} />
                </label>
                <label>
                  <span>Target ID</span>
                  <input value={auditFilter.targetId} onChange={(event) => setAuditFilter((current) => ({ ...current, targetId: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" />
                </label>
              </div>
              <div className="admin-action-row">
                <button type="submit" disabled={submitting}>Tải audit search</button>
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={loadAuditList}>Audit list</button>
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={loadAdminActions}>Admin actions</button>
              </div>
            </form>
            <div className="admin-mini-list">
              {auditLogs.map((log) => (
                <article key={log.id}>
                  <strong>{log.action}</strong>
                  <span>{log.actorRole || 'SYSTEM'} #{log.actorUserId || '-'} · {log.targetType || 'TARGET'} #{log.targetId || '-'} · {formatAdminDate(log.createdAt)}</span>
                  <button type="button" className="admin-icon-button slim" disabled={submitting} onClick={() => loadAuditDetail(log.id)}>
                    Chi tiết
                  </button>
                </article>
              ))}
              {auditLogs.length === 0 && <AdminEmptyState message="Chưa tải audit log." />}
            </div>
          </div>
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Audit detail</h3>
              {selectedAudit && <span>#{selectedAudit.id}</span>}
            </div>
            {selectedAudit ? (
              <>
                <dl className="admin-detail-list">
                  <div><dt>Action</dt><dd>{selectedAudit.action}</dd></div>
                  <div><dt>Actor</dt><dd>{selectedAudit.actorRole || '-'} #{selectedAudit.actorUserId || '-'}</dd></div>
                  <div><dt>Target</dt><dd>{selectedAudit.targetType || '-'} #{selectedAudit.targetId || '-'}</dd></div>
                  <div><dt>Time</dt><dd>{formatAdminDate(selectedAudit.createdAt)}</dd></div>
                </dl>
                <div className="admin-code-block">
                  <strong>Metadata</strong>
                  <pre>{selectedAudit.metadata || 'Không có metadata'}</pre>
                </div>
              </>
            ) : <AdminEmptyState message="Chọn audit log để xem chi tiết." />}
          </div>
        </div>
      )}

      {activeTab === 'files' && (
        <div className="admin-grid two-columns">
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Upload file</h3>
            </div>
            <form className="admin-form compact" onSubmit={uploadAdminFile}>
              <label>
                <span>File</span>
                <input onChange={(event) => setFileToUpload(event.target.files?.[0] || null)} type="file" />
              </label>
              <button type="submit" disabled={submitting || !fileToUpload}>Upload</button>
            </form>
            <div className="admin-mini-list">
              {uploadedFiles.map((file) => (
                <article key={file.id}>
                  <strong>{file.fileName}</strong>
                  <span>#{file.id} · {file.contentType || 'file'} · {file.sizeBytes} bytes</span>
                  <div className="admin-action-row">
                    <button type="button" className="admin-icon-button slim" disabled={submitting} onClick={() => downloadAdminFile('preview', file.id)}>Preview</button>
                    <button type="button" className="admin-icon-button slim" disabled={submitting} onClick={() => downloadAdminFile('download', file.id)}>Download</button>
                    <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={() => deleteAdminFile(file.id)}>Delete</button>
                  </div>
                </article>
              ))}
              {uploadedFiles.length === 0 && <AdminEmptyState message="Chưa upload file trong phiên này." />}
            </div>
          </div>
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>File by ID</h3>
            </div>
            <div className="admin-form compact">
              <label>
                <span>File ID</span>
                <input value={fileIdInput} onChange={(event) => setFileIdInput(event.target.value.replace(/\D/g, ''))} inputMode="numeric" />
              </label>
              <div className="admin-action-row">
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => downloadAdminFile('preview')}>Preview</button>
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => downloadAdminFile('download')}>Download</button>
                <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => deleteAdminFile()}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Jobs</h3>
            <div className="admin-action-row">
              <span>{jobs.length} job</span>
              <button type="button" className="admin-icon-button slim" disabled={submitting} onClick={loadJobLogs}>Logs</button>
            </div>
          </div>
          <div className="admin-mini-list">
            {jobs.map((job) => (
              <article key={job.id}>
                <strong>{job.name || `Job #${job.id}`}</strong>
                <span>{job.status} · {formatAdminDate(job.createdAt || job.updatedAt)}</span>
                <div className="admin-action-row">
                  <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => refreshJobStatus(job.id)}>Status</button>
                  <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => runJobAction(job.id, 'retry')}>Retry</button>
                  <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={() => runJobAction(job.id, 'cancel')}>Cancel</button>
                </div>
              </article>
            ))}
            {jobs.length === 0 && <AdminEmptyState message="Chưa có job." />}
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Health</h3>
            <AdminStatusBadge status={health?.status || 'UNKNOWN'} />
          </div>
          <dl className="admin-detail-list">
            <div><dt>Service</dt><dd>{health?.service || 'Unknown'}</dd></div>
            <div><dt>Time</dt><dd>{formatAdminDate(health?.timestamp)}</dd></div>
          </dl>
        </div>
      )}
    </section>
  )
}

export default AdminSettingsView
