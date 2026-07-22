import { Ban, CreditCard, DollarSign, Download, RefreshCw, RotateCcw, Save, ShieldAlert, Wallet } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../api/admin.api'
import { normalizePaged } from '../../../utils/pagination'
import AdminDrawer from '../AdminDrawer'
import Pagination from '../../../components/Pagination/Pagination'
import { formatAdminMoney } from '../adminFormat'
import BankDetailPanel from './components/BankDetailPanel'
import BankPanel from './components/BankPanel'
import DepositDetailPanel from './components/DepositDetailPanel'
import DepositPanel from './components/DepositPanel'
import FinanceTools from './components/FinanceTools'
import WalletPanel from './components/WalletPanel'
import Loading from '../../../components/Loading/Loading'
import Modal from '../../../components/Modal/Modal'
import SearchField from '../../../components/SearchField/SearchField'

const bankStatuses = ['', 'NEW', 'MATCHED', 'CREDITED', 'MANUAL_REVIEW', 'DUPLICATE', 'IGNORED']
const depositStatuses = ['', 'PENDING', 'COMPLETED', 'MANUAL_REVIEW', 'EXPIRED', 'CANCELLED']
const walletTypes = ['', 'DEPOSIT', 'PURCHASE', 'REFUND', 'ADJUSTMENT']
const reportTypes = ['revenue', 'users', 'orders', 'bank', 'tickets']

function downloadBlobFile(fileName, blob) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

function downloadTextFile(fileName, content) {
  downloadBlobFile(fileName, new Blob([content], { type: 'text/csv;charset=utf-8' }))
}

