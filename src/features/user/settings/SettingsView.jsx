import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  FileText,
  HelpCircle,
  KeyRound,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Shield,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { userApi } from '../../../api/user.api'
import { AdminEmptyState, AdminStatusBadge } from '../../admin/AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../admin/adminFormat'

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
  const [totpCode, setTotpCode] = useState('')
  const [totpSetup, setTotpSetup] = useState(null)
  const [twoFactorForm, setTwoFactorForm] = useState({ code: '', password: '' })
  const [twoFactorEmailSent, setTwoFactorEmailSent] = useState(false)

  // Mobile optimization tab state
  const [activeSettingsTab, setActiveSettingsTab] = useState('general') // 'general' | 'security' | 'apikeys' | 'privacy'

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
      setViewError(err.message || 'Không tải được cài đặt tài khoản.')
    } finally {
      setLoading(false)
    }
  }, [onCurrentUserChange, setViewError, token])

  useEffect(() => {
    const timer = window.setTimeout(loadSettings, 0)
    return () => window.clearTimeout(timer)
  }, [loadSettings])

  const updateProfile = async (event) => {
    event.preventDefault()
    if (!profileForm.name.trim()) {
      setViewError('Tên hiển thị không được để trống.')
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const currentAvatarUrl = currentUser?.avatarUrl || currentUser?.avatar || currentUser?.picture || currentUser?.imageUrl || currentUser?.photoUrl || ''
      const payload = {
        email: profileForm.email.trim() || undefined,
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim() || undefined,
      }

      if (profileForm.avatarUrl.trim() !== currentAvatarUrl) {
        payload.avatarUrl = profileForm.avatarUrl.trim() || undefined
      }

      if (profileForm.email.trim() === currentUser?.email) {
        delete payload.email
      }

      const saved = await userApi.updateProfile(payload, token)
      onCurrentUserChange(saved)
      setProfileForm(profileToForm(saved))
      onSetNotice('Đã cập nhật thông tin tài khoản.')
    } catch (err) {
      setViewError(err.message || 'Không cập nhật được thông tin tài khoản.')
    } finally {
      setSubmitting(false)
    }
  }

  const avatarUrl = profileForm.avatarUrl || currentUser?.avatarUrl || currentUser?.avatar || currentUser?.picture || currentUser?.imageUrl || currentUser?.photoUrl
  const profileInitial = (profileForm.name || profileForm.email || currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()
  const oauthProvider = currentUser?.oauthProvider || currentUser?.provider || currentUser?.loginProvider

  const changePassword = async (event) => {
    event.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setViewError('Mật khẩu mới và xác nhận mật khẩu không khớp.')
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
      onSetNotice('Đã đổi mật khẩu.')
    } catch (err) {
      setViewError(err.message || 'Không đổi được mật khẩu.')
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
      onSetNotice('Đã gửi mã xác thực 2FA qua email.')
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
      const saved = await userApi.enableEmailTwoFactor({ code: twoFactorForm.code.trim() }, token)
      onCurrentUserChange(saved)
      setTwoFactorEmailSent(false)
      setTwoFactorForm({ code: '', password: '' })
      await loadSettings()
      onSetNotice('Đã bật 2FA qua email.')
    } catch (err) {
      setViewError(err.message || 'Không bật được 2FA qua email.')
    } finally {
      setSubmitting(false)
    }
  }

  const setupTotp = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      setTotpSetup(await userApi.setupTwoFactor(token))
      onSetNotice('Đã tạo mã cài đặt TOTP.')
    } catch (err) {
      setViewError(err.message || 'Không tạo được mã cài đặt TOTP.')
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
      onSetNotice('Đã bật 2FA TOTP.')
    } catch (err) {
      setViewError(err.message || 'Mã TOTP không hợp lệ.')
    } finally {
      setSubmitting(false)
    }
  }

  const runTwoFactorProtectedAction = async (action) => {
    if (!twoFactorForm.password.trim()) {
      setViewError('Nhập mật khẩu hiện tại để xử lý 2FA.')
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
      onSetNotice('Đã xử lý cài đặt 2FA.')
    } catch (err) {
      setViewError(err.message || 'Không xử lý được cài đặt 2FA.')
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
      onSetNotice(`Đã thu hồi session #${sessionId}.`)
    } catch (err) {
      setViewError(err.message || 'Không thu hồi được session.')
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
      onSetNotice('Đã thu hồi tất cả session.')
    } catch (err) {
      setViewError(err.message || 'Không thu hồi được tất cả session.')
    } finally {
      setSubmitting(false)
    }
  }

  const createApiKey = async (event) => {
    event.preventDefault()
    if (!apiKeyForm.name.trim()) {
      setViewError('Tên API key không được để trống.')
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
      onSetNotice('Đã tạo API key mới.')
    } catch (err) {
      setViewError(err.message || 'Không tạo được API key.')
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
      onSetNotice(`Đã thu hồi API key #${keyId}.`)
    } catch (err) {
      setViewError(err.message || 'Không thu hồi được API key.')
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
      onSetNotice('Đã xuất dữ liệu cá nhân.')
    } catch (err) {
      setViewError(err.message || 'Không xuất được dữ liệu cá nhân.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteAccount = async () => {
    const confirmed = window.confirm('Xoá tài khoản sẽ ẩn danh thông tin cá nhân, thu hồi session/API key và bạn sẽ cần đăng nhập lại. Tiếp tục?')
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
      onSetNotice('Tài khoản đã được xoá/ẩn danh.')
      window.location.assign('/')
    } catch (err) {
      setViewError(err.message || 'Không xoá được tài khoản.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyToken = () => {
    if (createdApiToken) {
      navigator.clipboard.writeText(createdApiToken)
      onSetNotice('Đã copy API token vào clipboard.')
    }
  }

  return (
    <section className="admin-view" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="admin-toolbar" style={{ borderBottom: '1px solid var(--kd-border)', paddingBottom: '16px', marginBottom: '8px' }}>
        <div>
          <h2>Thiết lập tài khoản</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--kd-muted)', fontSize: '14px' }}>
            Quản lý thông tin hồ sơ cá nhân, cấu hình bảo mật 2 lớp và API keys của bạn.
          </p>
        </div>
        <button type="button" className="admin-icon-button" onClick={loadSettings} disabled={loading}>
          <RefreshCw size={16} strokeWidth={2.5} className={loading ? 'spin' : ''} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {error && <p className="admin-message error">{error}</p>}

      <div className="settings-layout-container">
        {/* Facebook style Sidebar */}
        <aside className="settings-sidebar-nav" aria-label="Menu cài đặt">
          <div className="settings-sidebar-header">
            <h3>Danh mục</h3>
          </div>
          <nav className="settings-sidebar-menu">
            <button
              type="button"
              className={`settings-menu-item ${activeSettingsTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('general')}
            >
              <User size={18} className="menu-icon" />
              <div className="menu-text">
                <strong>Hồ sơ cá nhân</strong>
                <span>Hồ sơ & số dư tài khoản</span>
              </div>
            </button>
            <button
              type="button"
              className={`settings-menu-item ${activeSettingsTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('security')}
            >
              <ShieldCheck size={18} className="menu-icon" />
              <div className="menu-text">
                <strong>Bảo mật & Phiên</strong>
                <span>Mật khẩu, 2FA & Thiết bị</span>
              </div>
            </button>
            <button
              type="button"
              className={`settings-menu-item ${activeSettingsTab === 'apikeys' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('apikeys')}
            >
              <Code2 size={18} className="menu-icon" />
              <div className="menu-text">
                <strong>Developer API Keys</strong>
                <span>Kết nối API & Scopes</span>
              </div>
            </button>
            <button
              type="button"
              className={`settings-menu-item ${activeSettingsTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('privacy')}
            >
              <FileText size={18} className="menu-icon" />
              <div className="menu-text">
                <strong>Quyền riêng tư</strong>
                <span>Xuất dữ liệu & Xóa tài khoản</span>
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
                </div>
                <div className="settings-profile-info">
                  <span className="eyebrow" style={{ fontSize: '11px', letterSpacing: '1px' }}>Thành viên</span>
                  <h4>{currentUser?.name || currentUser?.email || 'Người dùng'}</h4>
                  <p>
                    <span>{currentUser?.email}</span>
                    {oauthProvider && (
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                        Đăng nhập bằng {oauthProvider}
                      </span>
                    )}
                  </p>
                  <div className="settings-profile-stats">
                    <div className="settings-stat-pill">
                      <span>Số dư ví:</span>
                      <strong style={{ color: 'var(--kd-blue)' }}>{formatAdminMoney(dashboard?.balance ?? currentUser?.balance)}</strong>
                    </div>
                    <div className="settings-stat-pill">
                      <span>Đơn hàng:</span>
                      <strong>{dashboard?.orderCount ?? 0} đã tạo</strong>
                    </div>
                    <div className="settings-stat-pill">
                      <span>Trạng thái 2FA:</span>
                      <strong style={{ color: security?.twoFactorEnabled ? 'var(--kd-success)' : 'var(--kd-warning)' }}>
                        {security?.twoFactorEnabled ? 'Đang Bật' : 'Đang Tắt'}
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
                      <h3><User size={16} /> Cập nhật hồ sơ</h3>
                      <div className="settings-card-header-desc">Thay đổi thông tin liên lạc hiển thị trên hóa đơn.</div>
                    </div>
                    <AdminStatusBadge status={currentUser?.status || 'ACTIVE'} />
                  </div>
                  <div className="settings-card-body">
                    <form className="settings-form-grid" onSubmit={updateProfile}>
                      <div className="settings-input-group">
                        <label>Tên hiển thị</label>
                        <input
                          value={profileForm.name}
                          onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="settings-input-group">
                        <label>Địa chỉ Email</label>
                        <input
                          value={profileForm.email}
                          onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                          type="email"
                          required
                        />
                      </div>
                      <div className="settings-input-group full-width">
                        <label>Ảnh đại diện (Avatar URL)</label>
                        <input
                          value={profileForm.avatarUrl}
                          onChange={(event) => setProfileForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                          placeholder="https://example.com/avatar.png"
                        />
                      </div>
                      <div className="settings-input-group full-width">
                        <label>Số điện thoại</label>
                        <input
                          value={profileForm.phone}
                          onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                      <div className="full-width" style={{ marginTop: '8px' }}>
                        <button type="submit" className="settings-btn-save" disabled={submitting}>
                          <Save size={16} />
                          <span>Lưu thông tin</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Account Usage Card */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div>
                      <h3>Thống kê tài khoản</h3>
                      <div className="settings-card-header-desc">Tổng quan quá trình sử dụng và nạp ví.</div>
                    </div>
                  </div>
                  <div className="settings-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="admin-report-grid compact-report" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                      <div><span>Đơn xử lý</span><strong>{dashboard?.processingOrders ?? 0}</strong></div>
                      <div><span>Đơn hoàn tất</span><strong>{dashboard?.completedOrders ?? 0}</strong></div>
                      <div><span>Nạp hoàn tất</span><strong>{dashboard?.completedDeposits ?? 0}</strong></div>
                      <div><span>Ticket hỗ trợ</span><strong>{dashboard?.ticketCount ?? 0}</strong></div>
                    </div>
                    <div style={{ height: '1px', background: 'var(--kd-border)' }}></div>
                    <div className="admin-report-grid compact-report" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                      <div><span>Tổng nạp</span><strong>{formatAdminMoney(dashboard?.completedDepositAmount)}</strong></div>
                      <div><span>Đã chi tiêu</span><strong>{formatAdminMoney(dashboard?.purchaseAmount)}</strong></div>
                      <div><span>Hoàn trả ví</span><strong>{formatAdminMoney(dashboard?.refundAmount)}</strong></div>
                      <div><span>Giao dịch ví</span><strong>{dashboard?.walletTransactionCount ?? 0}</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSettingsTab === 'security' && (
            <div style={{ display: 'grid', gap: '24px' }}>
              <div className="settings-form-grid">
                {/* Password Change Card */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div>
                      <h3><Lock size={16} /> Đổi mật khẩu</h3>
                      <div className="settings-card-header-desc">Mật khẩu nên chứa tối thiểu 8 ký tự kèm chữ hoa, chữ số.</div>
                    </div>
                  </div>
                  <div className="settings-card-body">
                    <form className="settings-form-grid" onSubmit={changePassword}>
                      <div className="settings-input-group full-width">
                        <label>Mật khẩu hiện tại</label>
                        <input
                          value={passwordForm.currentPassword}
                          onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                          type="password"
                          required
                        />
                      </div>
                      <div className="settings-input-group full-width">
                        <label>Mật khẩu mới</label>
                        <input
                          value={passwordForm.newPassword}
                          onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                          minLength="8"
                          type="password"
                          required
                        />
                      </div>
                      <div className="settings-input-group full-width">
                        <label>Xác nhận mật khẩu mới</label>
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
                          Đổi mật khẩu
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* 2FA Card */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div>
                      <h3><Shield size={16} /> Xác thực 2 lớp (2FA)</h3>
                      <div className="settings-card-header-desc">Xác nhận danh tính của bạn qua mã OTP để bảo vệ tài sản.</div>
                    </div>
                  </div>
                  <div className="settings-card-body">
                    {/* Status Banner */}
                    <div className={`twofa-status-banner ${security?.twoFactorEnabled ? 'active' : 'disabled'}`}>
                      {security?.twoFactorEnabled ? (
                        <>
                          <CheckCircle2 size={24} />
                          <div className="twofa-status-desc">
                            <strong>Bảo mật 2FA đang BẬT</strong>
                            <span>Tài khoản của bạn đã được bảo vệ tối đa.</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={24} />
                          <div className="twofa-status-desc">
                            <strong>Bảo mật 2FA đang TẮT</strong>
                            <span>Kích hoạt 2FA để tránh rủi ro mất tài khoản hoặc tiền trong ví.</span>
                          </div>
                        </>
                      )}
                    </div>

                    {!security?.twoFactorEnabled ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="twofa-options-grid">
                          <div className="twofa-setup-box">
                            <h4>2FA qua Email</h4>
                            <p>Nhận mã xác nhận dùng 1 lần (OTP) gửi trực tiếp tới email đăng ký của bạn.</p>
                            <button type="button" disabled={submitting} onClick={sendEmailTwoFactorCode}>
                              Thiết lập Email OTP
                            </button>
                          </div>
                          <div className="twofa-setup-box">
                            <h4>Authenticator App (TOTP)</h4>
                            <p>Sử dụng ứng dụng như Google Authenticator để quét QR Code và lấy mã tự động.</p>
                            <button type="button" disabled={submitting} onClick={setupTotp}>
                              Thiết lập ứng dụng 2FA
                            </button>
                          </div>
                        </div>

                        {twoFactorEmailSent && (
                          <form className="admin-form compact" onSubmit={enableEmailTwoFactor} style={{ borderTop: '1px solid var(--kd-border)', paddingTop: '16px', marginTop: '8px' }}>
                            <div className="settings-input-group">
                              <label>Mã xác minh Email (6 chữ số)</label>
                              <input
                                value={twoFactorForm.code}
                                onChange={(event) => setTwoFactorForm((current) => ({ ...current, code: event.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                inputMode="numeric"
                                placeholder="Nhập mã OTP nhận được từ email"
                              />
                            </div>
                            <button type="submit" className="settings-btn-save" disabled={submitting || twoFactorForm.code.length < 6} style={{ marginTop: '8px' }}>
                              Xác nhận Bật 2FA Email
                            </button>
                          </form>
                        )}
                      </div>
                    ) : (
                      <form className="settings-form-grid" onSubmit={(event) => event.preventDefault()}>
                        <div className="settings-input-group full-width">
                          <label>Nhập mật khẩu xác thực hành động</label>
                          <input
                            value={twoFactorForm.password}
                            onChange={(event) => setTwoFactorForm((current) => ({ ...current, password: event.target.value }))}
                            type="password"
                            placeholder="Nhập mật khẩu hiện tại của bạn"
                          />
                        </div>
                        <div className="settings-input-group full-width">
                          <label>Nhập mã 2FA / Backup Code (nếu tắt)</label>
                          <input
                            value={twoFactorForm.code}
                            onChange={(event) => setTwoFactorForm((current) => ({ ...current, code: event.target.value.trim() }))}
                            placeholder="Mã xác thực 6 số"
                          />
                        </div>
                        <div className="full-width" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                          <button type="button" className="admin-danger-button slim" style={{ borderRadius: '10px', minHeight: '38px' }} disabled={submitting} onClick={() => runTwoFactorProtectedAction('disable')}>
                            Tắt bảo mật 2FA
                          </button>
                          <button type="button" className="admin-icon-button" style={{ borderRadius: '10px', minHeight: '38px', padding: '0 12px' }} disabled={submitting} onClick={() => runTwoFactorProtectedAction('reset')}>
                            Reset TOTP App
                          </button>
                          <button type="button" className="admin-icon-button" style={{ borderRadius: '10px', minHeight: '38px', padding: '0 12px' }} disabled={submitting} onClick={() => runTwoFactorProtectedAction('backup')}>
                            Tạo mã dự phòng mới
                          </button>
                        </div>
                      </form>
                    )}

                    {totpSetup && (
                      <div className="totp-qr-container">
                        <strong>Quét mã QR bằng Google/Microsoft Authenticator:</strong>
                        {totpSetup.qrCodeBase64 && (
                          <img alt="TOTP QR" src={`data:image/png;base64,${totpSetup.qrCodeBase64}`} style={{ width: '180px', height: '180px' }} />
                        )}
                        <div className="totp-secret-block">
                          <strong>Hoặc nhập Secret Key thủ công:</strong>
                          <code>{totpSetup.secret}</code>
                        </div>
                        {totpSetup.backupCodes && totpSetup.backupCodes.length > 0 && (
                          <div style={{ width: '100%', borderTop: '1px solid var(--kd-border)', paddingTop: '12px', marginTop: '8px' }}>
                            <strong style={{ fontSize: '12px', color: 'var(--kd-warning)', display: 'block', marginBottom: '6px' }}>
                              Lưu trữ các mã dự phòng sau (dùng khi mất điện thoại):
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
                          <label>Nhập mã xác thực 6 số trên App</label>
                          <input
                            value={totpCode}
                            onChange={(event) => setTotpCode(event.target.value.trim())}
                            placeholder="Mã hiển thị trên ứng dụng Authenticator"
                          />
                        </div>
                        <button type="submit" className="settings-btn-save" disabled={submitting || !totpCode} style={{ marginTop: '8px' }}>
                          Kích hoạt ứng dụng TOTP
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
                    <h3><Smartphone size={16} /> Các phiên đăng nhập đang hoạt động</h3>
                    <div className="settings-card-header-desc">Danh sách các trình duyệt và thiết bị đã đăng nhập gần đây.</div>
                  </div>
                  <button
                    type="button"
                    className="admin-danger-button slim"
                    disabled={submitting || sessionList.length === 0}
                    onClick={revokeAllSessions}
                    style={{ borderRadius: '10px', minHeight: '34px', fontSize: '12px' }}
                  >
                    Đăng xuất tất cả thiết bị khác
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
                              Phiên đăng nhập #{session.id}
                              {session.isCurrent && <span className="session-badge">Thiết bị hiện tại</span>}
                            </strong>
                            <span>
                              Tạo ngày: {formatAdminDate(session.createdAt)} · Dùng cuối: {formatAdminDate(session.lastUsedAt)}
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
                            Thu hồi
                          </button>
                        )}
                      </div>
                    ))}
                    {sessionList.length === 0 && <AdminEmptyState message="Không tìm thấy lịch sử phiên hoạt động." />}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'apikeys' && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h3><KeyRound size={16} /> API Keys</h3>
                  <div className="settings-card-header-desc">Tạo khóa API dùng để xác thực hệ thống bên ngoài với tài khoản của bạn.</div>
                </div>
              </div>
              <div className="settings-card-body">
                <form className="settings-form-grid" onSubmit={createApiKey} style={{ borderBottom: '1px solid var(--kd-border)', paddingBottom: '24px', marginBottom: '24px' }}>
                  <div className="settings-input-group">
                    <label>Tên định danh API Key</label>
                    <input
                      value={apiKeyForm.name}
                      onChange={(event) => setApiKeyForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Ví dụ: Tool Auto Deposit"
                      required
                    />
                  </div>
                  <div className="settings-input-group">
                    <label>Scopes (Phân quyền API - phân tách bằng dấu phẩy)</label>
                    <input
                      value={apiKeyForm.scopes}
                      onChange={(event) => setApiKeyForm((current) => ({ ...current, scopes: event.target.value }))}
                      placeholder="orders:read,wallet:read"
                    />
                  </div>
                  <div className="full-width" style={{ marginTop: '8px' }}>
                    <button type="submit" className="settings-btn-save" disabled={submitting}>
                      <Plus size={16} />
                      <span>Tạo khóa API mới</span>
                    </button>
                  </div>
                </form>

                {createdApiToken && (
                  <div className="totp-qr-container" style={{ borderLeft: '4px solid var(--kd-blue)', background: 'var(--kd-bg)', margin: '0 0 24px', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ color: 'var(--kd-danger)', fontSize: '13px' }}>
                        API Token mới tạo (Lưu ý: Hãy sao chép ngay, khóa này chỉ hiển thị duy nhất 1 lần):
                      </strong>
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none', background: 'transparent', color: 'var(--kd-blue)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        <Copy size={14} /> Copy Token
                      </button>
                    </div>
                    <pre style={{ margin: 0, padding: '12px', background: '#0f172a', color: '#10b981', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', fontFamily: 'monospace', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                      {createdApiToken}
                    </pre>
                  </div>
                )}

                <div className="apikey-list">
                  <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--kd-text)' }}>
                    Danh sách API Keys của bạn
                  </h4>
                  {apiKeyList.map((apiKey) => (
                    <div className="apikey-item" key={apiKey.id}>
                      <div className="apikey-item-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong>{apiKey.name}</strong>
                          <span className="key-prefix">ID: #{apiKey.id}</span>
                          <span style={{ fontSize: '12px', color: apiKey.revokedAt ? 'var(--kd-danger)' : 'var(--kd-success)', fontWeight: 'bold' }}>
                            {apiKey.revokedAt ? '• Đã hủy' : '• Hoạt động'}
                          </span>
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--kd-muted)', marginTop: '2px' }}>
                          Tiền tố: <code>{apiKey.keyPrefix}</code>
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
                            Thời gian thu hồi: {formatAdminDate(apiKey.revokedAt)}
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
                          <span>Thu hồi</span>
                        </button>
                      )}
                    </div>
                  ))}
                  {apiKeyList.length === 0 && <AdminEmptyState message="Tài khoản của bạn chưa có API key nào." />}
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
                    <h3><Download size={16} /> Xuất dữ liệu cá nhân</h3>
                    <div className="settings-card-header-desc">Tải về toàn bộ thông tin tài khoản được lưu trên hệ thống.</div>
                  </div>
                </div>
                <div className="settings-card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <div className="privacy-banner">
                      Bản sao lưu dữ liệu dưới định dạng JSON bao gồm: Thông tin tài khoản, danh sách đơn hàng đã mua,
                      lịch sử các yêu cầu nạp tiền, giao dịch ví, tickets hỗ trợ và thông số các phiên đăng nhập.
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
                    <span>Tạo bản sao lưu JSON</span>
                  </button>
                </div>
              </div>

              {/* Account Deletion Card */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h3><Trash2 size={16} /> Yêu cầu xoá tài khoản</h3>
                    <div className="settings-card-header-desc">Xóa hoặc vô hiệu hóa tài khoản và ẩn danh thông tin cá nhân.</div>
                  </div>
                  <AdminStatusBadge status="GDPR" />
                </div>
                <div className="settings-card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <div className="privacy-banner" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
                      <strong>Cảnh báo quan trọng:</strong> Hành động này sẽ ẩn danh toàn bộ email, tên hiển thị, số điện thoại,
                      ngắt các liên kết OAuth và thu hồi mọi API Keys/Sessions. Dữ liệu tài chính (lịch sử giao dịch ví, đơn hàng)
                      sẽ được giữ lại ở trạng thái vô danh để phục vụ đối soát tài chính của hệ thống.
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
                    <span>Yêu cầu xoá vĩnh viễn</span>
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
