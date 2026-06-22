import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  FileText,
  Globe2,
  HelpCircle,
  ImageUp,
  KeyRound,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Shield,
  ShieldCheck,
  Smartphone,
  Moon,
  Sun,
  Trash2,
  User,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { userApi } from '../../../api/user.api'
import { AdminEmptyState, AdminStatusBadge } from '../../admin/AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../admin/adminFormat'
import LanguageSwitcher from '../../../components/LanguageSwitcher/LanguageSwitcher'
import { useTheme } from '../../../contexts/ThemeContext'

function profileToForm(user) {
  const avatarUrl = user?.avatarUrl || user?.avatar || user?.picture || user?.imageUrl || user?.photoUrl || ''
  return {
    avatarUrl,
    email: user?.email || '',
    name: user?.name || '',
    phone: user?.phone || '',
  }
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (!value || typeof value !== 'object') {
    return []
  }

  const keys = ['content', 'items', 'data', 'records', 'results']
  const list = keys.map((key) => value[key]).find(Array.isArray)
  return list || []
}

function SettingsView({
  currentUser,
  onCurrentUserChange,
  onSetError,
  onSetNotice,
  token,
}) {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [apiKeyForm, setApiKeyForm] = useState({ name: '', scopes: 'orders:read,wallet:read' })
  const [apiKeys, setApiKeys] = useState([])
  const [createdApiToken, setCreatedApiToken] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [passwordForm, setPasswordForm] = useState({ confirmPassword: '', currentPassword: '', newPassword: '' })
  const [profileForm, setProfileForm] = useState(() => profileToForm(currentUser))
  const [security, setSecurity] = useState(null)
  const [sessions, setSessions] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [totpCode, setTotpCode] = useState('')
  const [totpSetup, setTotpSetup] = useState(null)
  const [twoFactorForm, setTwoFactorForm] = useState({ code: '', password: '' })
  const [twoFactorEmailSent, setTwoFactorEmailSent] = useState(false)

  // Mobile optimization tab state
  const [activeSettingsTab, setActiveSettingsTab] = useState('general')

  const setViewError = useCallback((message) => {
    setError(message)
    onSetError(message)
  }, [onSetError])

  const sessionList = normalizeList(sessions)
  const apiKeyList = normalizeList(apiKeys)

  const loadSettings = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setViewError('')
    try {
      const [profileData, dashboardData, securityData, sessionData, apiKeyData, notificationData] = await Promise.all([
        userApi.getMe(token),
        userApi.getDashboard(token),
        userApi.getSecurity(token),
        userApi.getSessions(token),
        userApi.getApiKeys(token),
        userApi.getNotifications(token),
      ])
      onCurrentUserChange(profileData)
      setProfileForm(profileToForm(profileData))
      setDashboard(dashboardData)
      setSecurity(securityData)
      setSessions(normalizeList(sessionData))
      setApiKeys(normalizeList(apiKeyData))
      setNotifications(normalizeList(notificationData))
    } catch (err) {
      setViewError(err.message || t('settings.loadError', { defaultValue: 'Không tải được cài đặt tài khoản.' }))
    } finally {
      setLoading(false)
    }
  }, [onCurrentUserChange, setViewError, token, t])

  useEffect(() => {
    const timer = window.setTimeout(loadSettings, 0)
    return () => window.clearTimeout(timer)
  }, [loadSettings])

  const updateProfile = async (event) => {
    event.preventDefault()
    if (!profileForm.name.trim()) {
      setViewError(t('settings.nameRequired', { defaultValue: 'Tên hiển thị không được để trống.' }))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const payload = {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim() || undefined,
      }

      const saved = await userApi.updateProfile(payload, token)
      onCurrentUserChange(saved)
      setProfileForm(profileToForm(saved))
      onSetNotice(t('settings.profileUpdated', { defaultValue: 'Đã cập nhật thông tin tài khoản.' }))
    } catch (err) {
      setViewError(err.message || t('settings.profileUpdateError', { defaultValue: 'Không cập nhật được thông tin tài khoản.' }))
    } finally {
      setSubmitting(false)
    }
  }

  const uploadAvatar = async (file) => {
    if (!file) {
      return
    }
    setUploadingAvatar(true)
    setViewError('')
    try {
      const saved = await userApi.uploadAvatar(file, token)
      onCurrentUserChange(saved)
      setProfileForm(profileToForm(saved))
      onSetNotice(t('settings.avatarUploaded', { defaultValue: 'Đã cập nhật ảnh đại diện.' }))
    } catch (err) {
      setViewError(err.message || t('settings.avatarUploadError', { defaultValue: 'Không tải được ảnh đại diện.' }))
    } finally {
      setUploadingAvatar(false)
    }
  }

  const avatarUrl = profileForm.avatarUrl || currentUser?.avatarUrl || currentUser?.avatar || currentUser?.picture || currentUser?.imageUrl || currentUser?.photoUrl
  const profileInitial = (profileForm.name || profileForm.email || currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()
  const oauthProvider = currentUser?.oauthProvider || currentUser?.provider || currentUser?.loginProvider

  const changePassword = async (event) => {
    event.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setViewError(t('settings.passwordMismatch', { defaultValue: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' }))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }, token)
      onCurrentUserChange(saved)
      setPasswordForm({ confirmPassword: '', currentPassword: '', newPassword: '' })
      await loadSettings()
      onSetNotice(t('settings.passwordChanged', { defaultValue: 'Đã đổi mật khẩu.' }))
    } catch (err) {
      setViewError(err.message || t('settings.passwordChangeError', { defaultValue: 'Không đổi được mật khẩu.' }))
    } finally {
      setSubmitting(false)
    }
  }

  const sendEmailTwoFactorCode = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      await userApi.sendTwoFactorEnableEmailCode(token)
      setTwoFactorEmailSent(true)
      onSetNotice(t('settings.twoFAEmailSent', { defaultValue: 'Đã gửi mã xác thực 2FA qua email.' }))
    } catch (err) {
      setViewError(err.message || t('settings.twoFAEmailError', { defaultValue: 'Không gửi được mã xác thực 2FA.' }))
    } finally {
      setSubmitting(false)
    }
  }

  const enableEmailTwoFactor = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setViewError('')
    try {
      const saved = await userApi.enableEmailTwoFactor({ code: twoFactorForm.code.trim() }, token)
      onCurrentUserChange(saved)
      setTwoFactorEmailSent(false)
      setTwoFactorForm({ code: '', password: '' })
      await loadSettings()
      onSetNotice(t('settings.twoFAEmailEnabled', { defaultValue: 'Đã bật 2FA qua email.' }))
    } catch (err) {
      setViewError(err.message || t('settings.twoFAEmailEnableError', { defaultValue: 'Không bật được 2FA qua email.' }))
    } finally {
      setSubmitting(false)
    }
  }

  const setupTotp = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      setTotpSetup(await userApi.setupTwoFactor(token))
      onSetNotice(t('settings.totpSetupCreated', { defaultValue: 'Đã tạo mã cài đặt TOTP.' }))
    } catch (err) {
      setViewError(err.message || t('settings.totpSetupError', { defaultValue: 'Không tạo được mã cài đặt TOTP.' }))
    } finally {
      setSubmitting(false)
    }
  }

  const enableTotp = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setViewError('')
    try {
      const saved = await userApi.enableTwoFactor({ code: totpCode.trim() }, token)
      onCurrentUserChange(saved)
      setTotpCode('')
      setTotpSetup(null)
      await loadSettings()
      onSetNotice(t('settings.totpEnabled', { defaultValue: 'Đã bật 2FA TOTP.' }))
    } catch (err) {
      setViewError(err.message || t('settings.totpCodeInvalid', { defaultValue: 'Mã TOTP không hợp lệ.' }))
    } finally {
      setSubmitting(false)
    }
  }

  const runTwoFactorProtectedAction = async (action) => {
    if (!twoFactorForm.password.trim()) {
      setViewError(t('settings.twoFAPasswordRequired', { defaultValue: 'Nhập mật khẩu hiện tại để xử lý 2FA.' }))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const payload = {
        code: twoFactorForm.code.trim() || undefined,
        password: twoFactorForm.password,
      }
      if (action === 'disable') {
        const saved = await userApi.disableTwoFactor(payload, token)
        onCurrentUserChange(saved)
      } else if (action === 'reset') {
        setTotpSetup(await userApi.resetTwoFactor(payload, token))
      } else {
        setTotpSetup(await userApi.regenerateBackupCodes(payload, token))
      }
      setTwoFactorForm({ code: '', password: '' })
      await loadSettings()
      onSetNotice(t('settings.twoFAProcessed', { defaultValue: 'Đã xử lý cài đặt 2FA.' }))
    } catch (err) {
      setViewError(err.message || t('settings.twoFAProcessError', { defaultValue: 'Không xử lý được cài đặt 2FA.' }))
    } finally {
      setSubmitting(false)
    }
  }

  const revokeSession = async (sessionId) => {
    setSubmitting(true)
    setViewError('')
    try {
      await userApi.revokeSession(sessionId, token)
      setSessions(normalizeList(await userApi.getSessions(token)))
      onSetNotice(t('settings.sessionRevoked', { id: sessionId, defaultValue: 'Đã thu hồi session #{{id}}.' }))
    } catch (err) {
      setViewError(err.message || t('settings.sessionRevokeError', { defaultValue: 'Không thu hồi được session.' }))
    } finally {
      setSubmitting(false)
    }
  }

  const revokeAllSessions = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      await userApi.revokeAllSessions(token)
      setSessions([])
      onSetNotice(t('settings.allSessionsRevoked', { defaultValue: 'Đã thu hồi tất cả session.' }))
    } catch (err) {
      setViewError(err.message || t('settings.allSessionsRevokeError', { defaultValue: 'Không thu hồi được tất cả session.' }))
    } finally {
      setSubmitting(false)
    }
  }

  const createApiKey = async (event) => {
    event.preventDefault()
    if (!apiKeyForm.name.trim()) {
      setViewError(t('settings.apiKeyNameRequired', { defaultValue: 'Tên API key không được để trống.' }))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const created = await userApi.createApiKey({
        name: apiKeyForm.name.trim(),
        scopes: apiKeyForm.scopes.split(',').map((scope) => scope.trim()).filter(Boolean),
      }, token)
      setApiKeys((items) => [created.apiKey, ...normalizeList(items).filter((item) => item.id !== created.apiKey.id)])
      setCreatedApiToken(created.token)
      setApiKeyForm({ name: '', scopes: 'orders:read,wallet:read' })
      await loadSettings()
      onSetNotice(t('settings.apiKeyCreated', { defaultValue: 'Đã tạo API key mới.' }))
    } catch (err) {
      setViewError(err.message || t('settings.apiKeyCreateError', { defaultValue: 'Không tạo được API key.' }))
    } finally {
      setSubmitting(false)
    }
  }

  const revokeApiKey = async (keyId) => {
    setSubmitting(true)
    setViewError('')
    try {
      await userApi.revokeApiKey(keyId, token)
      setApiKeys(normalizeList(await userApi.getApiKeys(token)))
      onSetNotice(t('settings.apiKeyRevoked', { id: keyId, defaultValue: 'Đã thu hồi API key #{{id}}.' }))
    } catch (err) {
      setViewError(err.message || t('settings.apiKeyRevokeError', { defaultValue: 'Không thu hồi được API key.' }))
    } finally {
      setSubmitting(false)
    }
  }

  const exportPersonalData = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      const data = await userApi.exportPersonalData(token)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `kendy-personal-data-${currentUser?.id || 'me'}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      onSetNotice(t('settings.exportData', { defaultValue: 'Đã xuất dữ liệu cá nhân.' }))
    } catch (err) {
      setViewError(err.message || t('settings.exportDataError', { defaultValue: 'Không xuất được dữ liệu cá nhân.' }))
    } finally {
      setSubmitting(false)
    }
  }

  const deleteAccount = async () => {
    const confirmed = window.confirm(t('settings.deleteAccountConfirm', { defaultValue: 'Xoá tài khoản sẽ ẩn danh thông tin cá nhân, thu hồi session/API key và bạn sẽ cần đăng nhập lại. Tiếp tục?' }))
    if (!confirmed) {
      return
    }
    setSubmitting(true)
    setViewError('')
    try {
      await userApi.deleteAccount(token)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('token')
      sessionStorage.clear()
      onSetNotice(t('settings.accountDeleted', { defaultValue: 'Tài khoản đã được xoá/ẩn danh.' }))
      window.location.assign('/')
    } catch (err) {
      setViewError(err.message || t('settings.accountDeleteError', { defaultValue: 'Không xoá được tài khoản.' }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyToken = () => {
    if (createdApiToken) {
      navigator.clipboard.writeText(createdApiToken)
      onSetNotice(t('settings.apiTokenCopied', { defaultValue: 'Đã copy API token vào clipboard.' }))
    }
  }

  return (
    <section className="admin-view" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="admin-toolbar" style={{ borderBottom: '1px solid var(--kd-border)', paddingBottom: '16px', marginBottom: '8px' }}>
        <div>
          <h2>{t('settings.title', { defaultValue: 'Thiết lập tài khoản' })}</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--kd-muted)', fontSize: '14px' }}>
            {t('settings.subtitle', { defaultValue: 'Quản lý thông tin hồ sơ cá nhân, cấu hình bảo mật 2 lớp và API keys của bạn.' })}
          </p>
        </div>
        <button type="button" className="admin-icon-button" onClick={loadSettings} disabled={loading}>
          <RefreshCw size={16} strokeWidth={2.5} className={loading ? 'spin' : ''} aria-hidden="true" />
          <span>{t('settings.reload', { defaultValue: 'Tải lại' })}</span>
        </button>
      </div>

      {error && <p className="admin-message error">{error}</p>}

      <div className="settings-layout-container">
        {/* Facebook style Sidebar */}
        <aside className="settings-sidebar-nav" aria-label={t('settings.settingsMenu', { defaultValue: 'Menu cài đặt' })}>
          <div className="settings-sidebar-header">
            <h3>{t('settings.categories', { defaultValue: 'Danh mục' })}</h3>
          </div>
          <nav className="settings-sidebar-menu">
            <button
              type="button"
              className={`settings-menu-item ${activeSettingsTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('general')}
            >
              <User size={18} className="menu-icon" />
              <div className="menu-text">
                <strong>{t('settings.generalTab', { defaultValue: 'Hồ sơ cá nhân' })}</strong>
                <span>{t('settings.generalTabDesc', { defaultValue: 'Hồ sơ & số dư tài khoản' })}</span>
              </div>
            </button>
            <button
              type="button"
              className={`settings-menu-item ${activeSettingsTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('preferences')}
            >
              <Globe2 size={18} className="menu-icon" />
              <div className="menu-text">
                <strong>{t('settings.preferencesTab', { defaultValue: 'Giao diện & ngôn ngữ' })}</strong>
                <span>{t('settings.preferencesTabDesc', { defaultValue: 'Chế độ sáng tối và ngôn ngữ' })}</span>
              </div>
            </button>
            <button
              type="button"
              className={`settings-menu-item ${activeSettingsTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('security')}
            >
              <ShieldCheck size={18} className="menu-icon" />
              <div className="menu-text">
                <strong>{t('settings.securityTab', { defaultValue: 'Bảo mật & Phiên' })}</strong>
                <span>{t('settings.securityTabDesc', { defaultValue: 'Mật khẩu, 2FA & Thiết bị' })}</span>
              </div>
            </button>
            <button
              type="button"
              className={`settings-menu-item ${activeSettingsTab === 'apikeys' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('apikeys')}
            >
              <Code2 size={18} className="menu-icon" />
              <div className="menu-text">
                <strong>{t('settings.apikeysTab', { defaultValue: 'Developer API Keys' })}</strong>
                <span>{t('settings.apikeysTabDesc', { defaultValue: 'Kết nối API & Scopes' })}</span>
              </div>
            </button>
            <button
              type="button"
              className={`settings-menu-item ${activeSettingsTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('privacy')}
            >
              <FileText size={18} className="menu-icon" />
              <div className="menu-text">
                <strong>{t('settings.privacyTab', { defaultValue: 'Quyền riêng tư' })}</strong>
                <span>{t('settings.privacyTabDesc', { defaultValue: 'Xuất dữ liệu & Xóa tài khoản' })}</span>
              </div>
            </button>
          </nav>
        </aside>

        {/* Content Pane */}
        <main className="settings-main-content">
          {activeSettingsTab === 'general' && (
            <>
              {/* Premium Profile Card */}
              <div className="settings-profile-card">
                <div className="settings-profile-avatar-wrap">
                  {avatarUrl ? (
                    <img className="settings-profile-avatar" src={avatarUrl} alt="" />
                  ) : (
                    <div className="settings-profile-avatar fallback">{profileInitial}</div>
                  )}
                  <label className="settings-avatar-upload" title={t('settings.uploadAvatar', { defaultValue: 'Tải ảnh đại diện' })}>
                    <ImageUp size={16} />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      disabled={uploadingAvatar}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) {
                          uploadAvatar(file)
                        }
                        event.target.value = ''
                      }}
                    />
                  </label>
                </div>
                <div className="settings-profile-info">
                  <span className="eyebrow" style={{ fontSize: '11px', letterSpacing: '1px' }}>{t('settings.member', { defaultValue: 'Thành viên' })}</span>
                  <h4>{currentUser?.name || currentUser?.email || t('common.user', { defaultValue: 'Người dùng' })}</h4>
                  <p>
                    <span>{currentUser?.email}</span>
                    {oauthProvider && (
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                        {t('settings.loginWith', { provider: oauthProvider, defaultValue: 'Đăng nhập bằng {{provider}}' })}
                      </span>
                    )}
                  </p>
                  <div className="settings-profile-stats">
                    <div className="settings-stat-pill">
                      <span>{t('settings.walletBalance', { defaultValue: 'Số dư ví:' })}</span>
                      <strong style={{ color: 'var(--kd-blue)' }}>{formatAdminMoney(dashboard?.balance ?? currentUser?.balance)}</strong>
                    </div>
                    <div className="settings-stat-pill">
                      <span>{t('settings.ordersCount', { defaultValue: 'Đơn hàng:' })}</span>
                      <strong>{t('settings.ordersCreated', { count: dashboard?.orderCount ?? 0, defaultValue: '{{count}} đã tạo' })}</strong>
                    </div>
                    <div className="settings-stat-pill">
                      <span>{t('settings.twoFAStatus', { defaultValue: 'Trạng thái 2FA:' })}</span>
                      <strong style={{ color: security?.twoFactorEnabled ? 'var(--kd-success)' : 'var(--kd-warning)' }}>
                        {security?.twoFactorEnabled ? t('settings.twoFAOn', { defaultValue: 'Đang Bật' }) : t('settings.twoFAOff', { defaultValue: 'Đang Tắt' })}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-form-grid">
                {/* Profile Edit Card */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div>
                      <h3><User size={16} /> {t('settings.updateProfile', { defaultValue: 'Cập nhật hồ sơ' })}</h3>
                      <div className="settings-card-header-desc">{t('settings.profileDesc', { defaultValue: 'Thay đổi thông tin liên lạc hiển thị trên hóa đơn.' })}</div>
                    </div>
                    <AdminStatusBadge status={currentUser?.status || 'ACTIVE'} />
                  </div>
                  <div className="settings-card-body">
                    <form className="settings-form-grid" onSubmit={updateProfile}>
                      <div className="settings-input-group">
                        <label>{t('settings.displayName', { defaultValue: 'Tên hiển thị' })}</label>
                        <input
                          value={profileForm.name}
                          onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="settings-input-group">
                        <label>{t('settings.emailAddress', { defaultValue: 'Địa chỉ Email' })}</label>
                        <input
                          value={profileForm.email}
                          onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                          type="email"
                          required
                        />
                      </div>
                      <div className="settings-input-group full-width">
                        <label>{t('settings.uploadAvatar', { defaultValue: 'Ảnh đại diện' })}</label>
                        <label className="settings-avatar-file-button">
                          <ImageUp size={17} />
                          <span>{uploadingAvatar
                            ? t('settings.uploadingAvatar', { defaultValue: 'Đang tải ảnh...' })
                            : t('settings.chooseAvatar', { defaultValue: 'Chọn ảnh từ máy' })}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            disabled={uploadingAvatar}
                            onChange={(event) => {
                              const file = event.target.files?.[0]
                              if (file) {
                                uploadAvatar(file)
                              }
                              event.target.value = ''
                            }}
                          />
                        </label>
                        <small>JPG, PNG, GIF hoặc WEBP; tối đa 10 MB.</small>
                      </div>
                      <div className="settings-input-group full-width">
                        <label>{t('settings.phone', { defaultValue: 'Số điện thoại' })}</label>
                        <input
                          value={profileForm.phone}
                          onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                          placeholder={t('settings.phonePlaceholder', { defaultValue: 'Nhập số điện thoại' })}
                        />
                      </div>
                      <div className="full-width" style={{ marginTop: '8px' }}>
                        <button type="submit" className="settings-btn-save" disabled={submitting}>
                          <Save size={16} />
                          <span>{t('settings.saveInfo', { defaultValue: 'Lưu thông tin' })}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Account Usage Card */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div>
                      <h3>{t('settings.accountStats', { defaultValue: 'Thống kê tài khoản' })}</h3>
                      <div className="settings-card-header-desc">{t('settings.accountStatsDesc', { defaultValue: 'Tổng quan quá trình sử dụng và nạp ví.' })}</div>
                    </div>
                  </div>
                  <div className="settings-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="admin-report-grid compact-report" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                      <div><span>{t('settings.processingOrders', { defaultValue: 'Đơn xử lý' })}</span><strong>{dashboard?.processingOrders ?? 0}</strong></div>
                      <div><span>{t('settings.completedOrders', { defaultValue: 'Đơn hoàn tất' })}</span><strong>{dashboard?.completedOrders ?? 0}</strong></div>
                      <div><span>{t('settings.completedDeposits', { defaultValue: 'Nạp hoàn tất' })}</span><strong>{dashboard?.completedDeposits ?? 0}</strong></div>
                      <div><span>{t('settings.supportTickets', { defaultValue: 'Ticket hỗ trợ' })}</span><strong>{dashboard?.ticketCount ?? 0}</strong></div>
                    </div>
                    <div style={{ height: '1px', background: 'var(--kd-border)' }}></div>
                    <div className="admin-report-grid compact-report" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                      <div><span>{t('settings.totalDeposits', { defaultValue: 'Tổng nạp' })}</span><strong>{formatAdminMoney(dashboard?.completedDepositAmount)}</strong></div>
                      <div><span>{t('settings.totalSpent', { defaultValue: 'Đã chi tiêu' })}</span><strong>{formatAdminMoney(dashboard?.purchaseAmount)}</strong></div>
                      <div><span>{t('settings.walletRefund', { defaultValue: 'Hoàn trả ví' })}</span><strong>{formatAdminMoney(dashboard?.refundAmount)}</strong></div>
                      <div><span>{t('settings.walletTransactions', { defaultValue: 'Giao dịch ví' })}</span><strong>{dashboard?.walletTransactionCount ?? 0}</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSettingsTab === 'preferences' && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h3><Globe2 size={16} /> {t('settings.preferencesTab', { defaultValue: 'Giao diện & ngôn ngữ' })}</h3>
                  <div className="settings-card-header-desc">
                    {t('settings.preferencesDesc', { defaultValue: 'Lựa chọn được lưu trên trình duyệt và giữ nguyên trước, trong và sau khi đăng nhập.' })}
                  </div>
                </div>
              </div>
              <div className="settings-card-body settings-preferences-grid">
                <div className="settings-preference-item">
                  <div>
                    <strong>{t('settings.languageLabel', { defaultValue: 'Ngôn ngữ' })}</strong>
                    <span>Tiếng Việt / English</span>
                  </div>
                  <LanguageSwitcher />
                </div>
                <div className="settings-preference-item">
                  <div>
                    <strong>{t('settings.themeLabel', { defaultValue: 'Giao diện' })}</strong>
                    <span>{theme === 'dark'
                      ? t('settings.darkTheme', { defaultValue: 'Chế độ tối' })
                      : t('settings.lightTheme', { defaultValue: 'Chế độ sáng' })}</span>
                  </div>
                  <button
                    type="button"
                    className="admin-icon-button"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                    <span>{theme === 'dark'
                      ? t('settings.switchLight', { defaultValue: 'Chuyển sang sáng' })
                      : t('settings.switchDark', { defaultValue: 'Chuyển sang tối' })}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'security' && (
            <div style={{ display: 'grid', gap: '24px' }}>
              <div className="settings-form-grid">
                {/* Password Change Card */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div>
                      <h3><Lock size={16} /> {t('settings.changePassword', { defaultValue: 'Đổi mật khẩu' })}</h3>
                      <div className="settings-card-header-desc">{t('settings.passwordDesc', { defaultValue: 'Mật khẩu nên chứa tối thiểu 8 ký tự kèm chữ hoa, chữ số.' })}</div>
                    </div>
                  </div>
                  <div className="settings-card-body">
                    <form className="settings-form-grid" onSubmit={changePassword}>
                      <div className="settings-input-group full-width">
                        <label>{t('settings.currentPassword', { defaultValue: 'Mật khẩu hiện tại' })}</label>
                        <input
                          value={passwordForm.currentPassword}
                          onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                          type="password"
                          required
                        />
                      </div>
                      <div className="settings-input-group full-width">
                        <label>{t('settings.newPassword', { defaultValue: 'Mật khẩu mới' })}</label>
                        <input
                          value={passwordForm.newPassword}
                          onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                          minLength="8"
                          type="password"
                          required
                        />
                      </div>
                      <div className="settings-input-group full-width">
                        <label>{t('settings.confirmNewPassword', { defaultValue: 'Xác nhận mật khẩu mới' })}</label>
                        <input
                          value={passwordForm.confirmPassword}
                          onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                          minLength="8"
                          type="password"
                          required
                        />
                      </div>
                      <div className="full-width" style={{ marginTop: '8px' }}>
                        <button type="submit" className="settings-btn-save" disabled={submitting}>
                          {t('settings.changePassword', { defaultValue: 'Đổi mật khẩu' })}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* 2FA Card */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div>
                      <h3><Shield size={16} /> {t('settings.twoFATitle', { defaultValue: 'Xác thực 2 lớp (2FA)' })}</h3>
                      <div className="settings-card-header-desc">{t('settings.twoFADesc', { defaultValue: 'Xác nhận danh tính của bạn qua mã OTP để bảo vệ tài sản.' })}</div>
                    </div>
                  </div>
                  <div className="settings-card-body">
                    {/* Status Banner */}
                    <div className={`twofa-status-banner ${security?.twoFactorEnabled ? 'active' : 'disabled'}`}>
                      {security?.twoFactorEnabled ? (
                        <>
                          <CheckCircle2 size={24} />
                          <div className="twofa-status-desc">
                            <strong>{t('settings.twoFAEnabled', { defaultValue: 'Bảo mật 2FA đang BẬT' })}</strong>
                            <span>{t('settings.twoFAEnabledDesc', { defaultValue: 'Tài khoản của bạn đã được bảo vệ tối đa.' })}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={24} />
                          <div className="twofa-status-desc">
                            <strong>{t('settings.twoFADisabled', { defaultValue: 'Bảo mật 2FA đang TẮT' })}</strong>
                            <span>{t('settings.twoFADisabledDesc', { defaultValue: 'Kích hoạt 2FA để tránh rủi ro mất tài khoản hoặc tiền trong ví.' })}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {!security?.twoFactorEnabled ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="twofa-options-grid">
                          <div className="twofa-setup-box">
                            <h4>{t('settings.emailOTP', { defaultValue: '2FA qua Email' })}</h4>
                            <p>{t('settings.emailOTPDesc', { defaultValue: 'Nhận mã xác nhận dùng 1 lần (OTP) gửi trực tiếp tới email đăng ký của bạn.' })}</p>
                            <button type="button" disabled={submitting} onClick={sendEmailTwoFactorCode}>
                              {t('settings.setupEmailOTP', { defaultValue: 'Thiết lập Email OTP' })}
                            </button>
                          </div>
                          <div className="twofa-setup-box">
                            <h4>{t('settings.authenticatorApp', { defaultValue: 'Authenticator App (TOTP)' })}</h4>
                            <p>{t('settings.authenticatorDesc', { defaultValue: 'Sử dụng ứng dụng như Google Authenticator để quét QR Code và lấy mã tự động.' })}</p>
                            <button type="button" disabled={submitting} onClick={setupTotp}>
                              {t('settings.setupAuthenticator', { defaultValue: 'Thiết lập ứng dụng 2FA' })}
                            </button>
                          </div>
                        </div>

                        {twoFactorEmailSent && (
                          <form className="admin-form compact" onSubmit={enableEmailTwoFactor} style={{ borderTop: '1px solid var(--kd-border)', paddingTop: '16px', marginTop: '8px' }}>
                            <div className="settings-input-group">
                              <label>{t('settings.emailCodeLabel', { defaultValue: 'Mã xác minh Email (6 chữ số)' })}</label>
                              <input
                                value={twoFactorForm.code}
                                onChange={(event) => setTwoFactorForm((current) => ({ ...current, code: event.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                inputMode="numeric"
                                placeholder={t('settings.emailCodePlaceholder', { defaultValue: 'Nhập mã OTP nhận được từ email' })}
                              />
                            </div>
                            <button type="submit" className="settings-btn-save" disabled={submitting || twoFactorForm.code.length < 6} style={{ marginTop: '8px' }}>
                              {t('settings.confirmEnable2FA', { defaultValue: 'Xác nhận Bật 2FA Email' })}
                            </button>
                          </form>
                        )}
                      </div>
                    ) : (
                      <form className="settings-form-grid" onSubmit={(event) => event.preventDefault()}>
                        <div className="settings-input-group full-width">
                          <label>{t('settings.passwordAuthLabel', { defaultValue: 'Nhập mật khẩu xác thực hành động' })}</label>
                          <input
                            value={twoFactorForm.password}
                            onChange={(event) => setTwoFactorForm((current) => ({ ...current, password: event.target.value }))}
                            type="password"
                            placeholder={t('settings.passwordAuthPlaceholder', { defaultValue: 'Nhập mật khẩu hiện tại của bạn' })}
                          />
                        </div>
                        <div className="settings-input-group full-width">
                          <label>{t('settings.twoFACodeLabel', { defaultValue: 'Nhập mã 2FA / Backup Code (nếu tắt)' })}</label>
                          <input
                            value={twoFactorForm.code}
                            onChange={(event) => setTwoFactorForm((current) => ({ ...current, code: event.target.value.trim() }))}
                            placeholder={t('settings.twoFACodePlaceholder', { defaultValue: 'Mã xác thực 6 số' })}
                          />
                        </div>
                        <div className="full-width" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                          <button type="button" className="admin-danger-button slim" style={{ borderRadius: '10px', minHeight: '38px' }} disabled={submitting} onClick={() => runTwoFactorProtectedAction('disable')}>
                            {t('settings.disable2FA', { defaultValue: 'Tắt bảo mật 2FA' })}
                          </button>
                          <button type="button" className="admin-icon-button" style={{ borderRadius: '10px', minHeight: '38px', padding: '0 12px' }} disabled={submitting} onClick={() => runTwoFactorProtectedAction('reset')}>
                            {t('settings.resetTOTP', { defaultValue: 'Reset TOTP App' })}
                          </button>
                          <button type="button" className="admin-icon-button" style={{ borderRadius: '10px', minHeight: '38px', padding: '0 12px' }} disabled={submitting} onClick={() => runTwoFactorProtectedAction('backup')}>
                            {t('settings.generateBackup', { defaultValue: 'Tạo mã dự phòng mới' })}
                          </button>
                        </div>
                      </form>
                    )}

                    {totpSetup && (
                      <div className="totp-qr-container">
                        <strong>{t('settings.scanQR', { defaultValue: 'Quét mã QR bằng Google/Microsoft Authenticator:' })}</strong>
                        {totpSetup.qrCodeBase64 && (
                          <img alt="TOTP QR" src={`data:image/png;base64,${totpSetup.qrCodeBase64}`} style={{ width: '180px', height: '180px' }} />
                        )}
                        <div className="totp-secret-block">
                          <strong>{t('settings.enterSecretKey', { defaultValue: 'Hoặc nhập Secret Key thủ công:' })}</strong>
                          <code>{totpSetup.secret}</code>
                        </div>
                        {totpSetup.backupCodes && totpSetup.backupCodes.length > 0 && (
                          <div style={{ width: '100%', borderTop: '1px solid var(--kd-border)', paddingTop: '12px', marginTop: '8px' }}>
                            <strong style={{ fontSize: '12px', color: 'var(--kd-warning)', display: 'block', marginBottom: '6px' }}>
                              {t('settings.saveBackupCodes', { defaultValue: 'Lưu trữ các mã dự phòng sau (dùng khi mất điện thoại):' })}
                            </strong>
                            <pre style={{ margin: 0, padding: '10px', background: 'var(--kd-bg)', borderRadius: '8px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>
                              {totpSetup.backupCodes.join('   ')}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {totpSetup && (
                      <form className="admin-form compact" onSubmit={enableTotp} style={{ marginTop: '14px' }}>
                        <div className="settings-input-group">
                          <label>{t('settings.enterTOTPCode', { defaultValue: 'Nhập mã xác thực 6 số trên App' })}</label>
                          <input
                            value={totpCode}
                            onChange={(event) => setTotpCode(event.target.value.trim())}
                            placeholder={t('settings.totpPlaceholder', { defaultValue: 'Mã hiển thị trên ứng dụng Authenticator' })}
                          />
                        </div>
                        <button type="submit" className="settings-btn-save" disabled={submitting || !totpCode} style={{ marginTop: '8px' }}>
                          {t('settings.activateTotp', { defaultValue: 'Kích hoạt ứng dụng TOTP' })}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* Sessions Management Card */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h3><Smartphone size={16} /> {t('settings.sessionsTitle', { defaultValue: 'Các phiên đăng nhập đang hoạt động' })}</h3>
                    <div className="settings-card-header-desc">{t('settings.sessionsDesc', { defaultValue: 'Danh sách các trình duyệt và thiết bị đã đăng nhập gần đây.' })}</div>
                  </div>
                  <button
                    type="button"
                    className="admin-danger-button slim"
                    disabled={submitting || sessionList.length === 0}
                    onClick={revokeAllSessions}
                    style={{ borderRadius: '10px', minHeight: '34px', fontSize: '12px' }}
                  >
                    {t('settings.revokeAll', { defaultValue: 'Đăng xuất tất cả thiết bị khác' })}
                  </button>
                </div>
                <div className="settings-card-body" style={{ padding: '20px' }}>
                  <div className="session-list">
                    {sessionList.map((session) => (
                      <div className="session-item" key={session.id}>
                        <div className="session-info">
                          <Smartphone size={22} style={{ color: 'var(--kd-muted)' }} />
                          <div className="session-details">
                            <strong>
                              {t('settings.sessionItem', { id: session.id, defaultValue: 'Phiên đăng nhập #{{id}}' })}
                              {session.isCurrent && <span className="session-badge">{t('settings.currentDevice', { defaultValue: 'Thiết bị hiện tại' })}</span>}
                            </strong>
                            <span>
                              {t('settings.sessionTime', { created: formatAdminDate(session.createdAt), lastUsed: formatAdminDate(session.lastUsedAt), defaultValue: 'Tạo ngày: {{created}} · Dùng cuối: {{lastUsed}}' })}
                            </span>
                          </div>
                        </div>
                        {!session.isCurrent && (
                          <button
                            type="button"
                            className="admin-danger-button slim"
                            disabled={submitting || session.revokedAt}
                            onClick={() => revokeSession(session.id)}
                            style={{ borderRadius: '8px', minHeight: '30px', fontSize: '11px', padding: '0 10px' }}
                          >
                            {t('settings.revoke', { defaultValue: 'Thu hồi' })}
                          </button>
                        )}
                      </div>
                    ))}
                    {sessionList.length === 0 && <AdminEmptyState message={t('settings.noSessions', { defaultValue: 'Không tìm thấy lịch sử phiên hoạt động.' })} />}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'apikeys' && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h3><KeyRound size={16} /> {t('settings.apikeysTitle', { defaultValue: 'API Keys' })}</h3>
                  <div className="settings-card-header-desc">
                    {t('settings.apikeysDesc', { defaultValue: 'Tạo khóa API dùng để xác thực hệ thống bên ngoài (script, bot, tool) với tài khoản của bạn.' })}
                    <br />
                    <span style={{ fontSize: '12px', color: 'var(--kd-muted)', marginTop: '4px', display: 'block', lineHeight: '1.6' }}>
                      <strong>Cách dùng:</strong> Gửi header <code style={{ background: '#1e293b', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>X-Api-Key: kdy_&lt;token&gt;</code> trong mọi request.
                      Scopes giới hạn quyền (VD: <code>orders:read</code> = chỉ đọc đơn, <code>wallet:read</code> = chỉ xem ví).
                      Key chỉ hiện <strong>1 lần</strong> duy nhất lúc tạo. Hãy sao chép và lưu an toàn.
                    </span>
                  </div>
                </div>
              </div>
              <div className="settings-card-body">
                <form className="settings-form-grid" onSubmit={createApiKey} style={{ borderBottom: '1px solid var(--kd-border)', paddingBottom: '24px', marginBottom: '24px' }}>
                  <div className="settings-input-group">
                    <label>{t('settings.apiKeyNameLabel', { defaultValue: 'Tên định danh API Key' })}</label>
                    <input
                      value={apiKeyForm.name}
                      onChange={(event) => setApiKeyForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder={t('settings.apiKeyNamePlaceholder', { defaultValue: 'Ví dụ: Tool Auto Deposit' })}
                      required
                    />
                  </div>
                  <div className="settings-input-group">
                    <label>{t('settings.apiKeyScopesLabel', { defaultValue: 'Scopes (Phân quyền API - phân tách bằng dấu phẩy)' })}</label>
                    <input
                      value={apiKeyForm.scopes}
                      onChange={(event) => setApiKeyForm((current) => ({ ...current, scopes: event.target.value }))}
                      placeholder={t('settings.apiKeyScopesPlaceholder', { defaultValue: 'orders:read,wallet:read' })}
                    />
                  </div>
                  <div className="full-width" style={{ marginTop: '8px' }}>
                    <button type="submit" className="settings-btn-save" disabled={submitting}>
                      <Plus size={16} />
                      <span>{t('settings.createApiKeyBtn', { defaultValue: 'Tạo khóa API mới' })}</span>
                    </button>
                  </div>
                </form>

                {createdApiToken && (
                  <div className="totp-qr-container" style={{ borderLeft: '4px solid var(--kd-blue)', background: 'var(--kd-bg)', margin: '0 0 24px', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ color: 'var(--kd-danger)', fontSize: '13px' }}>
                        {t('settings.apiTokenWarning', { defaultValue: 'API Token mới tạo (Lưu ý: Hãy sao chép ngay, khóa này chỉ hiển thị duy nhất 1 lần):' })}
                      </strong>
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none', background: 'transparent', color: 'var(--kd-blue)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        <Copy size={14} /> {t('settings.copyTokenBtn', { defaultValue: 'Copy Token' })}
                      </button>
                    </div>
                    <pre style={{ margin: 0, padding: '12px', background: '#0f172a', color: '#10b981', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', fontFamily: 'monospace', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                      {createdApiToken}
                    </pre>
                  </div>
                )}

                <div className="apikey-list">
                  <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--kd-text)' }}>
                    {t('settings.apiKeysListTitle', { defaultValue: 'Danh sách API Keys của bạn' })}
                  </h4>
                  {apiKeyList.map((apiKey) => (
                    <div className="apikey-item" key={apiKey.id}>
                      <div className="apikey-item-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong>{apiKey.name}</strong>
                          <span className="key-prefix">{t('settings.apiKeyId', { id: apiKey.id, defaultValue: 'ID: #{{id}}' })}</span>
                          <span style={{ fontSize: '12px', color: apiKey.revokedAt ? 'var(--kd-danger)' : 'var(--kd-success)', fontWeight: 'bold' }}>
                            {apiKey.revokedAt ? t('settings.keyRevoked', { defaultValue: '• Đã hủy' }) : t('settings.keyActive', { defaultValue: '• Hoạt động' })}
                          </span>
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--kd-muted)', marginTop: '2px' }}>
                          {t('settings.keyPrefixLabel', { defaultValue: 'Tiền tố: ' })}<code>{apiKey.keyPrefix}</code>
                        </span>
                        {apiKey.scopes && apiKey.scopes.length > 0 && (
                          <div className="apikey-scope-badges">
                            {apiKey.scopes.map((scope) => (
                              <span className="scope-badge" key={scope}>
                                {scope}
                              </span>
                            ))}
                          </div>
                        )}
                        {apiKey.revokedAt && (
                          <span style={{ fontSize: '11px', color: 'var(--kd-muted)', marginTop: '4px' }}>
                            {t('settings.keyRevokedTime', { time: formatAdminDate(apiKey.revokedAt), defaultValue: 'Thời gian thu hồi: {{time}}' })}
                          </span>
                        )}
                      </div>
                      {!apiKey.revokedAt && (
                        <button
                          type="button"
                          className="admin-danger-button slim"
                          disabled={submitting}
                          onClick={() => revokeApiKey(apiKey.id)}
                          style={{ borderRadius: '8px', minHeight: '32px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Trash2 size={13} />
                          <span>{t('settings.revoke', { defaultValue: 'Thu hồi' })}</span>
                        </button>
                      )}
                    </div>
                  ))}
                  {apiKeyList.length === 0 && <AdminEmptyState message={t('settings.noApiKeys', { defaultValue: 'Tài khoản của bạn chưa có API key nào.' })} />}
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'privacy' && (
            <div className="settings-form-grid">
              {/* Export Data Card */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h3><Download size={16} /> {t('settings.exportDataTitle', { defaultValue: 'Xuất dữ liệu cá nhân' })}</h3>
                    <div className="settings-card-header-desc">{t('settings.exportDataDesc', { defaultValue: 'Tải về toàn bộ thông tin tài khoản được lưu trên hệ thống.' })}</div>
                  </div>
                </div>
                <div className="settings-card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <div className="privacy-banner">
                      {t('settings.exportDataBanner', { defaultValue: 'Bản sao lưu dữ liệu dưới định dạng JSON bao gồm: Thông tin tài khoản, danh sách đơn hàng đã mua, lịch sử các yêu cầu nạp tiền, giao dịch ví, tickets hỗ trợ và thông số các phiên đăng nhập.' })}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="settings-btn-save"
                    disabled={submitting}
                    onClick={exportPersonalData}
                    style={{ width: 'max-content', marginTop: '12px' }}
                  >
                    <Download size={16} />
                    <span>{t('settings.exportDataBtn', { defaultValue: 'Tạo bản sao lưu JSON' })}</span>
                  </button>
                </div>
              </div>

              {/* Account Deletion Card */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h3><Trash2 size={16} /> {t('settings.deleteAccountTitle', { defaultValue: 'Yêu cầu xoá tài khoản' })}</h3>
                    <div className="settings-card-header-desc">{t('settings.deleteAccountDesc', { defaultValue: 'Xóa hoặc vô hiệu hóa tài khoản và ẩn danh thông tin cá nhân.' })}</div>
                  </div>
                  <AdminStatusBadge status="GDPR" />
                </div>
                <div className="settings-card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <div className="privacy-banner" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
                      {t('settings.deleteAccountBanner', { defaultValue: 'Cảnh báo quan trọng: Hành động này sẽ ẩn danh toàn bộ email, tên hiển thị, số điện thoại, ngắt các liên kết OAuth và thu hồi mọi API Keys/Sessions. Dữ liệu tài chính (lịch sử giao dịch ví, đơn hàng) sẽ được giữ lại ở trạng thái vô danh để phục vụ đối soát tài chính của hệ thống.' })}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="admin-danger-button"
                    disabled={submitting}
                    onClick={deleteAccount}
                    style={{ width: 'max-content', marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={15} />
                    <span>{t('settings.deleteAccountBtn', { defaultValue: 'Yêu cầu xoá vĩnh viễn' })}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  )
}

export default SettingsView