function AdminFinanceView({
  onSetError,
  onSetNotice,
  token,
}) {
  const { t } = useTranslation()
  const financeTabs = [
    { id: 'bank', label: t('admin.finance.tabs.bank') },
    { id: 'deposits', label: t('admin.finance.tabs.deposits') },
    { id: 'wallet', label: t('admin.finance.tabs.wallet') },
  ]
  const [activeTab, setActiveTab] = useState('bank')
  const [bankActionForm, setBankActionForm] = useState({ depositCode: '', reason: '', userId: '' })
  const [bankBulkForm, setBankBulkForm] = useState({ depositCode: '', ids: '', reason: '', userId: '' })
  const [bankCurrentPage, setBankCurrentPage] = useState(0)
  const [bankTotalPages, setBankTotalPages] = useState(0)
  const [bankStatus, setBankStatus] = useState('')
  const [bankTransactions, setBankTransactions] = useState([])
  const [bankDrawerOpen, setBankDrawerOpen] = useState(false)
  const [balanceIssues, setBalanceIssues] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [depositActionForm, setDepositActionForm] = useState({ minutes: '60', reason: '' })
  const [depositCurrentPage, setDepositCurrentPage] = useState(0)
  const [depositTotalPages, setDepositTotalPages] = useState(0)
  const [depositDrawerOpen, setDepositDrawerOpen] = useState(false)
  const [depositStatus, setDepositStatus] = useState('')
  const [deposits, setDeposits] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [revenue, setRevenue] = useState(null)
  const [selectedBankId, setSelectedBankId] = useState(null)
  const [selectedDepositCode, setSelectedDepositCode] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [activeToolTab, setActiveToolTab] = useState('bank')
  const [exportFormat, setExportFormat] = useState('xlsx')
  const [walletCurrentPage, setWalletCurrentPage] = useState(0)
  const [walletTotalPages, setWalletTotalPages] = useState(0)
  const [walletTransactions, setWalletTransactions] = useState([])
  const [walletType, setWalletType] = useState('')

  const selectedBank = bankTransactions.find((item) => item.id === selectedBankId) || bankTransactions[0]
  const selectedDeposit = deposits.find((item) => item.depositCode === selectedDepositCode) || deposits[0]

  const financeMetrics = [
    { label: t('admin.finance.metrics.completedDeposits'), value: formatAdminMoney(dashboard?.completedDepositAmount), icon: CreditCard, accent: 'accent-emerald' },
    { label: t('admin.finance.metrics.todayRevenue'), value: formatAdminMoney(dashboard?.todayRevenue), icon: DollarSign, accent: 'accent-emerald' },
    { label: t('admin.finance.metrics.walletLiability'), value: formatAdminMoney(revenue?.walletLiability || dashboard?.totalWalletBalance), icon: Wallet, accent: '' },
    { label: t('admin.finance.metrics.unmatchedBank'), value: String(dashboard?.unmatchedBankCount ?? 0), icon: ShieldAlert, accent: 'accent-amber' },
  ]

  const setViewError = useCallback((message) => {
    setError(message)
    onSetError(message)
  }, [onSetError])

  const loadFinance = useCallback(async (page) => {
    if (!token) {
      return
    }

    setLoading(true)
    setViewError('')
    try {
      const [dashboardData, revenueData] = await Promise.all([
        adminApi.getDashboard(token),
        adminApi.getRevenueReport(token),
      ])
      setDashboard(dashboardData)
      setRevenue(revenueData)

      if (activeTab === 'bank') {
        const targetPage = page ?? bankCurrentPage
        const data = await adminApi.searchBankTransactions({ query: query.trim(), status: bankStatus, page: targetPage }, token)
        const { items, totalPages: pages } = normalizePaged(data, 50)
        setBankTransactions(items)
        setBankTotalPages(pages)
        setBankCurrentPage(targetPage)
        setSelectedBankId((current) => (current && items.some((item) => item.id === current) ? current : items[0]?.id || null))
      } else if (activeTab === 'deposits') {
        const targetPage = page ?? depositCurrentPage
        const data = await adminApi.searchDeposits({ query: query.trim(), status: depositStatus, page: targetPage }, token)
        const { items, totalPages: pages } = normalizePaged(data, 50)
        setDeposits(items)
        setDepositTotalPages(pages)
        setDepositCurrentPage(targetPage)
        setSelectedDepositCode((current) => (current && items.some((item) => item.depositCode === current) ? current : items[0]?.depositCode || null))
      } else {
        const targetPage = page ?? walletCurrentPage
        const data = await adminApi.searchWalletTransactions({ query: query.trim(), type: walletType, page: targetPage }, token)
        const { items, totalPages: pages } = normalizePaged(data, 50)
        setWalletTransactions(items)
        setWalletTotalPages(pages)
        setWalletCurrentPage(targetPage)
      }
    } catch (err) {
      setViewError(err.message || t('admin.finance.loadError'))
    } finally {
      setLoading(false)
    }
  }, [activeTab, bankCurrentPage, bankStatus, depositCurrentPage, depositStatus, query, setViewError, token, walletCurrentPage, walletType])

  useEffect(() => {
    setBankCurrentPage(0)
    setDepositCurrentPage(0)
    setWalletCurrentPage(0)
  }, [activeTab, query, bankStatus, depositStatus, walletType])

  useEffect(() => {
    const timer = window.setTimeout(() => loadFinance(), 250)
    return () => window.clearTimeout(timer)
  }, [loadFinance])

  useEffect(() => {
    setBankDrawerOpen(false)
    setDepositDrawerOpen(false)
  }, [activeTab])

  useEffect(() => {
    if (!token || !selectedBank?.id) {
      return
    }

    let active = true
    async function loadBankDetail() {
      try {
        const detail = await adminApi.getBankTransaction(selectedBank.id, token)
        if (active) {
          setBankTransactions((items) => items.map((item) => (item.id === detail.id ? detail : item)))
        }
      } catch {
        // The search result is enough for list-level handling.
      }
    }

    loadBankDetail()
    return () => {
      active = false
    }
  }, [selectedBank?.id, token])

  useEffect(() => {
    if (!token || !selectedDeposit?.depositCode) {
      return
    }

    let active = true
    async function loadDepositDetail() {
      try {
        const detail = await adminApi.getDeposit(selectedDeposit.depositCode, token)
        if (active) {
          setDeposits((items) => items.map((item) => (item.id === detail.id ? detail : item)))
        }
      } catch {
        // The search result is enough for list-level handling.
      }
    }

    loadDepositDetail()
    return () => {
      active = false
    }
  }, [selectedDeposit?.depositCode, token])

  const patchBank = (saved) => {
    setBankTransactions((items) => items.map((item) => (item.id === saved.id ? saved : item)))
  }

  const patchDeposit = (saved) => {
    setDeposits((items) => items.map((item) => (item.id === saved.id ? saved : item)))
  }

  const runBankAction = async (action) => {
    if (!selectedBank || !bankActionForm.reason.trim()) {
      setViewError(t('admin.finance.bank.selectError'))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      let saved
      if (action === 'match') {
        saved = await adminApi.matchBankTransaction(selectedBank.id, {
          depositCode: bankActionForm.depositCode.trim(),
          reason: bankActionForm.reason.trim(),
        }, token)
      } else if (action === 'manual-credit') {
        saved = await adminApi.manualCreditBankTransaction(selectedBank.id, {
          depositCode: bankActionForm.depositCode.trim() || undefined,
          reason: bankActionForm.reason.trim(),
          userId: Number(bankActionForm.userId),
        }, token)
      } else if (action === 'reprocess') {
        saved = await adminApi.reprocessBankTransaction(selectedBank.id, {
          depositCode: bankActionForm.depositCode.trim() || undefined,
          reason: bankActionForm.reason.trim(),
        }, token)
      } else {
        saved = await adminApi.ignoreBankTransaction(selectedBank.id, { reason: bankActionForm.reason.trim() }, token)
      }
      patchBank(saved)
      await loadFinance()
      onSetNotice(t('admin.finance.bank.processSuccess', { id: saved.id }))
    } catch (err) {
      setViewError(err.message || t('admin.finance.bank.processError'))
    } finally {
      setSubmitting(false)
    }
  }

  const runBulkBankCredit = async (event) => {
    event?.preventDefault?.()
    const bankTransactionIds = bankBulkForm.ids
      .split(/[\s,]+/)
      .map((id) => Number(id))
      .filter(Boolean)

    if (bankTransactionIds.length === 0 || !bankBulkForm.userId || !bankBulkForm.reason.trim()) {
      setViewError(t('admin.finance.bank.bulkCreditRequired'))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.bulkManualCreditBankTransactions({
        bankTransactionIds,
        depositCode: bankBulkForm.depositCode.trim() || undefined,
        reason: bankBulkForm.reason.trim(),
        userId: Number(bankBulkForm.userId),
      }, token)
      saved.forEach(patchBank)
      setBankBulkForm({ depositCode: '', ids: '', reason: '', userId: '' })
      await loadFinance()
      onSetNotice(t('admin.finance.bank.bulkCreditSuccess', { count: saved.length }))
    } catch (err) {
      setViewError(err.message || t('admin.finance.bank.bulkCreditError'))
    } finally {
      setSubmitting(false)
    }
  }

  const loadBankQueue = async (queue) => {
    setSubmitting(true)
    setViewError('')
    try {
      const data = queue === 'manual'
        ? await adminApi.getManualReviewBankTransactions(token)
        : queue === 'duplicate'
          ? await adminApi.getDuplicateBankTransactions(token)
          : await adminApi.getIgnoredBankTransactions(token)
      setBankTransactions(data)
      setSelectedBankId(data[0]?.id || null)
      setActiveTab('bank')
      onSetNotice(t('admin.finance.bank.queueLoadSuccess', { count: data.length }))
    } catch (err) {
      setViewError(err.message || t('admin.finance.bank.queueLoadError'))
    } finally {
      setSubmitting(false)
    }
  }

  const loadDepositQueue = async (queue) => {
    setSubmitting(true)
    setViewError('')
    try {
      const data = queue === 'expired'
        ? await adminApi.getExpiredDeposits(token)
        : await adminApi.getManualReviewDeposits(token)
      setDeposits(data)
      setSelectedDepositCode(data[0]?.depositCode || null)
      setActiveTab('deposits')
      onSetNotice(t('admin.finance.deposit.queueLoadSuccess', { count: data.length }))
    } catch (err) {
      setViewError(err.message || t('admin.finance.deposit.queueLoadError'))
    } finally {
      setSubmitting(false)
    }
  }

  const runDepositAction = async (action) => {
    if (!selectedDeposit || !depositActionForm.reason.trim()) {
      setViewError(t('admin.finance.deposit.selectError'))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      let saved
      if (action === 'cancel') {
        saved = await adminApi.cancelDeposit(selectedDeposit.depositCode, { reason: depositActionForm.reason.trim() }, token)
      } else if (action === 'extend') {
        saved = await adminApi.extendDeposit(selectedDeposit.depositCode, {
          minutes: Number(depositActionForm.minutes) || 60,
          reason: depositActionForm.reason.trim(),
        }, token)
      } else {
        saved = await adminApi.manualCreditDeposit(selectedDeposit.depositCode, { reason: depositActionForm.reason.trim() }, token)
      }
      patchDeposit(saved)
      await loadFinance()
      onSetNotice(t('admin.finance.deposit.processSuccess', { code: saved.depositCode }))
    } catch (err) {
      setViewError(err.message || t('admin.finance.deposit.processError'))
    } finally {
      setSubmitting(false)
    }
  }

  const runBalanceCheck = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      const data = await adminApi.getBalanceCheck(token)
      setBalanceIssues(data)
      onSetNotice(t('admin.finance.wallet.balanceCheckSuccess', { count: data.length }))
    } catch (err) {
      setViewError(err.message || t('admin.finance.error.balanceCheck'))
    } finally {
      setSubmitting(false)
    }
  }

  const runReconciliation = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      const data = await adminApi.reconcileWallet(token)
      setBalanceIssues(data)
      onSetNotice(t('admin.finance.wallet.reconciliationSuccess', { count: data.length }))
    } catch (err) {
      setViewError(err.message || t('admin.finance.error.reconciliation'))
    } finally {
      setSubmitting(false)
    }
  }

  const loadBalanceIntegrityReport = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      const data = await adminApi.getBalanceIntegrityReport(token)
      setBalanceIssues(data)
      onSetNotice(t('admin.finance.report.balanceIntegritySuccess', { count: data.length }))
    } catch (err) {
      setViewError(err.message || t('admin.finance.error.balanceIntegrity'))
    } finally {
      setSubmitting(false)
    }
  }

  const exportReport = async (type, format) => {
    setSubmitting(true)
    setViewError('')
    try {
      const data = await adminApi.exportReport(type, token, format)
      if (format === 'xlsx') {
        downloadBlobFile(`${type}.xlsx`, data)
      } else {
        downloadTextFile(`${type}.csv`, data)
      }
      onSetNotice(t('admin.finance.report.exportSuccess', { type, format }))
    } catch (err) {
      setViewError(err.message || t('admin.finance.error.exportFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const openFinanceTools = (tab = activeTab) => {
    setActiveToolTab(tab)
    setToolsOpen(true)
  }

  const selectBank = (bankId) => {
    setSelectedBankId(bankId)
    setBankDrawerOpen(true)
  }

  const selectDeposit = (depositCode) => {
    setSelectedDepositCode(depositCode)
    setDepositDrawerOpen(true)
  }

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div className="admin-toolbar-info">
          <div>
            <h2>{t('admin.finance.title')}</h2>
          </div>
        </div>
        <button type="button" className={`admin-icon-button ${loading ? 'loading' : ''}`} onClick={loadFinance} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>{t('admin.finance.reload')}</span>
        </button>
      </div>

      {error && <p className="admin-message error">{error}</p>}
      {!error && loading && <Loading fullScreen={false} message={t('admin.finance.loading')} subMessage="" />}

      <div className="admin-metrics">
        {financeMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <article className={`admin-metric ${metric.accent}`} key={metric.label}>
              <div className="admin-metric-icon">
                <Icon size={22} strokeWidth={2} />
              </div>
              <div className="admin-metric-body">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            </article>
          )
        })}
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>{t('admin.finance.revenue.title')}</h3>
          <span>{t('admin.finance.revenue.profit')} {formatAdminMoney(revenue?.profit)}</span>
        </div>
        <div className="admin-report-grid">
          <div><span>{t('admin.finance.revenue.totalDeposits')}</span><strong>{formatAdminMoney(revenue?.depositVolume)}</strong></div>
          <div><span>{t('admin.finance.revenue.grossRevenue')}</span><strong>{formatAdminMoney(revenue?.grossRevenue)}</strong></div>
          <div><span>{t('admin.finance.revenue.totalRefunds')}</span><strong>{formatAdminMoney(revenue?.totalRefunds)}</strong></div>
          <div><span>{t('admin.finance.revenue.netRevenue')}</span><strong>{formatAdminMoney(revenue?.netRevenue)}</strong></div>
        </div>
        <div className="admin-action-row">
          <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => loadBankQueue('manual')}>{t('admin.finance.actions.bankManual')}</button>
          <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => loadBankQueue('duplicate')}>{t('admin.finance.actions.bankDuplicate')}</button>
          <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => loadDepositQueue('manual')}>{t('admin.finance.actions.depositManual')}</button>
          <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => loadDepositQueue('expired')}>{t('admin.finance.actions.depositExpired')}</button>
        </div>

        <div className="admin-action-row">
          <span className="admin-format-toggle">
            <button type="button" className={exportFormat === 'csv' ? 'active' : ''} onClick={() => setExportFormat('csv')}>CSV</button>
            <button type="button" className={exportFormat === 'xlsx' ? 'active' : ''} onClick={() => setExportFormat('xlsx')}>XLSX</button>
          </span>
          {reportTypes.map((type) => (
            <button type="button" className="admin-icon-button" disabled={submitting} key={type} onClick={() => exportReport(type, exportFormat)}>
              <Download size={16} strokeWidth={2} aria-hidden="true" />
              <span>Export {type}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>{t('admin.finance.report.title')}</h3>
          <div className="admin-tabs">
            {financeTabs.map((tab) => (
              <button type="button" className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-filters single-filter">
          <SearchField value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('admin.finance.report.searchPlaceholder')} />
        </div>

        {activeTab === 'bank' && (
          <>
            <BankPanel
              bankStatus={bankStatus}
              bankStatuses={bankStatuses}
              bankTransactions={bankTransactions}
              selectedBank={selectedBank}
              setBankStatus={setBankStatus}
              setSelectedBankId={selectBank}
            />
            <Pagination
              currentPage={bankCurrentPage + 1}
              totalPages={bankTotalPages}
              onPageChange={(page) => loadFinance(page - 1)}
            />
          </>
        )}

        {activeTab === 'deposits' && (
          <>
            <DepositPanel
              depositStatus={depositStatus}
              depositStatuses={depositStatuses}
              deposits={deposits}
              selectedDeposit={selectedDeposit}
              setDepositStatus={setDepositStatus}
              setSelectedDepositCode={selectDeposit}
            />
            <Pagination
              currentPage={depositCurrentPage + 1}
              totalPages={depositTotalPages}
              onPageChange={(page) => loadFinance(page - 1)}
            />
          </>
        )}

        {activeTab === 'wallet' && (
          <>
            <WalletPanel
              balanceIssues={balanceIssues}
              loadBalanceIntegrityReport={loadBalanceIntegrityReport}
              runBalanceCheck={runBalanceCheck}
              runReconciliation={runReconciliation}
              submitting={submitting}
              walletTransactions={walletTransactions}
              walletType={walletType}
              walletTypes={walletTypes}
              setWalletType={setWalletType}
              onOpenTools={() => openFinanceTools('wallet')}
            />
            <Pagination
              currentPage={walletCurrentPage + 1}
              totalPages={walletTotalPages}
              onPageChange={(page) => loadFinance(page - 1)}
            />
          </>
        )}
      </div>

      <AdminDrawer
        isOpen={bankDrawerOpen && activeTab === 'bank' && Boolean(selectedBank)}
        onClose={() => setBankDrawerOpen(false)}
        title={selectedBank ? `${t('admin.finance.bank.detailTitle')} #${selectedBank.id}` : t('admin.finance.bank.detailTitle')}
        width="560px"
      >
        <BankDetailPanel
          onOpenTools={() => openFinanceTools('bank')}
          selectedBank={selectedBank}
          submitting={submitting}
        />
      </AdminDrawer>

      <AdminDrawer
        isOpen={depositDrawerOpen && activeTab === 'deposits' && Boolean(selectedDeposit)}
        onClose={() => setDepositDrawerOpen(false)}
        title={selectedDeposit?.depositCode || t('admin.finance.deposit.detailTitle')}
        width="560px"
      >
        <DepositDetailPanel
          onOpenTools={() => openFinanceTools('deposits')}
          selectedDeposit={selectedDeposit}
          submitting={submitting}
        />
      </AdminDrawer>

      <Modal
        headerActions={(
          <div className="finance-modal-actions">
            {activeToolTab === 'bank' && (
              <>
                <button type="button" className="admin-icon-button finance-modal-action" disabled={submitting} onClick={() => runBankAction('match')}>
                  <Save size={16} strokeWidth={2} aria-hidden="true" />
                  <span>{t('admin.finance.tools.bankAction.match')}</span>
                </button>
                <button type="button" className="admin-icon-button finance-modal-action" disabled={submitting || !bankActionForm.userId} onClick={() => runBankAction('manual-credit')}>
                  <Save size={16} strokeWidth={2} aria-hidden="true" />
                  <span>{t('admin.finance.tools.bankAction.manualCredit')}</span>
                </button>
                <button type="button" className="admin-icon-button finance-modal-action" disabled={submitting} onClick={() => runBankAction('reprocess')}>
                  <RotateCcw size={16} strokeWidth={2} aria-hidden="true" />
                  <span>{t('admin.finance.tools.bankAction.reprocess')}</span>
                </button>
                <button type="button" className="admin-danger-button finance-modal-action" disabled={submitting} onClick={() => runBankAction('ignore')}>
                  <Ban size={16} strokeWidth={2} aria-hidden="true" />
                  <span>{t('admin.finance.tools.bankAction.ignore')}</span>
                </button>
              </>
            )}
            {activeToolTab === 'deposits' && (
              <>
                <button type="button" className="admin-icon-button finance-modal-action" disabled={submitting} onClick={() => runDepositAction('extend')}>{t('admin.finance.tools.depositAction.extend')}</button>
                <button type="button" className="admin-icon-button finance-modal-action" disabled={submitting} onClick={() => runDepositAction('manual-credit')}>
                  <Save size={16} strokeWidth={2} aria-hidden="true" />
                  <span>{t('admin.finance.tools.depositAction.manualCredit')}</span>
                </button>
                <button type="button" className="admin-danger-button finance-modal-action" disabled={submitting} onClick={() => runDepositAction('cancel')}>
                  <Ban size={16} strokeWidth={2} aria-hidden="true" />
                  <span>{t('admin.finance.tools.depositAction.cancel')}</span>
                </button>
              </>
            )}
            {activeToolTab === 'wallet' && (
              <>
                <button type="button" className="admin-icon-button finance-modal-action" disabled={submitting} onClick={runBalanceCheck}>{t('admin.finance.tools.walletAction.check')}</button>
                <button type="button" className="admin-icon-button finance-modal-action" disabled={submitting} onClick={runReconciliation}>{t('admin.finance.tools.walletAction.preview')}</button>
                <button type="button" className="admin-primary-button finance-modal-action" disabled={submitting} onClick={loadBalanceIntegrityReport}>{t('admin.finance.tools.walletAction.report')}</button>
              </>
            )}
          </div>
        )}
        isOpen={toolsOpen}
        maxWidth="760px"
        onClose={() => setToolsOpen(false)}
        title={t('admin.finance.tools.title')}
      >
        <FinanceTools
          activeToolTab={activeToolTab}
          bankActionForm={bankActionForm}
          bankBulkForm={bankBulkForm}
          depositActionForm={depositActionForm}
          loadBalanceIntegrityReport={loadBalanceIntegrityReport}
          onActiveToolTabChange={setActiveToolTab}
          runBulkBankCredit={runBulkBankCredit}
          runBalanceCheck={runBalanceCheck}
          runReconciliation={runReconciliation}
          selectedBank={selectedBank}
          selectedDeposit={selectedDeposit}
          setBankActionForm={setBankActionForm}
          setBankBulkForm={setBankBulkForm}
          setDepositActionForm={setDepositActionForm}
        />
      </Modal>
    </section>
  )
}

export default AdminFinanceView
