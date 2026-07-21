import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock3, PauseCircle, RefreshCw, ShieldOff } from 'lucide-react'
import { adminApi } from '../../../api/admin.api'
import Loading from '../../../components/Loading/Loading'
import Modal from '../../../components/Modal/Modal'
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
  const [actionDraft, setActionDraft] = useState(null)

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

  const openActionModal = (item, action) => {
    setActionDraft({
      action,
      item,
      extendDays: '30',
      externalResourceId: item.externalResourceId || '',
      reason: '',
    })
  }

  const closeActionModal = () => {
    if (!busyId) {
      setActionDraft(null)
    }
  }

  const update = async (item, action, values = {}) => {
    let payload = { action }
    if (action === 'ACTIVATE') {
      payload = {
        ...payload,
        externalResourceId: values.externalResourceId || '',
        reason: 'Admin confirmed access provisioning',
      }
    }
    if (action === 'EXTEND') {
      const extendDays = Number(values.extendDays)
      if (!Number.isInteger(extendDays) || extendDays < 1) {
        onSetError(t('admin.entitlements.prompt.extendInvalid'))
        return
      }
      payload = { ...payload, extendDays, reason: 'Renewal payment/provisioning confirmed' }
    }
    if (['SUSPEND', 'REVOKE'].includes(action)) {
      const reason = values.reason
      if (!reason?.trim()) {
        return
      }
      payload = { ...payload, reason: reason.trim() }
    }

    setBusyId(item.id)
    try {
      const saved = await adminApi.updateEntitlement(item.id, payload, token)
      setItems((current) => current.map((entry) => entry.id === saved.id ? saved : entry))
      setActionDraft(null)
      onSetNotice(t('admin.entitlements.updateSuccess', { id: item.id }))
    } catch (err) {
      onSetError(err.message || t('admin.entitlements.updateError'))
    } finally {
      setBusyId(null)
    }
  }

  const submitActionModal = (event) => {
    event.preventDefault()
    if (!actionDraft) return
    void update(actionDraft.item, actionDraft.action, actionDraft)
  }

  const actionTitle = actionDraft
    ? actionDraft.action === 'ACTIVATE'
      ? t('admin.entitlements.action.activate')
      : actionDraft.action === 'EXTEND'
        ? t('admin.entitlements.action.extend')
        : actionDraft.action === 'SUSPEND'
          ? t('admin.entitlements.action.suspend')
          : t('admin.entitlements.action.revoke')
    : ''

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
                    <td data-label={t('admin.entitlements.table.customer')}><strong>{item.userName}</strong><small>{item.userEmail}</small></td>
                    <td data-label={t('admin.entitlements.table.service')}><strong>{item.serviceName}</strong><small>{item.orderCode}</small></td>
                    <td data-label={t('admin.entitlements.table.access')}>
                      <strong>{item.accessStrategy ? t(strategyKeys[item.accessStrategy] || item.accessStrategy) : ''}</strong>
                      <small>{item.externalResourceId || item.accessIdentifier || t('admin.entitlements.noResource')}</small>
                    </td>
                    <td data-label={t('admin.entitlements.table.expiry')}><strong>{formatAdminDate(item.expiresAt)}</strong><small>{t('admin.entitlements.startsAt')} {formatAdminDate(item.startsAt)}</small></td>
                    <td data-label={t('admin.entitlements.table.status')}><span className={`entitlement-status ${String(item.status).toLowerCase()}`}>{t(statusKeys[item.status] || item.status)}</span></td>
                    <td data-label={t('admin.entitlements.table.actions')}>
                      <div className="entitlement-actions">
                        <button type="button" title={t('admin.entitlements.action.activate')} disabled={busyId === item.id} onClick={() => openActionModal(item, 'ACTIVATE')}><CheckCircle2 size={15} /></button>
                        <button type="button" title={t('admin.entitlements.action.extend')} disabled={busyId === item.id} onClick={() => openActionModal(item, 'EXTEND')}><Clock3 size={15} /></button>
                        <button type="button" title={t('admin.entitlements.action.suspend')} disabled={busyId === item.id} onClick={() => openActionModal(item, 'SUSPEND')}><PauseCircle size={15} /></button>
                        <button type="button" title={t('admin.entitlements.action.revoke')} className="danger" disabled={busyId === item.id} onClick={() => openActionModal(item, 'REVOKE')}><ShieldOff size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        isOpen={Boolean(actionDraft)}
        maxWidth="520px"
        onClose={closeActionModal}
        title={actionTitle}
      >
        {actionDraft && (
          <form className="admin-form compact entitlement-action-form" onSubmit={submitActionModal}>
            <div className="entitlement-action-summary">
              <strong>{actionDraft.item.serviceName}</strong>
              <span>{actionDraft.item.userName} · {actionDraft.item.orderCode}</span>
            </div>

            {actionDraft.action === 'ACTIVATE' && (
              <label>
                <span>{t('admin.entitlements.prompt.resourceId')}</span>
                <input
                  value={actionDraft.externalResourceId}
                  onChange={(event) => setActionDraft((current) => ({ ...current, externalResourceId: event.target.value }))}
                  autoFocus
                />
              </label>
            )}

            {actionDraft.action === 'EXTEND' && (
              <label>
                <span>{t('admin.entitlements.prompt.extendDays')}</span>
                <input
                  value={actionDraft.extendDays}
                  onChange={(event) => setActionDraft((current) => ({ ...current, extendDays: event.target.value.replace(/\D/g, '') }))}
                  inputMode="numeric"
                  autoFocus
                />
              </label>
            )}

            {['SUSPEND', 'REVOKE'].includes(actionDraft.action) && (
              <label>
                <span>{actionDraft.action === 'SUSPEND' ? t('admin.entitlements.prompt.suspendReason') : t('admin.entitlements.prompt.revokeReason')}</span>
                <textarea
                  value={actionDraft.reason}
                  onChange={(event) => setActionDraft((current) => ({ ...current, reason: event.target.value }))}
                  rows={4}
                  autoFocus
                  required
                />
              </label>
            )}

            <div className="entitlement-modal-actions">
              <button type="button" className="admin-icon-button" onClick={closeActionModal} disabled={Boolean(busyId)}>
                {t('common.cancel', { defaultValue: 'Hủy' })}
              </button>
              <button type="submit" className={actionDraft.action === 'REVOKE' ? 'admin-danger-button' : 'admin-primary-button'} disabled={Boolean(busyId)}>
                {actionTitle}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default AdminEntitlementsView
