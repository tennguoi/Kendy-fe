import { RefreshCw, RotateCcw, Save } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../api/admin.api'
import { AdminEmptyState, AdminStatusBadge } from './AdminShared'
import { formatAdminDate } from './adminFormat'

const tabs = [
  { id: 'settings', label: 'Settings' },
  { id: 'webhooks', label: 'Webhook' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'admins', label: 'Admins' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'health', label: 'Health' },
]

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

function AdminSettingsView({
  onSetError,
  onSetNotice,
  token,
}) {
  const [activeTab, setActiveTab] = useState('settings')
  const [admins, setAdmins] = useState([])
  const [error, setError] = useState('')
  const [health, setHealth] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [notificationSetting, setNotificationSetting] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [retryForm, setRetryForm] = useState({ bankTransactionId: '', depositCode: '', reason: '' })
  const [roles, setRoles] = useState([])
  const [sepayConfigText, setSepayConfigText] = useState('{}')
  const [sepayLogs, setSepayLogs] = useState([])
  const [sepayStatus, setSepayStatus] = useState(null)
  const [settings, setSettings] = useState([])
  const [settingSearch, setSettingSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const settingsMap = toMap(settings)
  const twoFactorRequired = settingsMap.admin_2fa_required === 'true'

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
      setAdmins(adminsData)
      setRoles(rolesData)
      setPermissions(permissionsData)
      setJobs(jobsData)
      setHealth(healthData)
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

  const toggleTwoFactor = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.updateSettings({
        settings: [
          {
            key: 'admin_2fa_required',
            publicSetting: false,
            value: twoFactorRequired ? 'false' : 'true',
          },
        ],
      }, token)
      await loadSettings()
      onSetNotice(`Đã ${twoFactorRequired ? 'tắt' : 'bật'} yêu cầu 2FA.`)
    } catch (err) {
      setViewError(err.message || 'Không thể cập nhật cài đặt.')
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
            <div className="admin-check-row settings-row">
              <label>
                <input checked={twoFactorRequired} disabled={submitting} onChange={toggleTwoFactor} type="checkbox" />
                <span>Yêu cầu xác thực 2 lớp (2FA) khi truy cập admin</span>
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
                </article>
              ))}
            </div>
          </div>
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Roles & permissions</h3>
              <span>{roles.length} role · {permissions.length} permission</span>
            </div>
            <div className="admin-mini-list">
              {roles.map((role) => (
                <article key={role.id || role.name}>
                  <strong>{role.name}</strong>
                  <span>{role.description || 'Không có mô tả'}</span>
                </article>
              ))}
              {permissions.slice(0, 20).map((permission) => (
                <article key={permission.id || permission.name}>
                  <strong>{permission.name}</strong>
                  <span>{permission.description || permission.groupName || 'Permission'}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Jobs</h3>
            <span>{jobs.length} job</span>
          </div>
          <div className="admin-mini-list">
            {jobs.map((job) => (
              <article key={job.id}>
                <strong>{job.name || `Job #${job.id}`}</strong>
                <span>{job.status} · {formatAdminDate(job.createdAt || job.updatedAt)}</span>
                <div className="admin-action-row">
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
