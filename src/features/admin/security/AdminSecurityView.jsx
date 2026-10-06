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
  ShieldCheck,
  ShieldOff,
  Siren,
  UserCog,
  Webhook,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../api/admin.api'
import Loading from '../../../components/Loading/Loading'
import { AdminEmptyState } from '../AdminShared'
import { resolveAdminError } from '../adminErrorResolver'
import { formatAdminDate } from '../adminFormat'

const TABS = ['accounts', 'sessions', 'apiKeys', 'events', 'threats', 'alerts', 'ipBans']
const EVENT_CATEGORIES = ['ALL', 'CREDENTIAL', 'WEBHOOK', 'AUTH', 'ADMIN']
const NEW_TAB_META = {
  threats: { label: 'Threats', title: 'Active threats', hint: 'Top attacking IPs and latest security events' },
  alerts: { label: 'Alerts', title: 'Alert queue', hint: 'Triage detected incidents (ack / resolve / false positive)' },
  ipBans: { label: 'IP bans', title: 'Blocked IP addresses', hint: 'Manually or automatically blocked sources' },
}
const SEVERITY_TONE = { CRITICAL: 'danger', HIGH: 'danger', MEDIUM: 'warn', LOW: 'info', INFO: 'neutral' }

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

function SecurityEventMiniTable({ events, t, onIp }) {
  return (
    <div className="admin-data-table">
      <div className="admin-data-row head security-row events">
        <span>{t('admin.security.events.time')}</span>
        <span>{t('admin.security.threats.type', { defaultValue: 'Type' })}</span>
        <span>{t('admin.security.threats.severity', { defaultValue: 'Severity' })}</span>
        <span>{t('admin.security.events.ip')}</span>
        <span>{t('admin.security.threats.path', { defaultValue: 'Path' })}</span>
      </div>
      {events.map((event) => (
        <div className="admin-data-row security-row events" key={event.id}>
          <span>{formatAdminDate(event.occurredAt)}</span>
          <strong className="security-mono">{event.type}</strong>
          <span className={`security-pill ${SEVERITY_TONE[event.severity] || 'muted'}`}>{event.severity}</span>
          {event.ip
            ? <button type="button" className="security-link security-mono" onClick={() => onIp(event.ip)}>{event.ip}</button>
            : <span className="security-mono">—</span>}
          <small className="security-details">{event.path || event.metadata || '—'}</small>
        </div>
      ))}
    </div>
  )
}

