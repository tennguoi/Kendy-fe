import { Save } from 'lucide-react'
import { useState } from 'react'

function AdminSettingsView({
  error,
  loading,
  onReload,
  onSetError,
  onSetNotice,
  settings,
  token,
}) {
  const [submitting, setSubmitting] = useState(false)

  const twoFactorRequired = settings?.admin_2fa_required === 'true'

  const handleToggle = async () => {
    setSubmitting(true)
    onSetError('')
    try {
      const response = await fetch('http://localhost:8080/api/admin/settings/bulk-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settings: [
            {
              key: 'admin_2fa_required',
              value: twoFactorRequired ? 'false' : 'true',
              publicSetting: false,
            },
          ],
        }),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      onSetNotice(`Đã ${twoFactorRequired ? 'tắt' : 'bật'} yêu cầu 2FA.`)
      await onReload()
    } catch (err) {
      onSetError(err.message || 'Không thể cập nhật cài đặt.')
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
        <button type="button" className="admin-icon-button" onClick={onReload} disabled={loading}>
          <Save size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {(error || loading) && (
        <p className={error ? 'admin-message error' : 'admin-message'}>
          {error || 'Đang tải cài đặt...'}
        </p>
      )}

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Bảo mật</h3>
        </div>
        <div className="admin-check-row" style={{ padding: '14px' }}>
          <label>
            <input
              checked={twoFactorRequired}
              disabled={submitting}
              onChange={handleToggle}
              type="checkbox"
            />
            <span>Yêu cầu xác thực 2 lớp (2FA) khi truy cập admin</span>
          </label>
        </div>
      </div>
    </section>
  )
}

export default AdminSettingsView
