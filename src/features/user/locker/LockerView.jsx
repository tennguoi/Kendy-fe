import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  KeyRound,
  RefreshCw,
  Search,
  ShieldAlert,
} from 'lucide-react'
import { userApi } from '../../../api/user.api'
import { formatDate } from '../../../utils/date'
import ConfirmModal from '../../../components/Modal/ConfirmModal'

const warrantyReasons = [
  'Sai tài khoản hoặc mật khẩu',
  'Tài khoản bị khóa',
  'Bị mất Premium / quyền truy cập',
  'Không nhận được mã 2FA',
  'Lỗi khác',
]

function remainingLabel(value, noun, now) {
  if (!value) return `Không giới hạn ${noun}`
  const diff = new Date(value).getTime() - now
  const days = Math.ceil(diff / 86400000)
  if (days < 0) return `Đã hết ${noun}`
  if (days === 0) return `Hết ${noun} hôm nay`
  return `Còn ${days} ngày ${noun}`
}

function credentialLine(item) {
  return [
    item.loginIdentifier,
    item.passwordSecret,
    item.twoFactorSecret,
    item.recoveryInfo,
  ].map((value) => value || '').join('|')
}

function downloadText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function SecretField({ label, value, onCopy, copied }) {
  if (!value) return null
  return (
    <div className="locker-secret">
      <span>{label}</span>
      <code>{value}</code>
      <button type="button" onClick={() => onCopy(value)} title={`Copy ${label}`}>
        {copied ? <Check size={15} /> : <Copy size={15} />}
      </button>
    </div>
  )
}