function AdminSecurityView({ currentUser, onSetError, onSetNotice, token }) {
  const { t } = useTranslation()
  const canManage = currentUser?.role === 'SUPER_ADMIN'

  const [overview, setOverview] = useState(null)
  const [threat, setThreat] = useState(null)
  const [tab, setTab] = useState('accounts')
  const [category, setCategory] = useState('ALL')
  const [rows, setRows] = useState([])
  const [threatEvents, setThreatEvents] = useState([])
  const [timeline, setTimeline] = useState([])
  const [detail, setDetail] = useState(null)
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

  const loadThreat = useCallback(async () => {
    if (!token) return
    try {
      setThreat(await adminApi.getThreatOverview(token))
    } catch (err) {
      onSetError(resolveAdminError(err, t('admin.security.loadError')))
    }
  }, [onSetError, t, token])

  const loadThreats = useCallback(async () => {
    if (!token) return
    try {
      const [events, points] = await Promise.all([
        adminApi.getSecurityThreatEvents(token, { limit: 50 }),
        adminApi.getSecurityTimeline(token, { hours: 24, bucket: 60 }),
      ])
      setThreatEvents(Array.isArray(events) ? events : [])
      setTimeline(Array.isArray(points) ? points : [])
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
      else if (tab === 'threats') data = await adminApi.getSecurityTopIps(token)
      else if (tab === 'alerts') data = await adminApi.getSecurityAlerts(token)
      else if (tab === 'ipBans') data = await adminApi.getSecurityIpBans(token)
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

  useEffect(() => { loadOverview(); loadThreat() }, [loadOverview, loadThreat])
  useEffect(() => { loadRows() }, [loadRows])
  useEffect(() => { if (tab === 'threats') loadThreats() }, [tab, loadThreats])

  const reload = () => {
    loadOverview()
    loadThreat()
    loadRows()
    if (tab === 'threats') loadThreats()
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

  const toggleWalletFreeze = async (row) => {
    if (row.walletFrozen) {
      if (!window.confirm(t('admin.security.accounts.confirmUnfreezeWallet', { defaultValue: 'Unfreeze wallet for {{email}}?', email: row.email }))) return
      setBusyId(row.userId)
      try {
        await adminApi.unfreezeSecurityWallet(row.userId, token)
        onSetNotice(t('admin.security.accounts.unfreezeWalletSuccess', { defaultValue: 'Wallet unfrozen' }))
        reload()
      } catch (err) {
        onSetError(resolveAdminError(err, t('admin.security.accounts.freezeWalletError', { defaultValue: 'Could not update wallet' })))
      } finally {
        setBusyId(null)
      }
      return
    }
    const reason = window.prompt(t('admin.security.accounts.freezeWalletReason', { defaultValue: 'Reason for freezing this wallet (AUTH-13 suspected takeover)' }))
    if (reason === null) return
    setBusyId(row.userId)
    try {
      await adminApi.freezeSecurityWallet(row.userId, reason || 'Manual freeze by admin', token)
      onSetNotice(t('admin.security.accounts.freezeWalletSuccess', { defaultValue: 'Wallet frozen' }))
      reload()
    } catch (err) {
      onSetError(resolveAdminError(err, t('admin.security.accounts.freezeWalletError', { defaultValue: 'Could not update wallet' })))
    } finally {
      setBusyId(null)
    }
  }

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

  const setAlertStatus = async (row, status) => {
    setBusyId(row.id)
    try {
      await adminApi.updateSecurityAlert(row.id, { status }, token)
      onSetNotice(t('admin.security.alerts.updated', { defaultValue: 'Alert updated' }))
      loadRows()
      loadThreat()
    } catch (err) {
      onSetError(resolveAdminError(err, t('admin.security.alerts.updateError', { defaultValue: 'Could not update alert' })))
    } finally {
      setBusyId(null)
    }
  }

  const unbanIp = async (row) => {
    if (!window.confirm(t('admin.security.ipBans.confirmUnban', { defaultValue: 'Unblock {{ip}}?', ip: row.ipOrCidr }))) return
    setBusyId(row.id)
    try {
      await adminApi.unbanSecurityIp(row.id, token)
      onSetNotice(t('admin.security.ipBans.unbanSuccess', { defaultValue: 'IP unblocked' }))
      loadRows()
      loadThreat()
    } catch (err) {
      onSetError(resolveAdminError(err, t('admin.security.ipBans.unbanError', { defaultValue: 'Could not unblock IP' })))
    } finally {
      setBusyId(null)
    }
  }

  const banIp = async () => {
    const ipOrCidr = window.prompt(t('admin.security.ipBans.prompt', { defaultValue: 'IP or CIDR to block' }))
    if (!ipOrCidr) return
    const reason = window.prompt(t('admin.security.ipBans.reasonPrompt', { defaultValue: 'Reason' })) || 'Manual ban'
    setBusyId(ipOrCidr)
    try {
      await adminApi.banSecurityIp({ ipOrCidr, reason, durationMinutes: 1440 }, token)
      onSetNotice(t('admin.security.ipBans.banSuccess', { defaultValue: 'IP blocked' }))
      if (tab !== 'ipBans') setTab('ipBans')
      else loadRows()
      loadThreat()
    } catch (err) {
      onSetError(resolveAdminError(err, t('admin.security.ipBans.banError', { defaultValue: 'Could not block IP' })))
    } finally {
      setBusyId(null)
    }
  }

  const o = overview || {}
  const th = threat || {}
  const timelineMax = Math.max(1, ...timeline.map((point) => point.total))
  const eventLabel = (action) => t(`admin.security.events.actions.${action}`, { defaultValue: action })

  const openUserRisk = async (row) => {
    setDetail({ type: 'userRisk', loading: true })
    try {
      const data = await adminApi.getSecurityUserRisk(row.userId, token)
      setDetail({ type: 'userRisk', data })
    } catch (err) {
      setDetail(null)
      onSetError(resolveAdminError(err, t('admin.security.loadError')))
    }
  }

  const openIpProfile = async (ip) => {
    setDetail({ type: 'ipProfile', loading: true })
    try {
      const data = await adminApi.getSecurityIpProfile(ip, token)
      setDetail({ type: 'ipProfile', data })
    } catch (err) {
      setDetail(null)
      onSetError(resolveAdminError(err, t('admin.security.loadError')))
    }
  }

  const revokeAllSessions = async (row) => {
    if (!window.confirm(t('admin.security.sessions.confirmRevokeAll', { defaultValue: 'Sign out all sessions for {{email}}?', email: row.userEmail }))) return
    setBusyId(row.userId)
    try {
      await adminApi.revokeAllSecuritySessions(row.userId, token)
      onSetNotice(t('admin.security.sessions.revokeAllSuccess', { defaultValue: 'All sessions signed out' }))
      loadRows()
    } catch (err) {
      onSetError(resolveAdminError(err, t('admin.security.sessions.revokeAllError', { defaultValue: 'Could not sign out sessions' })))
    } finally {
      setBusyId(null)
    }
  }

  const checkAuditIntegrity = async () => {
    setBusyId('integrity')
    try {
      const report = await adminApi.getAuditIntegrity(token)
      onSetNotice(report?.intact
        ? t('admin.security.integrity.ok', { defaultValue: 'Audit log chain intact ({{count}} rows checked)', count: report.checkedRows })
        : t('admin.security.integrity.broken', { defaultValue: 'Audit log chain BROKEN at #{{id}}', id: report.firstBrokenId }))
    } catch (err) {
      onSetError(resolveAdminError(err, t('admin.security.loadError')))
    } finally {
      setBusyId(null)
    }
  }

  const banSpecificIp = async (ip) => {
    const reason = window.prompt(t('admin.security.ipBans.reasonPrompt', { defaultValue: 'Reason' })) || 'Manual ban'
    setBusyId(ip)
    try {
      await adminApi.banSecurityIp({ ipOrCidr: ip, reason, durationMinutes: 1440 }, token)
      onSetNotice(t('admin.security.ipBans.banSuccess', { defaultValue: 'IP blocked' }))
      loadThreat()
      if (tab === 'ipBans') loadRows()
    } catch (err) {
      onSetError(resolveAdminError(err, t('admin.security.ipBans.banError', { defaultValue: 'Could not block IP' })))
    } finally {
      setBusyId(null)
    }
  }

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
          {canManage && tab === 'ipBans' && (
            <button type="button" className="admin-icon-button" onClick={banIp} disabled={busyId !== null}>
              <Ban size={18} strokeWidth={2} aria-hidden="true" />
              <span>{t('admin.security.ipBans.block', { defaultValue: 'Block IP' })}</span>
            </button>
          )}
          {canManage && (
            <button type="button" className="admin-icon-button" onClick={checkAuditIntegrity} disabled={busyId !== null}>
              <ShieldCheck size={18} strokeWidth={2} aria-hidden="true" />
              <span>{t('admin.security.integrity.check', { defaultValue: 'Audit integrity' })}</span>
            </button>
          )}
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
        <KpiCard icon={ShieldCheck} tone={(th.healthScore ?? 100) >= 80 ? 'ok' : 'warn'}
          label={t('admin.security.kpi.healthScore', { defaultValue: 'Health score' })}
          value={th.healthScore ?? '—'}
          hint={th.topAttackType ? t('admin.security.kpi.topAttack', { defaultValue: 'Top: {{type}}', type: th.topAttackType }) : undefined} />
        <KpiCard icon={Siren} tone={(th.openAlerts ?? 0) > 0 ? 'danger' : 'ok'}
          label={t('admin.security.kpi.openAlerts', { defaultValue: 'Open alerts' })}
          value={th.openAlerts}
          hint={t('admin.security.kpi.alertsBreakdown', { defaultValue: '{{critical}} critical · {{high}} high', critical: th.criticalAlerts ?? 0, high: th.highAlerts ?? 0 })} />
        <KpiCard icon={Ban} tone={(th.bannedIps ?? 0) > 0 ? 'warn' : 'neutral'}
          label={t('admin.security.kpi.bannedIps', { defaultValue: 'Banned IPs' })} value={th.bannedIps} />
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
              {t(`admin.security.tabs.${key}`, { defaultValue: NEW_TAB_META[key]?.label || key })}
            </button>
          ))}
        </div>

        <div className="admin-panel-head">
          <div>
            <h3>{t(`admin.security.${tab}.title`, { defaultValue: NEW_TAB_META[tab]?.title || tab })}</h3>
            <span>{t(`admin.security.${tab}.hint`, { defaultValue: NEW_TAB_META[tab]?.hint || '' })}</span>
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
                  {canManage && (
                    <button
                      type="button"
                      className={`security-action ${row.walletFrozen ? '' : 'danger'}`}
                      disabled={busyId === row.userId}
                      onClick={() => toggleWalletFreeze(row)}
                    >
                      {row.walletFrozen
                        ? t('admin.security.accounts.unfreezeWallet', { defaultValue: 'Unfreeze wallet' })
                        : t('admin.security.accounts.freezeWallet', { defaultValue: 'Freeze wallet' })}
                    </button>
                  )}
                  <button type="button" className="security-action" disabled={busyId === row.userId} onClick={() => openUserRisk(row)}>
                    {t('admin.security.accounts.risk', { defaultValue: 'Risk' })}
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}

        {!loading && rows.length > 0 && tab === 'sessions' && (
          <div className="admin-data-table">
            <div className="admin-data-row head security-row sessions">
              <span>{t('admin.security.sessions.user')}</span>
              <span>{t('admin.security.sessions.location', { defaultValue: 'Location' })}</span>
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
                <div>
                  <small className="security-mono">{row.lastIp || row.createdIp || '—'}</small>
                  {row.country && <small>{row.country}</small>}
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
                  {canManage && (
                    <button type="button" className="security-action danger" disabled={busyId === row.userId} onClick={() => revokeAllSessions(row)}>
                      {t('admin.security.sessions.revokeAll', { defaultValue: 'Sign out all' })}
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

        {!loading && tab === 'threats' && (
          <>
            {timeline.length > 0 && (
              <div className="security-timeline" aria-label={t('admin.security.threats.timeline', { defaultValue: '24h activity' })}>
                {timeline.map((point) => (
                  <div
                    className="security-timeline-col"
                    key={point.bucket}
                    title={t('admin.security.threats.timelinePoint', {
                      defaultValue: '{{time}} · total {{total}} (login {{login}}, 429 {{rate}}, waf {{waf}}, webhook {{hook}})',
                      time: formatAdminDate(point.bucket),
                      total: point.total,
                      login: point.loginFailures,
                      rate: point.rateLimited,
                      waf: point.wafHits,
                      hook: point.webhookRejections,
                    })}
                  >
                    <div className="security-timeline-bar" style={{ height: `${Math.max(2, Math.round((point.total / timelineMax) * 100))}%` }} />
                  </div>
                ))}
              </div>
            )}

            {rows.length > 0 && (
              <div className="admin-data-table">
                <div className="admin-data-row head security-row events">
                  <span>{t('admin.security.threats.ip', { defaultValue: 'IP' })}</span>
                  <span>{t('admin.security.threats.events', { defaultValue: 'Events' })}</span>
                  <span>{t('admin.security.threats.severity', { defaultValue: 'Severity' })}</span>
                  <span>{t('admin.security.threats.risk', { defaultValue: 'Risk' })}</span>
                  <span>{t('admin.security.threats.state', { defaultValue: 'State' })}</span>
                  <span />
                </div>
                {rows.map((row) => (
                  <div className="admin-data-row security-row events" key={row.ip}>
                    <button type="button" className="security-link security-mono" onClick={() => openIpProfile(row.ip)}>{row.ip}</button>
                    <span>{row.eventCount}</span>
                    <span className={`security-pill ${SEVERITY_TONE[row.maxSeverity] || 'muted'}`}>{row.maxSeverity || '—'}</span>
                    <span className={`security-attempts ${row.riskScore >= 60 ? 'hot' : ''}`}>{row.riskScore}</span>
                    <span className={`security-pill ${row.banned ? 'danger' : 'ok'}`}>
                      {row.banned
                        ? t('admin.security.threats.banned', { defaultValue: 'Blocked' })
                        : t('admin.security.threats.monitoring', { defaultValue: 'Monitoring' })}
                    </span>
                    <span className="security-row-actions">
                      <button type="button" className="security-action" onClick={() => openIpProfile(row.ip)}>
                        {t('admin.security.threats.profile', { defaultValue: 'Profile' })}
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {threatEvents.length > 0 && (
              <div className="security-feed">
                <h4>{t('admin.security.threats.feed', { defaultValue: 'Latest security events' })}</h4>
                <div className="admin-data-table">
                  <div className="admin-data-row head security-row events">
                    <span>{t('admin.security.events.time')}</span>
                    <span>{t('admin.security.threats.type', { defaultValue: 'Type' })}</span>
                    <span>{t('admin.security.threats.severity', { defaultValue: 'Severity' })}</span>
                    <span>{t('admin.security.events.ip')}</span>
                    <span>{t('admin.security.threats.path', { defaultValue: 'Path' })}</span>
                  </div>
                  {threatEvents.map((event) => (
                    <div className="admin-data-row security-row events" key={event.id}>
                      <span>{formatAdminDate(event.occurredAt)}</span>
                      <strong className="security-mono">{event.type}</strong>
                      <span className={`security-pill ${SEVERITY_TONE[event.severity] || 'muted'}`}>{event.severity}</span>
                      <button type="button" className="security-link security-mono" onClick={() => event.ip && openIpProfile(event.ip)}>{event.ip || '—'}</button>
                      <small className="security-details">{event.path || event.metadata || '—'}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && rows.length > 0 && tab === 'alerts' && (
          <div className="admin-data-table">
            <div className="admin-data-row head security-row events">
              <span>{t('admin.security.alerts.severity', { defaultValue: 'Severity' })}</span>
              <span>{t('admin.security.alerts.rule', { defaultValue: 'Rule' })}</span>
              <span>{t('admin.security.alerts.title', { defaultValue: 'Title' })}</span>
              <span>{t('admin.security.alerts.subject', { defaultValue: 'Subject' })}</span>
              <span>{t('admin.security.alerts.lastSeen', { defaultValue: 'Last seen' })}</span>
              <span>{t('admin.security.alerts.status', { defaultValue: 'Status' })}</span>
              <span />
            </div>
            {rows.map((row) => (
              <div className="admin-data-row security-row events" key={row.id}>
                <span className={`security-pill ${SEVERITY_TONE[row.severity] || 'muted'}`}>{row.severity}</span>
                <strong className="security-mono">{row.ruleCode}</strong>
                <span>{row.title}</span>
                <span className="security-mono">{row.subjectValue}</span>
                <span>{formatAdminDate(row.lastSeen)}</span>
                <span className={`security-pill ${row.status === 'OPEN' ? 'warn' : 'ok'}`}>{row.status}</span>
                <span className="security-row-actions">
                  {row.status === 'OPEN' && (
                    <>
                      <button type="button" className="security-action" disabled={busyId === row.id} onClick={() => setAlertStatus(row, 'ACK')}>
                        {t('admin.security.alerts.ack', { defaultValue: 'Ack' })}
                      </button>
                      <button type="button" className="security-action" disabled={busyId === row.id} onClick={() => setAlertStatus(row, 'RESOLVED')}>
                        {t('admin.security.alerts.resolve', { defaultValue: 'Resolve' })}
                      </button>
                      <button type="button" className="security-action" disabled={busyId === row.id} onClick={() => setAlertStatus(row, 'FALSE_POSITIVE')}>
                        {t('admin.security.alerts.falsePositive', { defaultValue: 'False +' })}
                      </button>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {!loading && rows.length > 0 && tab === 'ipBans' && (
          <div className="admin-data-table">
            <div className="admin-data-row head security-row events">
              <span>{t('admin.security.ipBans.ip', { defaultValue: 'IP / CIDR' })}</span>
              <span>{t('admin.security.ipBans.source', { defaultValue: 'Source' })}</span>
              <span>{t('admin.security.ipBans.rule', { defaultValue: 'Rule' })}</span>
              <span>{t('admin.security.ipBans.hits', { defaultValue: 'Hits' })}</span>
              <span>{t('admin.security.ipBans.expires', { defaultValue: 'Expires' })}</span>
              <span>{t('admin.security.ipBans.reason', { defaultValue: 'Reason' })}</span>
              <span />
            </div>
            {rows.map((row) => (
              <div className="admin-data-row security-row events" key={row.id}>
                <strong className="security-mono">{row.ipOrCidr}</strong>
                <span className={`security-pill ${row.source === 'AUTO_RULE' ? 'warn' : 'info'}`}>{row.source}</span>
                <span className="security-mono">{row.ruleCode || '—'}</span>
                <span>{row.hitCount}</span>
                <span>{row.expiresAt ? formatAdminDate(row.expiresAt) : t('admin.security.ipBans.permanent', { defaultValue: 'Permanent' })}</span>
                <small className="security-details">{row.reason || '—'}</small>
                <span className="security-row-actions">
                  {canManage && (
                    <button type="button" className="security-action danger" disabled={busyId === row.id} onClick={() => unbanIp(row)}>
                      {t('admin.security.ipBans.unban', { defaultValue: 'Unblock' })}
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {detail && (
        <div className="security-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setDetail(null)}>
          <div className="security-modal" onClick={(event) => event.stopPropagation()}>
            <div className="security-modal-head">
              <h3>
                {detail.type === 'userRisk'
                  ? t('admin.security.detail.userRisk', { defaultValue: 'User risk profile' })
                  : t('admin.security.detail.ipProfile', { defaultValue: 'IP profile' })}
              </h3>
              <button type="button" className="security-modal-close" onClick={() => setDetail(null)} aria-label={t('common.close', { defaultValue: 'Close' })}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {detail.loading && <Loading fullScreen={false} message={t('admin.security.loading')} subMessage="" />}

            {!detail.loading && detail.type === 'userRisk' && detail.data && (
              <div className="security-detail">
                <p><strong>{detail.data.name}</strong> · {detail.data.email} · {detail.data.role}</p>
                <div className="security-detail-grid">
                  <span>{t('admin.security.detail.riskScore', { defaultValue: 'Risk score' })}: <strong>{detail.data.riskScore}</strong></span>
                  <span>{t('admin.security.detail.failedLogins', { defaultValue: 'Failed logins' })}: <strong>{detail.data.failedLoginAttempts}</strong></span>
                  <span>{t('admin.security.detail.twoFactor', { defaultValue: '2FA' })}: <strong>{detail.data.twoFactorEnabled ? 'ON' : 'OFF'}</strong></span>
                  <span>{t('admin.security.detail.wallet', { defaultValue: 'Wallet' })}: <strong>{detail.data.walletFrozen ? t('admin.security.detail.frozen', { defaultValue: 'FROZEN' }) : t('admin.security.detail.active', { defaultValue: 'Active' })}</strong></span>
                  <span>{t('admin.security.detail.lastLogin', { defaultValue: 'Last login' })}: <strong>{detail.data.lastLoginAt ? formatAdminDate(detail.data.lastLoginAt) : '—'}</strong></span>
                  <span>{t('admin.security.detail.lastIp', { defaultValue: 'Last IP' })}: <strong className="security-mono">{detail.data.lastLoginIp || '—'}{detail.data.lastLoginCountry ? ` · ${detail.data.lastLoginCountry}` : ''}</strong></span>
                </div>
                <SecurityEventMiniTable events={detail.data.recentEvents || []} t={t} onIp={openIpProfile} />
              </div>
            )}

            {!detail.loading && detail.type === 'ipProfile' && detail.data && (
              <div className="security-detail">
                <p className="security-mono"><strong>{detail.data.ip}</strong></p>
                <div className="security-detail-grid">
                  <span>{t('admin.security.detail.riskScore', { defaultValue: 'Risk score' })}: <strong>{detail.data.riskScore}</strong></span>
                  <span>{t('admin.security.detail.banned', { defaultValue: 'Banned' })}: <strong>{detail.data.banned ? 'YES' : 'NO'}</strong></span>
                  <span>{t('admin.security.detail.allowlisted', { defaultValue: 'Allowlisted' })}: <strong>{detail.data.allowlisted ? 'YES' : 'NO'}</strong></span>
                  <span>{t('admin.security.detail.eventCount', { defaultValue: 'Events' })}: <strong>{detail.data.eventCount}</strong></span>
                  <span>{t('admin.security.detail.firstSeen', { defaultValue: 'First seen' })}: <strong>{detail.data.firstSeen ? formatAdminDate(detail.data.firstSeen) : '—'}</strong></span>
                  <span>{t('admin.security.detail.lastSeen', { defaultValue: 'Last seen' })}: <strong>{detail.data.lastSeen ? formatAdminDate(detail.data.lastSeen) : '—'}</strong></span>
                </div>
                {!detail.data.banned && canManage && (
                  <button type="button" className="security-action danger" onClick={() => { const ip = detail.data.ip; setDetail(null); banSpecificIp(ip) }}>
                    {t('admin.security.ipBans.block', { defaultValue: 'Block IP' })}
                  </button>
                )}
                <SecurityEventMiniTable events={detail.data.recentEvents || []} t={t} onIp={openIpProfile} />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminSecurityView
