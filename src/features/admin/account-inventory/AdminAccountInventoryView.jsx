import { useTranslation } from 'react-i18next'
import { Eye, FileUp, PackageOpen, Pencil, Plus, RefreshCw, ShieldOff, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import { normalizePaged } from '../../../utils/pagination'
import SearchField from '../../../components/SearchField/SearchField'
import Loading from '../../../components/Loading/Loading'
import { AdminEmptyState } from '../AdminShared'
import Pagination from '../../../components/Pagination/Pagination'
import { formatAdminDate } from '../adminFormat'
import Modal from '../../../components/Modal/Modal'

const emptyForm = {
  expiresAt: '', internalNote: '', loginIdentifier: '', passwordSecret: '',
  recoveryInfo: '', twoFactorSecret: '', usageNote: '', warrantyUntil: '',
}

const toInstant = (value) => value ? new Date(value).toISOString() : null
const toInputDate = (value) => value ? new Date(value).toISOString().slice(0, 16) : ''

function AdminAccountInventoryView({ onSetError, onSetNotice, token }) {
  const { t } = useTranslation()
  const getStatusLabel = (status) => t('admin.accountInventory.status.' + status)
  const statusKeys = ['AVAILABLE', 'RESERVED', 'DELIVERED', 'REPLACED', 'REFUNDED', 'DISABLED', 'EXPIRED']
  const [services, setServices] = useState([])
  const [serviceId, setServiceId] = useState('')
  const [credentials, setCredentials] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [csv, setCsv] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [revealed, setRevealed] = useState({})
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const [createMode, setCreateMode] = useState(null)

  const fail = useCallback((message) => {
    onSetError(message)
  }, [onSetError])

  const loadServices = useCallback(async () => {
    if (!token) return
    try {
      const data = await adminApi.searchServices({ type: 'ACCOUNT_STOCK', limit: 200 }, token)
      const items = Array.isArray(data) ? data : data?.content || data?.items || []
      const accountServices = items.filter((item) => item.type === 'ACCOUNT_STOCK')
      setServices(accountServices)
      setServiceId((current) => current || String(accountServices[0]?.id || ''))
    } catch (err) {
      fail(err.message || t('admin.accountInventory.loadServicesError'))
    }
  }, [fail, token])

  const loadCredentials = useCallback(async (page) => {
    if (!token || !serviceId) {
      setCredentials([])
      return
    }
    const targetPage = typeof page === 'number' ? page : currentPage
    setLoading(true)
    try {
      const data = await adminApi.getServiceCredentials(serviceId, token, {
        query: query.trim() || undefined,
        status: status || undefined,
        page: targetPage,
        limit: 50,
      })
      const { items, totalPages: pages } = normalizePaged(data, 50)
      setCredentials(items)
      setTotalPages(pages)
      setCurrentPage(targetPage)
    } catch (err) {
      fail(err.message || t('admin.accountInventory.loadInventoryError'))
    } finally {
      setLoading(false)
    }
  }, [currentPage, fail, query, serviceId, status, token])

  useEffect(() => {
    const timer = window.setTimeout(loadServices, 0)
    return () => window.clearTimeout(timer)
  }, [loadServices])
  useEffect(() => {
    setCurrentPage(0)
  }, [query, status, serviceId])

  useEffect(() => {
    const timer = window.setTimeout(() => loadCredentials(), 250)
    return () => window.clearTimeout(timer)
  }, [loadCredentials])

  const stats = useMemo(() => ({
    available: credentials.filter((item) => item.status === 'AVAILABLE').length,
    delivered: credentials.filter((item) => item.status === 'DELIVERED').length,
    total: credentials.length,
  }), [credentials])

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const resetForm = () => { setForm(emptyForm); setEditingId(null); setCreateMode(null) }

  const saveCredential = async (event) => {
    event.preventDefault()
    if (!serviceId || !form.loginIdentifier.trim() || (!editingId && !form.passwordSecret.trim())) return
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        expiresAt: toInstant(form.expiresAt),
        internalNote: form.internalNote || null,
        passwordSecret: form.passwordSecret || null,
        recoveryInfo: form.recoveryInfo || null,
        twoFactorSecret: form.twoFactorSecret || null,
        usageNote: form.usageNote || null,
        warrantyUntil: toInstant(form.warrantyUntil),
      }
      if (editingId) await adminApi.updateServiceCredential(editingId, payload, token)
      else await adminApi.createServiceCredential(serviceId, payload, token)
      onSetNotice(editingId ? t('admin.accountInventory.saveSuccess') : t('admin.accountInventory.createSuccess'))
      resetForm()
      await loadCredentials()
    } catch (err) {
      fail(err.message || t('admin.accountInventory.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

  const editCredential = (item) => {
    setEditingId(item.id)
    setCreateMode('single')
    setForm({
      expiresAt: toInputDate(item.expiresAt), internalNote: item.internalNote || '',
      loginIdentifier: item.loginIdentifier || '', passwordSecret: '',
      recoveryInfo: item.recoveryInfo || '', twoFactorSecret: item.twoFactorSecret || '',
      usageNote: item.usageNote || '', warrantyUntil: toInputDate(item.warrantyUntil),
    })
  }

  const disableCredential = async (item) => {
    if (!window.confirm(t('admin.accountInventory.lockConfirm', { identifier: item.loginIdentifier }))) return
    try {
      await adminApi.disableServiceCredential(item.id, token)
      onSetNotice(t('admin.accountInventory.lockSuccess'))
      await loadCredentials()
    } catch (err) {
      fail(err.message || t('admin.accountInventory.lockError'))
    }
  }

  const revealCredential = async (item) => {
    try {
      const data = await adminApi.revealServiceCredential(item.id, token)
      setRevealed((current) => ({ ...current, [item.id]: data }))
    } catch (err) {
      fail(err.message || t('admin.accountInventory.revealError'))
    }
  }

  const importCsv = async () => {
    if (!serviceId || !csv.trim()) return
    setSubmitting(true)
    try {
      const result = await adminApi.bulkImportServiceCredentials(serviceId, { csvContent: csv, skipDuplicates: true }, token)
      onSetNotice(t('admin.accountInventory.importSuccess', { created: result.created, skipped: result.skipped }))
      setCsv('')
      setCreateMode(null)
      await loadCredentials()
    } catch (err) {
      fail(err.message || t('admin.accountInventory.importError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-view account-inventory-view">
      <div className="admin-toolbar">
        <div><h2>{t('admin.accountInventory.title')}</h2></div>
        <div className="admin-toolbar-actions inventory-toolbar-actions">
          <button type="button" className="admin-icon-button" onClick={loadCredentials}><RefreshCw size={18} /> {t('admin.accountInventory.reload')}</button>
          <div className="admin-create-dropdown-container">
            <button type="button" className="admin-primary-button" onClick={() => setCreateMenuOpen((current) => !current)}>
              <Plus size={18} /> {t('admin.accountInventory.createNew')}
            </button>
            {createMenuOpen && (
              <div className="admin-dropdown-menu">
                <button type="button" onClick={() => { resetForm(); setCreateMode('single'); setCreateMenuOpen(false) }}>
                  {t('admin.accountInventory.form.singleEntry')}
                </button>
                <button type="button" onClick={() => { resetForm(); setCreateMode('import'); setCreateMenuOpen(false) }}>
                  {t('admin.accountInventory.form.importCsv')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="admin-metrics">
        <article className="admin-metric"><span>{t('admin.accountInventory.metrics.totalInService')}</span><strong>{stats.total}</strong></article>
        <article className="admin-metric"><span>{t('admin.accountInventory.metrics.readyToAssign')}</span><strong>{stats.available}</strong></article>
        <article className="admin-metric"><span>{t('admin.accountInventory.metrics.delivered')}</span><strong>{stats.delivered}</strong></article>
      </div>

      <section className="admin-panel inventory-service-picker">
        <label><span>{t('admin.accountInventory.form.selectService')}</span><select value={serviceId} onChange={(event) => { setServiceId(event.target.value); resetForm() }}><option value="">{t('admin.accountInventory.form.selectService')}</option>{services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <SearchField value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('admin.accountInventory.form.searchPlaceholder')} />
        <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">{t('admin.accountInventory.form.allStatus')}</option>{statusKeys.map((value) => <option key={value} value={value}>{getStatusLabel(value)}</option>)}</select>
      </section>

      {!services.length ? <AdminEmptyState message={t('admin.accountInventory.form.noServiceYet')} hint={t('admin.accountInventory.form.noServiceHint')} /> : (
        <div className="inventory-layout list-only">
          <section className="admin-panel inventory-list-panel">
            <div className="admin-panel-head"><div><h3>{t('admin.accountInventory.form.listTitle')}</h3><span>{t('admin.accountInventory.form.resultsCount', { count: credentials.length })}</span></div><PackageOpen size={20} /></div>
            {loading ? <Loading /> : credentials.length === 0 ? <AdminEmptyState message={t('admin.accountInventory.form.noAccounts')} /> : (
              <>
                <div className="inventory-list">
                  {credentials.map((item) => {
                    const visible = revealed[item.id] || item
                    return (
                      <article key={item.id}>
                        <div><strong>{item.loginIdentifier}</strong><span>{getStatusLabel(item.status) || item.status} · {t('admin.accountInventory.form.addedOn', { date: formatAdminDate(item.createdAt) })}</span>{visible.passwordSecret && <code>{t('admin.accountInventory.form.passwordLabel')}: {visible.passwordSecret}</code>}</div>
                        <div className="inventory-actions"><button type="button" onClick={() => revealCredential(item)}><Eye size={15} /> {t('admin.accountInventory.form.view')}</button>{item.status === 'AVAILABLE' && <><button type="button" onClick={() => editCredential(item)}><Pencil size={15} /> {t('admin.accountInventory.form.edit')}</button><button type="button" className="danger" onClick={() => disableCredential(item)}><ShieldOff size={15} /> {t('admin.accountInventory.form.lock')}</button></>}</div>
                      </article>
                    )
                  })}
                </div>
                <Pagination
                  currentPage={currentPage + 1}
                  totalPages={totalPages}
                  onPageChange={(page) => loadCredentials(page - 1)}
                />
              </>
            )}
          </section>
        </div>
      )}

      <Modal isOpen={Boolean(createMode)} onClose={resetForm} showHeader={false} maxWidth="600px">
        <section className="admin-panel inventory-form-panel" style={{ border: 'none', background: 'transparent', padding: 0, boxShadow: 'none' }}>
          <div className="admin-panel-head">
            <div>
              <h3>{createMode === 'import' ? t('admin.accountInventory.form.modalTitleImport') : editingId ? t('admin.accountInventory.form.modalTitleEdit') : t('admin.accountInventory.form.modalTitleCreate')}</h3>
              <span>{t('admin.accountInventory.form.modalSubtitle')}</span>
            </div>
            <button type="button" onClick={resetForm}><X size={16} /> {t('admin.accountInventory.form.close')}</button>
          </div>
          {createMode === 'single' && <form className="admin-form inventory-form" onSubmit={saveCredential}>
            <label><span>{t('admin.accountInventory.form.loginLabel')}</span><input value={form.loginIdentifier} onChange={(e) => updateForm('loginIdentifier', e.target.value)} required /></label>
            <label><span>{t('admin.accountInventory.form.passwordField')}</span><input value={form.passwordSecret} onChange={(e) => updateForm('passwordSecret', e.target.value)} placeholder={editingId ? t('admin.accountInventory.form.passwordPlaceholder') : ''} required={!editingId} /></label>
            <label><span>{t('admin.accountInventory.form.recoveryInfo')}</span><input value={form.recoveryInfo} onChange={(e) => updateForm('recoveryInfo', e.target.value)} /></label>
            <label><span>{t('admin.accountInventory.form.twoFASecret')}</span><input value={form.twoFactorSecret} onChange={(e) => updateForm('twoFactorSecret', e.target.value)} /></label>
            <label><span>{t('admin.accountInventory.form.expiresAt')}</span><input type="datetime-local" value={form.expiresAt} onChange={(e) => updateForm('expiresAt', e.target.value)} /></label>
            <label><span>{t('admin.accountInventory.form.warrantyUntil')}</span><input type="datetime-local" value={form.warrantyUntil} onChange={(e) => updateForm('warrantyUntil', e.target.value)} /></label>
            <label className="wide"><span>{t('admin.accountInventory.form.usageNote')}</span><textarea rows="2" value={form.usageNote} onChange={(e) => updateForm('usageNote', e.target.value)} /></label>
            <label className="wide"><span>{t('admin.accountInventory.form.internalNote')}</span><textarea rows="2" value={form.internalNote} onChange={(e) => updateForm('internalNote', e.target.value)} /></label>
            <button type="submit" disabled={submitting || !serviceId}><Plus size={16} /> {editingId ? t('admin.accountInventory.form.save') : t('admin.accountInventory.form.addToInventory')}</button>
          </form>}
          {createMode === 'import' && <div className="inventory-import standalone">
            <h3><FileUp size={17} /> {t('admin.accountInventory.form.importCsv')}</h3>
            <p>{t('admin.accountInventory.form.csvFormat')}</p>
            <textarea rows="5" value={csv} onChange={(e) => setCsv(e.target.value)} placeholder={t('admin.accountInventory.form.csvPlaceholder')} />
            <button type="button" className="admin-icon-button" disabled={submitting || !csv.trim() || !serviceId} onClick={importCsv}><FileUp size={16} /> {t('admin.accountInventory.form.csvImportBtn')}</button>
          </div>}
        </section>
      </Modal>
    </div>
  )
}

export default AdminAccountInventoryView