function LockerView({ onSetNotice, token }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState('')
  const [warrantyTarget, setWarrantyTarget] = useState(null)
  const [warrantyReason, setWarrantyReason] = useState(warrantyReasons[0])
  const [submittingId, setSubmittingId] = useState(null)
  const [renewTarget, setRenewTarget] = useState(null)
  const [now] = useState(() => Date.now())

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const response = await userApi.getMyEntitlements(token)
      setItems(Array.isArray(response) ? response : response?.content || [])
    } catch (err) {
      setError(err.message || 'Không tải được danh sách dịch vụ.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return items
    return items.filter((item) => [
      item.serviceName,
      item.orderCode,
      item.loginIdentifier,
      item.accessIdentifier,
      item.externalResourceId,
    ].some((value) => String(value || '').toLowerCase().includes(normalized)))
  }, [items, query])

  const handleCopy = async (value) => {
    await navigator.clipboard.writeText(value)
    setCopied(value)
    window.setTimeout(() => setCopied(''), 1200)
  }

  const handleDownloadAll = () => {
    const credentials = filtered.filter((item) => item.loginIdentifier && item.passwordSecret)
    if (!credentials.length) return
    const content = credentials.map(credentialLine).join('\n')
    downloadText(content, `tai-khoan-kendy-${new Date().toISOString().slice(0, 10)}.txt`)
  }

  const handleWarranty = async (item) => {
    if (!item.orderCode) return
    setSubmittingId(item.id)
    try {
      await userApi.createWarranty(item.orderCode, {
        reason: warrantyReason,
        evidenceText: `Credential #${item.credentialId} - ${item.loginIdentifier}`,
      }, token)
      setWarrantyTarget(null)
      onSetNotice?.('Đã gửi yêu cầu bảo hành.')
    } catch (err) {
      setError(err.message || 'Không gửi được yêu cầu bảo hành.')
    } finally {
      setSubmittingId(null)
    }
  }

  const handleRenewClick = (item) => {
    if (!item.orderCode) return
    setRenewTarget(item)
  }

  const handleRenewConfirm = async () => {
    const item = renewTarget
    if (!item?.orderCode) return

    setSubmittingId(item.id)
    setError('')
    setRenewTarget(null)
    try {
      await userApi.requestEntitlementRenewal(item.id, token)
      setItems((current) => current.map((entry) => (
        entry.id === item.id ? { ...entry, renewalRequestedAt: new Date().toISOString() } : entry
      )))
      onSetNotice?.('Đã tạo yêu cầu gia hạn. Hệ thống sẽ xử lý trên chính tài khoản hiện tại.')
    } catch (err) {
      setError(err.message || 'Không tạo được yêu cầu gia hạn.')
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <section className="locker-workspace">
      <div className="locker-header">
        <div>
          <span className="locker-eyebrow"><KeyRound size={15} /> Quyền truy cập</span>
          <h2>Dịch vụ của tôi</h2>
          <p>Quản lý thời hạn, quyền thành viên và tài nguyên đã được cấp.</p>
        </div>
        <div className="locker-header-actions">
          <button type="button" className="locker-secondary-button" onClick={load} disabled={loading}>
            <RefreshCw size={16} /> Tải lại
          </button>
          <button type="button" className="locker-primary-button" onClick={handleDownloadAll} disabled={!filtered.some((item) => item.loginIdentifier && item.passwordSecret)}>
            <Download size={16} /> Tải file TXT
          </button>
        </div>
      </div>

      <div className="locker-toolbar">
        <label>
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm dịch vụ, mã đơn hoặc tài khoản"
          />
        </label>
        <span>{filtered.length} dịch vụ</span>
      </div>

      {error && <div className="locker-error"><AlertTriangle size={17} /> {error}</div>}
      {loading && <p className="locker-muted">Đang tải dịch vụ...</p>}

      <div className="locker-list">
        {filtered.map((item) => {
          const warrantyExpired = item.warrantyUntil && new Date(item.warrantyUntil).getTime() < now
          const expired = item.expiresAt && new Date(item.expiresAt).getTime() < now
          const active = ['ACTIVE', 'EXPIRING'].includes(item.status) && !expired
          const statusLabel = active
            ? 'Đang hoạt động'
            : item.status === 'PENDING'
              ? 'Đang cấp quyền'
              : item.status === 'SUSPENDED'
                ? 'Đã tạm ngưng'
                : item.status === 'REVOKED'
                  ? 'Đã thu hồi'
                  : item.status === 'FAILED'
                    ? 'Cấp quyền thất bại'
                    : 'Đã hết hạn'
          return (
            <article className="locker-card" key={item.id}>
              <div className="locker-card-head">
                <div>
                  <h3>{item.serviceName}</h3>
                  <span>Đơn {item.orderCode || 'Không xác định'} · Bắt đầu {formatDate(item.startsAt)}</span>
                </div>
                <span className={`locker-state ${active ? 'active' : 'expired'}`}>
                  {statusLabel}
                </span>
              </div>

              <div className="locker-secrets">
                <SecretField label="Tài khoản" value={item.loginIdentifier} onCopy={handleCopy} copied={copied === item.loginIdentifier} />
                <SecretField label="Mật khẩu" value={item.passwordSecret} onCopy={handleCopy} copied={copied === item.passwordSecret} />
                <SecretField label="2FA" value={item.twoFactorSecret} onCopy={handleCopy} copied={copied === item.twoFactorSecret} />
                <SecretField label="Khôi phục" value={item.recoveryInfo} onCopy={handleCopy} copied={copied === item.recoveryInfo} />
              </div>

              {!item.loginIdentifier && (
                <div className="locker-access-summary">
                  <div>
                    <span>Cách cấp quyền</span>
                    <strong>{{
                      TEAM_INVITE: 'Thành viên / Team seat',
                      PROVIDER_API: 'Tài nguyên qua API nhà cung cấp',
                      INTERNAL_ACCESS: 'Quyền sử dụng trên KendyDigital',
                      MANUAL: 'Admin xử lý thủ công',
                      DEDICATED_ACCOUNT: 'Tài khoản riêng',
                    }[item.accessStrategy] || item.accessStrategy}</strong>
                  </div>
                  <div>
                    <span>Danh tính truy cập</span>
                    <strong>{item.accessIdentifier || 'Đang chờ cấp'}</strong>
                  </div>
                  {item.externalResourceId && (
                    <div>
                      <span>Mã tài nguyên</span>
                      <strong>{item.externalResourceId}</strong>
                    </div>
                  )}
                </div>
              )}

              {item.usageNote && <p className="locker-note">{item.usageNote}</p>}

              <div className="locker-dates">
                <span className={expired ? 'danger' : ''}>{remainingLabel(item.expiresAt, 'sử dụng', now)}</span>
                <span className={warrantyExpired ? 'danger' : ''}>
                  <ShieldAlert size={15} /> {remainingLabel(item.warrantyUntil, 'bảo hành', now)}
                </span>
              </div>

              {warrantyTarget === item.id && (
                <div className="locker-warranty-form">
                  <select value={warrantyReason} onChange={(event) => setWarrantyReason(event.target.value)}>
                    {warrantyReasons.map((reason) => <option value={reason} key={reason}>{reason}</option>)}
                  </select>
                  <button type="button" onClick={() => handleWarranty(item)} disabled={submittingId === item.id}>
                    Gửi yêu cầu
                  </button>
                  <button type="button" className="plain" onClick={() => setWarrantyTarget(null)}>Đóng</button>
                </div>
              )}

              <div className="locker-actions">
                <button
                  type="button"
                  hidden={!item.loginIdentifier || !item.passwordSecret}
                  onClick={() => downloadText(credentialLine(item), `${item.orderCode || item.id}.txt`)}
                >
                  <Download size={16} /> Tải tài khoản
                </button>
                <button
                  type="button"
                  onClick={() => setWarrantyTarget(warrantyTarget === item.id ? null : item.id)}
                  disabled={!item.orderCode || !item.credentialId || warrantyExpired || !active}
                >
                  <ShieldAlert size={16} /> Báo lỗi / Bảo hành
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={() => handleRenewClick(item)}
                  disabled={!item.orderCode || submittingId === item.id || item.renewalRequestedAt || ['REVOKED', 'FAILED'].includes(item.status)}
                >
                  <RefreshCw size={16} /> {item.renewalRequestedAt ? 'Đang chờ gia hạn' : 'Yêu cầu gia hạn'}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {!loading && !filtered.length && (
        <div className="locker-empty">
          <KeyRound size={28} />
          <strong>Chưa có quyền truy cập nào</strong>
          <span>Dịch vụ và tài nguyên của bạn sẽ xuất hiện tại đây sau khi mua.</span>
        </div>
      )}

      <ConfirmModal
        isOpen={!!renewTarget}
        onClose={() => setRenewTarget(null)}
        onConfirm={handleRenewConfirm}
        title="Xác nhận gia hạn"
        message={renewTarget
          ? `Gửi yêu cầu gia hạn ${renewTarget.serviceName}? Member hoặc tài nguyên hiện tại sẽ được giữ nguyên.`
          : ''}
        confirmText="Gia hạn"
        cancelText="Hủy"
        variant="primary"
      />
    </section>
  )
}

export default LockerView
