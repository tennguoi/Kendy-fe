import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock3, PauseCircle, RefreshCw, ShieldOff } from 'lucide-react'
import { adminApi } from '../../../api/admin.api'
import Loading from '../../../components/Loading/Loading'
import { AdminEmptyState } from '../AdminShared'
import { formatAdminDate } from '../adminFormat'

const statusKeys = {
  PENDING: 'admin.entitlements.status.PENDING',
  ACTIVE: 'admin.entitlements.status.ACTIVE',
  EXPIRING: 'admin.entitlements.status.EXPIRING',
  SUSPENDED: 'admin.entitlements.status.SUSPENDED',
  REVOKED: 'admin.entitlements.status.REVOKED',
  FAILED: 'admin.entitlements.status.FAILED',
}

const strategyKeys = {
  DEDICATED_ACCOUNT: 'admin.entitlements.strategy.DEDICATED_ACCOUNT',
  TEAM_INVITE: 'admin.entitlements.strategy.TEAM_INVITE',
  PROVIDER_API: 'admin.entitlements.strategy.PROVIDER_API',
  INTERNAL_ACCESS: 'admin.entitlements.strategy.INTERNAL_ACCESS',
  MANUAL: 'admin.entitlements.strategy.MANUAL',
}

function AdminEntitlementsView({ onSetError, onSetNotice, token }) {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await adminApi.getEntitlements(token)
      setItems(Array.isArray(data) ? data : data?.content || [])
    } catch (err) {
      onSetError(err.message || t('admin.entitlements.loadError'))
    } finally {
      setLoading(false)
    }
  }, [onSetError, token, t])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return items.filter((item) => {
      if (status && item.status !== status) return false
      if (!normalized) return true
      return [item.userName, item.userEmail, item.serviceName, item.orderCode, item.accessIdentifier, item.externalResourceId]
        .some((value) => String(value || '').toLowerCase().includes(normalized))
    })
  }, [items, query, status])

  const update = async (item, action) => {
    let payload = { action }
    if (action === 'ACTIVATE') {
      const externalResourceId = window.prompt(
        t('admin.entitlements.prompt.resourceId'),
        item.externalResourceId || '',
      )
      if (externalResourceId === null) return
      payload = { ...payload, externalResourceId, reason: 'Admin confirmed access provisioning' }
    }
    if (action === 'EXTEND') {
      const raw = window.prompt(t('admin.entitlements.prompt.extendDays'), '30')
      if (raw === null) return
      const extendDays = Number(raw)
      if (!Number.isInteger(extendDays) || extendDays < 1) {
        onSetError(t('admin.entitlements.prompt.extendInvalid'))
        return
      }
      payload = { ...payload, extendDays, reason: 'Renewal payment/provisioning confirmed' }
    }
    if (['SUSPEND', 'REVOKE'].includes(action)) {
      const reason = window.prompt(action === 'SUSPEND' ? t('admin.entitlements.prompt.suspendReason') : t('admin.entitlements.prompt.revokeReason'))
      if (!reason?.trim()) return
      payload = { ...payload, reason: reason.trim() }
    }

    setBusyId(item.id)
    try {
      const saved = await adminApi.updateEntitlement(item.id, payload, token)
      setItems((current) => current.map((entry) => entry.id === saved.id ? saved : entry))
      onSetNotice(t('admin.entitlements.updateSuccess', { id: item.id }))
    } catch (err) {
      onSetError(err.message || t('admin.entitlements.updateError'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="admin-view entitlements-view">
      <div className="admin-toolbar">
        <div>
          <span className="entitlements-eyebrow">{t('admin.entitlements.eyebrow')}</span>
          <h2>{t('admin.entitlements.title')}</h2>
          <p>{t('admin.entitlements.description')}</p>
        </div>
        <button type="button" className="admin-icon-button" onClick={load} disabled={loading}>
          <RefreshCw size={17} /> {t('admin.entitlements.reload')}
        </button>
      </div>

      <section className="admin-panel entitlement-filters">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('admin.entitlements.searchPlaceholder')} />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">{t('admin.entitlements.allStatus')}</option>
          {Object.entries(statusKeys).map(([value, key]) => <option value={value} key={value}>{t(key)}</option>)}
        </select>
        <strong>{t('admin.entitlements.count', { count: filtered.length })}</strong>
      </section>

      <section className="admin-panel">
        {loading ? <Loading /> : filtered.length === 0 ? (
          <AdminEmptyState message={t('admin.entitlements.empty')} />
        ) : (
          <div className="entitlement-table-wrap">
            <table className="entitlement-table">
              <thead>
                <tr>
                  <th>{t('admin.entitlements.table.customer')}</th>
                  <th>{t('admin.entitlements.table.service')}</th>
                  <th>{t('admin.entitlements.table.access')}</th>
                  <th>{t('admin.entitlements.table.expiry')}</th>
                  <th>{t('admin.entitlements.table.status')}</th>
                  <th>{t('admin.entitlements.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.userName}</strong><small>{item.userEmail}</small></td>
                    <td><strong>{item.serviceName}</strong><small>{item.orderCode}</small></td>
                    <td>
                      <strong>{item.accessStrategy ? t(strategyKeys[item.accessStrategy] || item.accessStrategy) : ''}</strong>
                      <small>{item.externalResourceId || item.accessIdentifier || t('admin.entitlements.noResource')}</small>
                    </td>
                    <td><strong>{formatAdminDate(item.expiresAt)}</strong><small>{t('admin.entitlements.startsAt')} {formatAdminDate(item.startsAt)}</small></td>
                    <td><span className={`entitlement-status ${String(item.status).toLowerCase()}`}>{t(statusKeys[item.status] || item.status)}</span></td>
                    <td>
                      <div className="entitlement-actions">
                        <button type="button" title={t('admin.entitlements.action.activate')} disabled={busyId === item.id} onClick={() => update(item, 'ACTIVATE')}><CheckCircle2 size={15} /></button>
                        <button type="button" title={t('admin.entitlements.action.extend')} disabled={busyId === item.id} onClick={() => update(item, 'EXTEND')}><Clock3 size={15} /></button>
                        <button type="button" title={t('admin.entitlements.action.suspend')} disabled={busyId === item.id} onClick={() => update(item, 'SUSPEND')}><PauseCircle size={15} /></button>
                        <button type="button" title={t('admin.entitlements.action.revoke')} className="danger" disabled={busyId === item.id} onClick={() => update(item, 'REVOKE')}><ShieldOff size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminEntitlementsView
