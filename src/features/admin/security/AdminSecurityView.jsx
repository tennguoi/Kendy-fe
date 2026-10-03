import {
  AlertTriangle,
  Ban,
  Clock,
  Eye,
  KeyRound,
  Lock,
  LogOut,
  MonitorSmartphone,
  RefreshCw,
  ShieldAlert,
  ShieldOff,
  UserCog,
  Webhook,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../api/admin.api'
import Loading from '../../../components/Loading/Loading'
import { AdminEmptyState } from '../AdminShared'
import { resolveAdminError } from '../adminErrorResolver'
import { formatAdminDate } from '../adminFormat'

const TABS = ['accounts', 'sessions', 'apiKeys', 'events']
const EVENT_CATEGORIES = ['ALL', 'CREDENTIAL', 'WEBHOOK', 'AUTH', 'ADMIN']

function KpiCard({ icon: Icon, label, value, hint, tone = 'neutral' }) {
  return (
    <div className={`security-kpi ${tone}`}>
      <span className="security-kpi-icon" aria-hidden="true"><Icon size={18} strokeWidth={2.2} /></span>
      <div>
        <span className="security-kpi-label">{label}</span>
        <strong>{value ?? 0}</strong>
        {hint && <small>{hint}</small>}
      </div>
    </div>
  )
}

function AdminSecurityView({ currentUser, onSetError, onSetNotice, token }) {
  const { t } = useTranslation()
  const canManage = currentUser?.role === 'SUPER_ADMIN'

  const [overview, setOverview] = useState(null)
  const [tab, setTab] = useState('accounts')
  const [category, setCategory] = useState('ALL')
  const [rows, setRows] = useState([])
  const [hasLoaded, setHasLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const loadOverview = useCallback(async () => {
    if (!token) return
    try {
      setOverview(await adminApi.getSecurityOverview(token))
    } catch (err) {
      onSetError(resolveAdminError(err, t('admin.security.loadError')))
    }
  }, [onSetError, t, token])

  const loadRows = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      let data
      if (tab === 'accounts') data = await adminApi.getSecurityRiskyAccounts(token)
      else if (tab === 'sessions') data = await adminApi.getSecuritySessions(token)
      else if (tab === 'apiKeys') data = await adminApi.getSecurityApiKeys(token)
      else data = await adminApi.getSecurityEvents(token, category === 'ALL' ? {} : { category })
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      setRows([])
      onSetError(resolveAdminError(err, t('admin.security.loadError')))
    } finally {
      setHasLoaded(true)
      setLoading(false)
    }
  }, [category, onSetError, t, tab, token])

  useEffect(() => { loadOverview() }, [loadOverview])
  useEffect(() => { loadRows() }, [loadRows])

  const reload = () => {
    loadOverview()
    loadRows()
  }

  const runAction = async (id, confirmMessage, action, successKey, errorKey) => {
    if (!window.confirm(confirmMessage)) return
    setBusyId(id)
    try {
      await action()
      onSetNotice(t(successKey))
      reload()
    } catch (err) {
      onSetError(resolveAdminError(err, t(errorKey)))
    } finally {
      setBusyId(null)
    }
  }

  const unlock = (row) => runAction(
    row.userId,
    t('admin.security.accounts.confirmUnlock', { email: row.email }),
    () => adminApi.unlockSecurityAccount(row.userId, token),
    'admin.security.accounts.unlockSuccess',
    'admin.security.accounts.unlockError',
  )

  const revokeSession = (row) => runAction(
    row.id,
    t('admin.security.sessions.confirmRevoke', { email: row.userEmail }),
    () => adminApi.revokeSecuritySession(row.id, token),
    'admin.security.sessions.revokeSuccess',
    'admin.security.sessions.revokeError',
  )

  const revokeKey = (row) => runAction(
    row.id,
    t('admin.security.apiKeys.confirmRevoke', { name: row.name, email: row.userEmail }),
    () => adminApi.revokeSecurityApiKey(row.id, token),
    'admin.security.apiKeys.revokeSuccess',
    'admin.security.apiKeys.revokeError',
  )

  const o = overview || {}
  const eventLabel = (action) => t(`admin.security.events.actions.${action}`, { defaultValue: action })

  return (
    <section className="admin-view security-view">
      <div className="admin-toolbar">
        <div className="admin-toolbar-info">
          <div>
            <h2>{t('admin.security.title')}</h2>
            <p className="security-subtitle">{t('admin.security.subtitle')}</p>
          </div>
        </div>
        <div className="security-toolbar-actions">
          {o.generatedAt && (
            <span className="security-updated">
              <Clock size={14} aria-hidden="true" />
              {t('admin.security.updatedAt', { time: formatAdminDate(o.generatedAt) })}
            </span>
          )}
          <button type="button" className={`admin-icon-button ${loading ? 'loading' : ''}`} onClick={reload} disabled={loading}>
            <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
            <span>{t('admin.security.reload')}</span>
          </button>
        </div>
      </div>

      {!canManage && (
        <p className="security-readonly"><ShieldOff size={16} aria-hidden="true" /> {t('admin.security.readOnly')}</p>
      )}

      <div className="security-kpis">
        <KpiCard icon={Lock} tone={o.lockedAccounts > 0 ? 'danger' : 'ok'}
          label={t('admin.security.kpi.lockedAccounts')} value={o.lockedAccounts} />
        <KpiCard icon={Ban} tone={o.accountsWithFailedLogins > 0 ? 'warn' : 'ok'}
          label={t('admin.security.kpi.failedLogins')} value={o.accountsWithFailedLogins} />
        <KpiCard icon={UserCog} tone={o.adminsWithout2fa > 0 ? 'danger' : 'ok'}
          label={t('admin.security.kpi.adminsNo2fa')} value={o.adminsWithout2fa}
          hint={t('admin.security.kpi.adminsNo2faHint', { total: o.totalAdmins ?? 0 })} />
        <KpiCard icon={Webhook} tone={o.webhookRejections24h > 0 ? 'warn' : 'ok'}
          label={t('admin.security.kpi.webhook24h')} value={o.webhookRejections24h} />
        <KpiCard icon={MonitorSmartphone} label={t('admin.security.kpi.activeSessions')} value={o.activeSessions} />
        <KpiCard icon={KeyRound} label={t('admin.security.kpi.activeApiKeys')} value={o.activeApiKeys} />
        <KpiCard icon={Eye} tone={o.credentialReveals24h > 0 ? 'info' : 'neutral'}
          label={t('admin.security.kpi.reveals24h')} value={o.credentialReveals24h} />
        <KpiCard icon={ShieldAlert} tone={o.sensitiveChanges24h > 0 ? 'info' : 'neutral'}
          label={t('admin.security.kpi.changes24h')} value={o.sensitiveChanges24h} />
      </div>

      <div className="admin-panel security-panel">
        <div className="security-tabs" role="tablist">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`security-tab ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key)}
            >
              {t(`admin.security.tabs.${key}`)}
            </button>
          ))}
        </div>

        <div className="admin-panel-head">
          <div>
            <h3>{t(`admin.security.${tab}.title`)}</h3>
            <span>{t(`admin.security.${tab}.hint`)}</span>
          </div>
        </div>

        {tab === 'events' && (
          <div className="security-chips">
            {EVENT_CATEGORIES.map((key) => (
              <button
                key={key}
                type="button"
                className={`security-chip ${category === key ? 'active' : ''}`}
                onClick={() => setCategory(key)}
              >
                {t(`admin.security.events.categories.${key}`)}
              </button>
            ))}
          </div>
        )}

        {!hasLoaded && loading && <Loading fullScreen={false} message={t('admin.security.loading')} subMessage="" />}

        {!loading && rows.length === 0 && <AdminEmptyState message={t('admin.security.empty')} />}

        {!loading && rows.length > 0 && tab === 'accounts' && (
          <div className="admin-data-table">
            <div className="admin-data-row head security-row accounts">
              <span>{t('admin.security.accounts.account')}</span>
              <span>{t('admin.security.accounts.role')}</span>
              <span>{t('admin.security.accounts.attempts')}</span>
              <span>{t('admin.security.accounts.state')}</span>
              <span>{t('admin.security.accounts.twoFactor')}</span>
              <span />
            </div>
            {rows.map((row) => (
              <div className="admin-data-row security-row accounts" key={row.userId}>
                <div>
                  <strong>{row.name}</strong>
                  <small>{row.email}</small>
                </div>
                <span>{row.role}</span>
                <span className={`security-attempts ${row.failedLoginAttempts >= 3 ? 'hot' : ''}`}>
                  {row.failedLoginAttempts}
                </span>
                <span>
                  {row.locked ? (
                    <span className="security-pill danger" title={t('admin.security.accounts.locked', { time: formatAdminDate(row.lockedUntil) })}>
                      <Lock size={12} aria-hidden="true" />
                      {t('admin.security.accounts.locked', { time: formatAdminDate(row.lockedUntil) })}
                    </span>
                  ) : (
                    <span className="security-pill warn">
                      <AlertTriangle size={12} aria-hidden="true" />
                      {t('admin.security.accounts.warning')}
                    </span>
                  )}
                </span>
                <span className={`security-pill ${row.twoFactorEnabled ? 'ok' : 'muted'}`}>
                  {row.twoFactorEnabled ? t('admin.security.accounts.on') : t('admin.security.accounts.off')}
                </span>
                <span className="security-row-actions">
                  {canManage && (
                    <button type="button" className="security-action" disabled={busyId === row.userId} onClick={() => unlock(row)}>
                      {t('admin.security.accounts.unlock')}
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {!loading && rows.length > 0 && tab === 'sessions' && (
          <div className="admin-data-table">
            <div className="admin-data-row head security-row sessions">
              <span>{t('admin.security.sessions.user')}</span>
              <span>{t('admin.security.sessions.created')}</span>
              <span>{t('admin.security.sessions.lastUsed')}</span>
              <span>{t('admin.security.sessions.expires')}</span>
              <span />
            </div>
            {rows.map((row) => (
              <div className="admin-data-row security-row sessions" key={row.id}>
                <div>
                  <strong>{row.userName}</strong>
                  <small>{row.userEmail} · {row.userRole}</small>
                </div>
                <span>{formatAdminDate(row.createdAt)}</span>
                <span>{formatAdminDate(row.lastUsedAt)}</span>
                <span>{formatAdminDate(row.expiresAt)}</span>
                <span className="security-row-actions">
                  {canManage && (
                    <button type="button" className="security-action danger" disabled={busyId === row.id} onClick={() => revokeSession(row)}>
                      <LogOut size={14} aria-hidden="true" />
                      {t('admin.security.sessions.revoke')}
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {!loading && rows.length > 0 && tab === 'apiKeys' && (
          <div className="admin-data-table">
            <div className="admin-data-row head security-row keys">
              <span>{t('admin.security.apiKeys.user')}</span>
              <span>{t('admin.security.apiKeys.key')}</span>
              <span>{t('admin.security.apiKeys.scopes')}</span>
              <span>{t('admin.security.apiKeys.created')}</span>
              <span>{t('admin.security.apiKeys.lastUsed')}</span>
              <span />
            </div>
            {rows.map((row) => (
              <div className="admin-data-row security-row keys" key={row.id}>
                <div>
                  <strong>{row.userName}</strong>
                  <small>{row.userEmail}</small>
                </div>
                <div>
                  <strong>{row.name}</strong>
                  <small className="security-mono">{row.keyPrefix}…</small>
                </div>
                <span className="security-scopes">{row.scopes || '—'}</span>
                <span>{formatAdminDate(row.createdAt)}</span>
                <span>{row.lastUsedAt ? formatAdminDate(row.lastUsedAt) : t('admin.security.apiKeys.neverUsed')}</span>
                <span className="security-row-actions">
                  {canManage && (
                    <button type="button" className="security-action danger" disabled={busyId === row.id} onClick={() => revokeKey(row)}>
                      {t('admin.security.apiKeys.revoke')}
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {!loading && rows.length > 0 && tab === 'events' && (
          <div className="admin-data-table">
            <div className="admin-data-row head security-row events">
              <span>{t('admin.security.events.time')}</span>
              <span>{t('admin.security.events.action')}</span>
              <span>{t('admin.security.events.actor')}</span>
              <span>{t('admin.security.events.ip')}</span>
              <span>{t('admin.security.events.details')}</span>
            </div>
            {rows.map((row) => (
              <div className="admin-data-row security-row events" key={row.id}>
                <span>{formatAdminDate(row.createdAt)}</span>
                <strong>{eventLabel(row.action)}</strong>
                <span>{row.actorUserId ? `#${row.actorUserId}` : t('admin.security.events.system')}</span>
                <span className="security-mono">{row.ipAddress || '—'}</span>
                <small className="security-details">{row.metadata || '—'}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminSecurityView
