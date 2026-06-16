import { Mail, Save, ShieldAlert, TimerReset } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminApi } from '../../../../api/admin.api';

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
};

function boolValue(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value).toLowerCase() === 'true';
}

function intValue(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function OperationsTab({ onSaved, onSetError, onSetNotice, settingsMap, submitting, token }) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

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
    });
  }, [settingsMap]);

  const updateForm = (patch) => setForm((current) => ({ ...current, ...patch }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    onSetError('');
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
      }, token);
      onSaved(saved);
      onSetNotice('Đã lưu cài đặt vận hành.');
    } catch (err) {
      onSetError(err.message || 'Không lưu được cài đặt vận hành.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="settings-operations" onSubmit={save}>
      <div className="settings-operation-strip">
        <div className="settings-switch-card">
          <div>
            <ShieldAlert size={19} strokeWidth={2} aria-hidden="true" />
            <strong>Maintenance mode</strong>
            <span>Chặn user/public API khi cần bảo trì.</span>
          </div>
          <label className="settings-switch">
            <input type="checkbox" checked={form.maintenanceEnabled} onChange={(event) => updateForm({ maintenanceEnabled: event.target.checked })} />
            <span />
          </label>
        </div>

        <div className="settings-switch-card">
          <div>
            <TimerReset size={19} strokeWidth={2} aria-hidden="true" />
            <strong>Rate limiting</strong>
            <span>Giảm spam login, webhook và thao tác tài chính.</span>
          </div>
          <label className="settings-switch">
            <input type="checkbox" checked={form.rateLimitEnabled} onChange={(event) => updateForm({ rateLimitEnabled: event.target.checked })} />
            <span />
          </label>
        </div>
      </div>

      <div className="admin-panel admin-form settings-panel">
        <div className="admin-panel-head">
          <h3>Giới hạn API</h3>
          <span>request / phút</span>
        </div>
        <div className="admin-form-grid three-columns">
          <label>
            <span>Auth / phút</span>
            <input type="number" min="0" value={form.rateLimitAuth} onChange={(event) => updateForm({ rateLimitAuth: event.target.value })} />
          </label>
          <label>
            <span>Tài chính / phút</span>
            <input type="number" min="0" value={form.rateLimitFinance} onChange={(event) => updateForm({ rateLimitFinance: event.target.value })} />
          </label>
          <label>
            <span>Webhook / phút</span>
            <input type="number" min="0" value={form.rateLimitWebhook} onChange={(event) => updateForm({ rateLimitWebhook: event.target.value })} />
          </label>
        </div>
      </div>

      <div className="admin-panel admin-form settings-panel">
        <div className="admin-panel-head">
          <h3>Email reset & xác minh</h3>
          <Mail size={18} strokeWidth={2} aria-hidden="true" />
        </div>
        <label>
          <span>Password reset subject</span>
          <input value={form.resetPasswordSubject} onChange={(event) => updateForm({ resetPasswordSubject: event.target.value })} />
        </label>
        <label>
          <span>Password reset body</span>
          <textarea rows={5} value={form.resetPasswordBody} onChange={(event) => updateForm({ resetPasswordBody: event.target.value })} />
        </label>
        <label>
          <span>Email verification subject</span>
          <input value={form.verifyEmailSubject} onChange={(event) => updateForm({ verifyEmailSubject: event.target.value })} />
        </label>
        <label>
          <span>Email verification body</span>
          <textarea rows={5} value={form.verifyEmailBody} onChange={(event) => updateForm({ verifyEmailBody: event.target.value })} />
        </label>
      </div>

      <div className="admin-panel admin-form settings-panel">
        <div className="admin-panel-head">
          <h3>Email template 2FA</h3>
        </div>
        <label>
          <span>2FA subject</span>
          <input value={form.twoFactorSubject} onChange={(event) => updateForm({ twoFactorSubject: event.target.value })} />
        </label>
        <label>
          <span>2FA body</span>
          <textarea rows={8} value={form.twoFactorBody} onChange={(event) => updateForm({ twoFactorBody: event.target.value })} />
        </label>
        <p className="admin-empty-state">Placeholder dùng được: {'{{name}}'}, {'{{email}}'}, {'{{link}}'}, {'{{token}}'}, {'{{code}}'}, {'{{expiresAt}}'}.</p>
        <button type="submit" className="settings-save-button" disabled={submitting || saving}>
          <Save size={16} strokeWidth={2} aria-hidden="true" />
          <span>Lưu vận hành</span>
        </button>
      </div>
    </form>
  );
}

export default OperationsTab;
