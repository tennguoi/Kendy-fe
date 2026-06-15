import { KeyRound, RefreshCw, Save, Shield, Trash2 } from 'lucide-react'
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
  const [activeSettingsTab, setActiveSettingsTab] = useState('general') // 'general' | 'security' | 'apikeys' | 'notifications'

  const setViewError = useCallback((message) => {
    setError(message)
    onSetError(message)
  }, [onSetError])

  const sessionList = normalizeList(sessions)
  const apiKeyList = normalizeList(apiKeys)
  const notificationList = normalizeList(notifications)

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

  const markNotificationRead = async (notificationId) => {
    setSubmitting(true)
    setViewError('')
    try {
      const saved = await userApi.markNotificationRead(notificationId, token)
      setNotifications((items) => normalizeList(items).map((item) => (item.id === saved.id ? saved : item)))
      onSetNotice('Đã đánh dấu thông báo đã đọc.')
    } catch (err) {
      setViewError(err.message || 'Không cập nhật được thông báo.')
    } finally {
      setSubmitting(false)
    }
  }

  const markAllNotificationsRead = async () => {
    const unreadIds = notificationList.filter((item) => !item.readAt).map((item) => item.id)
    if (unreadIds.length === 0) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      setNotifications(normalizeList(await userApi.bulkReadNotifications({ ids: unreadIds }, token)))
      onSetNotice(`Đã đọc ${unreadIds.length} thông báo.`)
    } catch (err) {
      setViewError(err.message || 'Không cập nhật được thông báo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div>
          <h2>Hồ sơ của tôi</h2>
        </div>
        <button type="button" className="admin-icon-button" onClick={loadSettings} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {(error || loading) && <p className={error ? 'admin-message error' : 'admin-message'}>{error || 'Đang tải tài khoản...'}</p>}

      <div className="profile-hero-panel">
        {avatarUrl ? (
          <img className="profile-hero-avatar" src={avatarUrl} alt="" />
        ) : (
          <div className="profile-hero-avatar fallback">{profileInitial}</div>
        )}
        <div className="profile-hero-copy">
          <span className="eyebrow">Account</span>
          <h2>{currentUser?.name || currentUser?.email || 'Người dùng'}</h2>
          <p>{currentUser?.email || 'Chưa có email'}{oauthProvider ? ` · Đăng nhập bằng ${oauthProvider}` : ''}</p>
        </div>
      </div>

      <div className="admin-metrics">
        <article className="admin-metric">
          <span>Người dùng</span>
          <strong>{currentUser?.name || 'Chưa đặt tên'}</strong>
        </article>
        <article className="admin-metric">
          <span>Email</span>
          <strong>{currentUser?.email || 'Chưa có'}</strong>
        </article>
        <article className="admin-metric">
          <span>Số dư ví</span>
          <strong>{formatAdminMoney(dashboard?.balance ?? currentUser?.balance)}</strong>
        </article>
        <article className="admin-metric">
          <span>Bảo mật</span>
          <strong>{security?.twoFactorEnabled ? '2FA bật' : '2FA tắt'}</strong>
        </article>
      </div>

      {/* Settings section tabs for mobile / layout clean up */}
      <div className="admin-tabs" style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderBottom: '1px solid var(--kd-border)', paddingBottom: '12px' }}>
        <button type="button" className={activeSettingsTab === 'general' ? 'active' : ''} onClick={() => setActiveSettingsTab('general')}>
          Hồ sơ cá nhân
        </button>
        <button type="button" className={activeSettingsTab === 'security' ? 'active' : ''} onClick={() => setActiveSettingsTab('security')}>
          Bảo mật & Phiên
        </button>
        <button type="button" className={activeSettingsTab === 'apikeys' ? 'active' : ''} onClick={() => setActiveSettingsTab('apikeys')}>
          API Keys
        </button>

      </div>

      {activeSettingsTab === 'general' && (
        <div className="admin-grid two-columns">
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Hồ sơ của tôi</h3>
              <AdminStatusBadge status={currentUser?.status || 'UNKNOWN'} />
            </div>
            <dl className="admin-detail-list">
              <div><dt>User ID</dt><dd>#{currentUser?.id || '-'}</dd></div>
              <div><dt>Public ID</dt><dd>{currentUser?.publicId || '-'}</dd></div>
              <div><dt>Email</dt><dd>{currentUser?.email || '-'}</dd></div>
              <div><dt>Role</dt><dd>{currentUser?.role || '-'}</dd></div>
              <div><dt>Xác minh email</dt><dd>{currentUser?.emailVerifiedAt ? formatAdminDate(currentUser.emailVerifiedAt) : 'Chưa xác minh'}</dd></div>
              <div><dt>OAuth</dt><dd>{currentUser?.oauthProvider || 'Không liên kết'}</dd></div>
            </dl>
            <form className="admin-form compact" onSubmit={updateProfile}>
              <label>
                <span>Tên hiển thị</span>
                <input value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} required />
              </label>
              <label>
                <span>Email</span>
                <input value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} type="email" required />
              </label>
              <label>
                <span>Ảnh đại diện</span>
                <input value={profileForm.avatarUrl} onChange={(event) => setProfileForm((current) => ({ ...current, avatarUrl: event.target.value }))} placeholder="https://..." />
              </label>
              <label>
                <span>Số điện thoại</span>
                <input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} />
              </label>
              <button type="submit" disabled={submitting}>
                <Save size={17} strokeWidth={2} aria-hidden="true" />
                <span>Lưu hồ sơ</span>
              </button>
            </form>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Tổng quan sử dụng</h3>
              <span>{dashboard?.orderCount ?? 0} đơn</span>
            </div>
            <div className="admin-report-grid compact-report">
              <div><span>Đơn xử lý</span><strong>{dashboard?.processingOrders ?? 0}</strong></div>
              <div><span>Đơn hoàn tất</span><strong>{dashboard?.completedOrders ?? 0}</strong></div>
              <div><span>Nạp hoàn tất</span><strong>{dashboard?.completedDeposits ?? 0}</strong></div>
              <div><span>Ticket</span><strong>{dashboard?.ticketCount ?? 0}</strong></div>
            </div>
            <div className="admin-report-grid compact-report" style={{ marginTop: '10px' }}>
              <div><span>Đã nạp</span><strong>{formatAdminMoney(dashboard?.completedDepositAmount)}</strong></div>
              <div><span>Đã mua</span><strong>{formatAdminMoney(dashboard?.purchaseAmount)}</strong></div>
              <div><span>Refund</span><strong>{formatAdminMoney(dashboard?.refundAmount)}</strong></div>
              <div><span>GD ví</span><strong>{dashboard?.walletTransactionCount ?? 0}</strong></div>
            </div>
          </div>
        </div>
      )}

      {activeSettingsTab === 'security' && (
        <div style={{ display: 'grid', gap: '18px' }}>
          <div className="admin-grid two-columns">
            <div className="admin-panel">
              <div className="admin-panel-head">
                <h3>Đổi mật khẩu</h3>
                <Shield size={18} strokeWidth={2} aria-hidden="true" />
              </div>
              <form className="admin-form compact" onSubmit={changePassword}>
                <label>
                  <span>Mật khẩu hiện tại</span>
                  <input value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} type="password" required />
                </label>
                <label>
                  <span>Mật khẩu mới</span>
                  <input value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} minLength="8" type="password" required />
                </label>
                <label>
                  <span>Xác nhận mật khẩu mới</span>
                  <input value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} minLength="8" type="password" required />
                </label>
                <button type="submit" disabled={submitting}>Đổi mật khẩu</button>
              </form>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-head">
                <h3>Bảo mật</h3>
                <AdminStatusBadge status={security?.twoFactorEnabled ? 'ACTIVE' : 'DISABLED'} />
              </div>
              <dl className="admin-detail-list">
                <div><dt>Email</dt><dd>{security?.emailVerified ? 'Đã xác minh' : 'Chưa xác minh'}</dd></div>
                <div><dt>Đổi mật khẩu</dt><dd>{formatAdminDate(security?.passwordChangedAt)}</dd></div>
                <div><dt>Session active</dt><dd>{security?.activeSessions ?? 0}</dd></div>
                <div><dt>API key active</dt><dd>{security?.activeApiKeys ?? 0}</dd></div>
              </dl>
              {!security?.twoFactorEnabled && (
                <form className="admin-form compact" onSubmit={enableEmailTwoFactor}>
                  <div className="admin-action-row">
                    <button type="button" className="admin-icon-button" disabled={submitting} onClick={sendEmailTwoFactorCode}>
                      Gửi mã 2FA email
                    </button>
                    <button type="button" className="admin-icon-button" disabled={submitting} onClick={setupTotp}>
                      Setup TOTP
                    </button>
                  </div>
                  {twoFactorEmailSent && (
                    <label>
                      <span>Mã email</span>
                      <input value={twoFactorForm.code} onChange={(event) => setTwoFactorForm((current) => ({ ...current, code: event.target.value.replace(/\D/g, '').slice(0, 6) }))} inputMode="numeric" />
                    </label>
                  )}
                  {twoFactorEmailSent && <button type="submit" disabled={submitting || twoFactorForm.code.length < 6}>Bật 2FA email</button>}
                </form>
              )}
              {totpSetup && (
                <div className="admin-code-block">
                  <strong>TOTP secret</strong>
                  <pre>{totpSetup.secret}</pre>
                  {totpSetup.qrCodeBase64 && <img alt="TOTP QR" src={`data:image/png;base64,${totpSetup.qrCodeBase64}`} />}
                  <pre>{(totpSetup.backupCodes || []).join('\n')}</pre>
                </div>
              )}
              {totpSetup && (
                <form className="admin-form compact" onSubmit={enableTotp}>
                  <label>
                    <span>Mã TOTP</span>
                    <input value={totpCode} onChange={(event) => setTotpCode(event.target.value.trim())} />
                  </label>
                  <button type="submit" disabled={submitting || !totpCode}>Bật TOTP</button>
                </form>
              )}
              {security?.twoFactorEnabled && (
                <form className="admin-form compact" onSubmit={(event) => event.preventDefault()}>
                  <label>
                    <span>Mật khẩu hiện tại</span>
                    <input value={twoFactorForm.password} onChange={(event) => setTwoFactorForm((current) => ({ ...current, password: event.target.value }))} type="password" />
                  </label>
                  <label>
                    <span>Mã 2FA hoặc backup code</span>
                    <input value={twoFactorForm.code} onChange={(event) => setTwoFactorForm((current) => ({ ...current, code: event.target.value.trim() }))} />
                  </label>
                  <div className="admin-action-row">
                    <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => runTwoFactorProtectedAction('disable')}>Tắt 2FA</button>
                    <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => runTwoFactorProtectedAction('reset')}>Reset TOTP</button>
                    <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => runTwoFactorProtectedAction('backup')}>Tạo backup codes</button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Phiên đăng nhập</h3>
              <button type="button" className="admin-danger-button slim" disabled={submitting || sessionList.length === 0} onClick={revokeAllSessions}>
                Thu hồi tất cả
              </button>
            </div>
            <div className="admin-mini-list">
              {sessionList.map((session) => (
                <article key={session.id}>
                  <strong>Session #{session.id}</strong>
                  <span>Tạo {formatAdminDate(session.createdAt)} · Dùng gần nhất {formatAdminDate(session.lastUsedAt)} · Hết hạn {formatAdminDate(session.expiresAt)}</span>
                  <button type="button" className="admin-danger-button slim" disabled={submitting || session.revokedAt} onClick={() => revokeSession(session.id)}>
                    Thu hồi
                  </button>
                </article>
              ))}
              {sessionList.length === 0 && <AdminEmptyState message="Không có session đang hiển thị." />}
            </div>
          </div>
        </div>
      )}

      {activeSettingsTab === 'apikeys' && (
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>API keys</h3>
            <KeyRound size={18} strokeWidth={2} aria-hidden="true" />
          </div>
          <form className="admin-form compact" onSubmit={createApiKey} style={{ marginBottom: '20px' }}>
            <label>
              <span>Tên API key</span>
              <input value={apiKeyForm.name} onChange={(event) => setApiKeyForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label>
              <span>Scopes</span>
              <input value={apiKeyForm.scopes} onChange={(event) => setApiKeyForm((current) => ({ ...current, scopes: event.target.value }))} />
            </label>
            <button type="submit" disabled={submitting} className="admin-primary-button" style={{ height: '38px' }}>Tạo API key</button>
          </form>
          {createdApiToken && (
            <div className="admin-code-block" style={{ marginBottom: '20px' }}>
              <strong>Token mới (Hãy copy ngay vì nó sẽ ẩn đi khi tải lại trang)</strong>
              <pre>{createdApiToken}</pre>
            </div>
          )}
          <div className="admin-mini-list">
            {apiKeyList.map((apiKey) => (
              <article key={apiKey.id}>
                <strong>{apiKey.name}</strong>
                <span>{apiKey.keyPrefix} · {(apiKey.scopes || []).join(', ') || 'Không scope'} · {apiKey.revokedAt ? `Revoked ${formatAdminDate(apiKey.revokedAt)}` : 'Đang hoạt động'}</span>
                <button type="button" className="admin-danger-button slim" disabled={submitting || apiKey.revokedAt} onClick={() => revokeApiKey(apiKey.id)}>
                  <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                  <span>Thu hồi</span>
                </button>
              </article>
            ))}
            {apiKeyList.length === 0 && <AdminEmptyState message="Chưa có API key." />}
          </div>
        </div>
      )}


    </section>
  )
}

export default SettingsView
