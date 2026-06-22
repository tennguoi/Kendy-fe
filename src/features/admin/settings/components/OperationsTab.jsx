import { Mail, Save, ShieldAlert, TimerReset } from 'lucide-react'
import { useEffect, useState } from 'react'
import { adminApi } from '../../../../api/admin.api'
import RichEditor from '../../../../components/RichEditor/RichEditor'

const defaultForm = {
  maintenanceEnabled: false,
  rateLimitAuth: 10,
  rateLimitEnabled: true,
  rateLimitFinance: 60,
  rateLimitWebhook: 120,
  resetPasswordBody: 'Use this link to reset your password:\n{{link}}\n\nThis token expires at: {{expiresAt}}',
  resetPasswordSubject: 'Reset your KendyDigital password',
  twoFactorBody: 'Your 2FA email code is: {{code}}\n\nThis code expires at: {{expiresAt}}\nIf you did not try to sign in, change your password immediately.',
  twoFactorSubject: 'Your KendyDigital 2FA code',
  verifyEmailBody: 'Use this link to verify your email:\n{{link}}\n\nThis token expires at: {{expiresAt}}',
  verifyEmailSubject: 'Verify your KendyDigital email',
}

function boolValue(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback
  return String(value).toLowerCase() === 'true'
}

function intValue(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function OperationsTab({ onSaved, onSetError, onSetNotice, settingsMap, submitting, token }) {
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('general')

  useEffect(() => {
    setForm({
      maintenanceEnabled: boolValue(settingsMap['maintenance.enabled'], false),
      rateLimitAuth: intValue(settingsMap['rate_limit.auth_per_minute'], 10),
      rateLimitEnabled: boolValue(settingsMap['rate_limit.enabled'], true),
      rateLimitFinance: intValue(settingsMap['rate_limit.finance_per_minute'], 60),
      rateLimitWebhook: intValue(settingsMap['rate_limit.webhook_per_minute'], 120),
      resetPasswordBody: settingsMap['email.template.password_reset.body'] || defaultForm.resetPasswordBody,
      resetPasswordSubject: settingsMap['email.template.password_reset.subject'] || defaultForm.resetPasswordSubject,
      twoFactorBody: settingsMap['email.template.two_factor.body'] || defaultForm.twoFactorBody,
      twoFactorSubject: settingsMap['email.template.two_factor.subject'] || defaultForm.twoFactorSubject,
      verifyEmailBody: settingsMap['email.template.email_verification.body'] || defaultForm.verifyEmailBody,
      verifyEmailSubject: settingsMap['email.template.email_verification.subject'] || defaultForm.verifyEmailSubject,
    })
  }, [settingsMap])

  const updateForm = (patch) => setForm((current) => ({ ...current, ...patch }))

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    onSetError('')
    try {
      const saved = await adminApi.updateSettings({
        settings: [
          { key: 'maintenance.enabled', value: String(form.maintenanceEnabled), publicSetting: true },
          { key: 'rate_limit.enabled', value: String(form.rateLimitEnabled), publicSetting: false },
          { key: 'rate_limit.auth_per_minute', value: String(form.rateLimitAuth), publicSetting: false },
          { key: 'rate_limit.finance_per_minute', value: String(form.rateLimitFinance), publicSetting: false },
          { key: 'rate_limit.webhook_per_minute', value: String(form.rateLimitWebhook), publicSetting: false },
          { key: 'email.template.password_reset.subject', value: form.resetPasswordSubject, publicSetting: false },
          { key: 'email.template.password_reset.body', value: form.resetPasswordBody, publicSetting: false },
          { key: 'email.template.email_verification.subject', value: form.verifyEmailSubject, publicSetting: false },
          { key: 'email.template.email_verification.body', value: form.verifyEmailBody, publicSetting: false },
          { key: 'email.template.two_factor.subject', value: form.twoFactorSubject, publicSetting: false },
          { key: 'email.template.two_factor.body', value: form.twoFactorBody, publicSetting: false },
        ],
      }, token)
      onSaved(saved)
      onSetNotice('Đã lưu cài đặt vận hành.')
    } catch (err) {
      onSetError(err.message || 'Không lưu được cài đặt vận hành.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="settings-operations" onSubmit={save}>
      <nav className="settings-subtabs" aria-label="Nhóm cài đặt vận hành">
        <button type="button" className={activeSection === 'general' ? 'active' : ''} onClick={() => setActiveSection('general')}>Chung</button>
        <button type="button" className={activeSection === 'limits' ? 'active' : ''} onClick={() => setActiveSection('limits')}>Giới hạn API</button>
        <button type="button" className={activeSection === 'email' ? 'active' : ''} onClick={() => setActiveSection('email')}>Email hệ thống</button>
      </nav>

      {activeSection === 'general' && (
        <div className="settings-operation-strip">
          <div className="settings-switch-card">
            <div>
              <strong><ShieldAlert size={19} strokeWidth={2} aria-hidden="true" /> Maintenance mode</strong>
              <span>Chặn user và public API khi cần bảo trì.</span>
            </div>
            <label className="settings-switch">
              <input type="checkbox" checked={form.maintenanceEnabled} onChange={(event) => updateForm({ maintenanceEnabled: event.target.checked })} />
              <span />
            </label>
          </div>

          <div className="settings-switch-card">
            <div>
              <strong><TimerReset size={19} strokeWidth={2} aria-hidden="true" /> Rate limiting</strong>
              <span>Giảm spam đăng nhập, webhook và thao tác tài chính.</span>
            </div>
            <label className="settings-switch">
              <input type="checkbox" checked={form.rateLimitEnabled} onChange={(event) => updateForm({ rateLimitEnabled: event.target.checked })} />
              <span />
            </label>
          </div>
        </div>
      )}

      {activeSection === 'limits' && (
        <div className="admin-panel admin-form settings-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Giới hạn API</h3>
              <span>Kiểm soát số request tối đa trong một phút.</span>
            </div>
            <span>request / phút</span>
          </div>
          <div className="admin-form-grid three-columns">
            <label><span>Auth / phút</span><input type="number" min="0" value={form.rateLimitAuth} onChange={(event) => updateForm({ rateLimitAuth: event.target.value })} /></label>
            <label><span>Tài chính / phút</span><input type="number" min="0" value={form.rateLimitFinance} onChange={(event) => updateForm({ rateLimitFinance: event.target.value })} /></label>
            <label><span>Webhook / phút</span><input type="number" min="0" value={form.rateLimitWebhook} onChange={(event) => updateForm({ rateLimitWebhook: event.target.value })} /></label>
          </div>
        </div>
      )}

      {activeSection === 'email' && (
        <div className="settings-email-grid">
          <div className="admin-panel admin-form settings-panel">
            <div className="admin-panel-head"><h3>Reset mật khẩu</h3><Mail size={18} aria-hidden="true" /></div>
            <label><span>Tiêu đề email</span><input value={form.resetPasswordSubject} onChange={(event) => updateForm({ resetPasswordSubject: event.target.value })} /></label>
            <label><span>Nội dung email</span><RichEditor value={form.resetPasswordBody} onChange={(value) => updateForm({ resetPasswordBody: value })} minHeight={200} /></label>
          </div>

          <div className="admin-panel admin-form settings-panel">
            <div className="admin-panel-head"><h3>Xác minh email</h3><Mail size={18} aria-hidden="true" /></div>
            <label><span>Tiêu đề email</span><input value={form.verifyEmailSubject} onChange={(event) => updateForm({ verifyEmailSubject: event.target.value })} /></label>
            <label><span>Nội dung email</span><RichEditor value={form.verifyEmailBody} onChange={(value) => updateForm({ verifyEmailBody: value })} minHeight={200} /></label>
          </div>

          <div className="admin-panel admin-form settings-panel settings-email-wide">
            <div className="admin-panel-head"><h3>Xác thực hai lớp</h3></div>
            <label><span>Tiêu đề email</span><input value={form.twoFactorSubject} onChange={(event) => updateForm({ twoFactorSubject: event.target.value })} /></label>
            <label><span>Nội dung email</span><RichEditor value={form.twoFactorBody} onChange={(value) => updateForm({ twoFactorBody: value })} minHeight={200} /></label>
            <p className="admin-empty-state">Placeholder: {'{{name}}'}, {'{{email}}'}, {'{{link}}'}, {'{{token}}'}, {'{{code}}'}, {'{{expiresAt}}'}.</p>
          </div>
        </div>
      )}

      <div className="settings-save-dock">
        <div>
          <strong>Lưu cấu hình vận hành</strong>
          <span>Thay đổi ở mọi tab con sẽ được lưu cùng lúc.</span>
        </div>
        <button type="submit" className="settings-save-button" disabled={submitting || saving}>
          <Save size={16} strokeWidth={2} aria-hidden="true" />
          <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
        </button>
      </div>
    </form>
  )
}

export default OperationsTab
