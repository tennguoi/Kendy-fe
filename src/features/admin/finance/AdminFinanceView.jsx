import { Ban, CreditCard, DollarSign, Download, RefreshCw, RotateCcw, Save, ShieldAlert, Wallet } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import AdminDrawer from '../AdminDrawer'
import { formatAdminMoney } from '../adminFormat'
import BankDetailPanel from './components/BankDetailPanel'
import BankPanel from './components/BankPanel'
import DepositDetailPanel from './components/DepositDetailPanel'
import DepositPanel from './components/DepositPanel'
import FinanceTools from './components/FinanceTools'
import WalletPanel from './components/WalletPanel'
import Loading from '../../../components/Loading/Loading'
import Modal from '../../../components/Modal/Modal'

const financeTabs = [
  { id: 'bank', label: 'Bank transactions' },
  { id: 'deposits', label: 'Yêu cầu nạp' },
  { id: 'wallet', label: 'Ví tiền' },
]

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
  const [activeTab, setActiveTab] = useState('bank')
  const [bankActionForm, setBankActionForm] = useState({ depositCode: '', reason: '', userId: '' })
  const [bankBulkForm, setBankBulkForm] = useState({ depositCode: '', ids: '', reason: '', userId: '' })
  const [bankStatus, setBankStatus] = useState('')
  const [bankTransactions, setBankTransactions] = useState([])
  const [bankDrawerOpen, setBankDrawerOpen] = useState(false)
  const [balanceIssues, setBalanceIssues] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [depositActionForm, setDepositActionForm] = useState({ minutes: '60', reason: '' })
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
  const [walletTransactions, setWalletTransactions] = useState([])
  const [walletType, setWalletType] = useState('')

  const selectedBank = bankTransactions.find((item) => item.id === selectedBankId) || bankTransactions[0]
  const selectedDeposit = deposits.find((item) => item.depositCode === selectedDepositCode) || deposits[0]

  const financeMetrics = [
    { label: 'Tiền nạp hoàn tất', value: formatAdminMoney(dashboard?.completedDepositAmount), icon: CreditCard, accent: 'accent-emerald' },
    { label: 'Doanh thu hôm nay', value: formatAdminMoney(dashboard?.todayRevenue), icon: DollarSign, accent: 'accent-emerald' },
    { label: 'Ví đang giữ', value: formatAdminMoney(revenue?.walletLiability || dashboard?.totalWalletBalance), icon: Wallet, accent: '' },
    { label: 'Bank chưa khớp', value: String(dashboard?.unmatchedBankCount ?? 0), icon: ShieldAlert, accent: 'accent-amber' },
  ]

  const setViewError = useCallback((message) => {
    setError(message)
    onSetError(message)
  }, [onSetError])

  const loadFinance = useCallback(async () => {
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
        const data = await adminApi.searchBankTransactions({ query: query.trim(), status: bankStatus }, token)
        setBankTransactions(data)
        setSelectedBankId((current) => (current && data.some((item) => item.id === current) ? current : data[0]?.id || null))
      } else if (activeTab === 'deposits') {
        const data = await adminApi.searchDeposits({ query: query.trim(), status: depositStatus }, token)
        setDeposits(data)
        setSelectedDepositCode((current) => (current && data.some((item) => item.depositCode === current) ? current : data[0]?.depositCode || null))
      } else {
        const data = await adminApi.searchWalletTransactions({ query: query.trim(), type: walletType }, token)
        setWalletTransactions(data)
      }
    } catch (err) {
      setViewError(err.message || 'Không tải được dữ liệu tài chính.')
    } finally {
      setLoading(false)
    }
  }, [activeTab, bankStatus, depositStatus, query, setViewError, token, walletType])

  useEffect(() => {
    const timer = window.setTimeout(loadFinance, 250)
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
      setViewError('Chọn bank transaction và nhập lý do xử lý.')
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
      onSetNotice(`Đã xử lý bank transaction #${saved.id}.`)
    } catch (err) {
      setViewError(err.message || 'Không xử lý được bank transaction.')
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
      setViewError('Nhập danh sách bank transaction ID, user ID và lý do bulk manual credit.')
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
      onSetNotice(`Đã manual credit ${saved.length} bank transaction.`)
    } catch (err) {
      setViewError(err.message || 'Không bulk manual credit được bank transaction.')
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
      onSetNotice(`Đã tải ${data.length} bank transaction.`)
    } catch (err) {
      setViewError(err.message || 'Không tải được bank queue.')
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
      onSetNotice(`Đã tải ${data.length} yêu cầu nạp.`)
    } catch (err) {
      setViewError(err.message || 'Không tải được deposit queue.')
    } finally {
      setSubmitting(false)
    }
  }

  const runDepositAction = async (action) => {
    if (!selectedDeposit || !depositActionForm.reason.trim()) {
      setViewError('Chọn yêu cầu nạp và nhập lý do xử lý.')
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
      onSetNotice(`Đã xử lý yêu cầu nạp ${saved.depositCode}.`)
    } catch (err) {
      setViewError(err.message || 'Không xử lý được yêu cầu nạp.')
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
      onSetNotice(`Balance check hoàn tất: ${data.length} vấn đề.`)
    } catch (err) {
      setViewError(err.message || 'Không chạy được balance check.')
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
      onSetNotice(`Reconciliation hoàn tất: ${data.length} vấn đề.`)
    } catch (err) {
      setViewError(err.message || 'Không chạy được reconciliation.')
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
      onSetNotice(`Đã tải báo cáo balance integrity: ${data.length} vấn đề.`)
    } catch (err) {
      setViewError(err.message || 'Không tải được báo cáo balance integrity.')
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
      onSetNotice(`Đã export ${type}.${format}.`)
    } catch (err) {
      setViewError(err.message || 'Không export được báo cáo.')
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
            <h2>Quản lý tài chính</h2>
          </div>
        </div>
        <button type="button" className={`admin-icon-button ${loading ? 'loading' : ''}`} onClick={loadFinance} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {error && <p className="admin-message error">{error}</p>}
      {!error && loading && <Loading fullScreen={false} message="Đang tải tài chính..." subMessage="" />}

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
          <h3>Báo cáo doanh thu</h3>
          <span>Lãi tạm tính {formatAdminMoney(revenue?.profit)}</span>
        </div>
        <div className="admin-report-grid">
          <div><span>Deposit volume</span><strong>{formatAdminMoney(revenue?.depositVolume)}</strong></div>
          <div><span>Gross revenue</span><strong>{formatAdminMoney(revenue?.grossRevenue)}</strong></div>
          <div><span>Refund</span><strong>{formatAdminMoney(revenue?.totalRefunds)}</strong></div>
          <div><span>Net revenue</span><strong>{formatAdminMoney(revenue?.netRevenue)}</strong></div>
        </div>
        <div className="admin-action-row">
          <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => loadBankQueue('manual')}>Bank manual review</button>
          <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => loadBankQueue('duplicate')}>Bank duplicate</button>
          <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => loadDepositQueue('manual')}>Nạp manual review</button>
          <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => loadDepositQueue('expired')}>Nạp hết hạn</button>
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
          <h3>Đối soát và lịch sử ví</h3>
          <div className="admin-tabs">
            {financeTabs.map((tab) => (
              <button type="button" className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-filters single-filter">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm nội dung, mã giao dịch, user id" type="search" />
        </div>

        {activeTab === 'bank' && (
          <BankPanel
            bankStatus={bankStatus}
            bankStatuses={bankStatuses}
            bankTransactions={bankTransactions}
            selectedBank={selectedBank}
            setBankStatus={setBankStatus}
            setSelectedBankId={selectBank}
          />
        )}

        {activeTab === 'deposits' && (
          <DepositPanel
            depositStatus={depositStatus}
            depositStatuses={depositStatuses}
            deposits={deposits}
            selectedDeposit={selectedDeposit}
            setDepositStatus={setDepositStatus}
            setSelectedDepositCode={selectDeposit}
          />
        )}

        {activeTab === 'wallet' && (
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
        )}
      </div>

      <AdminDrawer
        isOpen={bankDrawerOpen && activeTab === 'bank' && Boolean(selectedBank)}
        onClose={() => setBankDrawerOpen(false)}
        title={selectedBank ? `Bank #${selectedBank.id}` : 'Chi tiết bank'}
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
        title={selectedDeposit?.depositCode || 'Chi tiết nạp'}
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
                  <span>Match</span>
                </button>
                <button type="button" className="admin-icon-button finance-modal-action" disabled={submitting || !bankActionForm.userId} onClick={() => runBankAction('manual-credit')}>
                  <Save size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Credit</span>
                </button>
                <button type="button" className="admin-icon-button finance-modal-action" disabled={submitting} onClick={() => runBankAction('reprocess')}>
                  <RotateCcw size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Reprocess</span>
                </button>
                <button type="button" className="admin-danger-button finance-modal-action" disabled={submitting} onClick={() => runBankAction('ignore')}>
                  <Ban size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Ignore</span>
                </button>
                <button type="button" className="admin-primary-button finance-modal-action" disabled={submitting} onClick={() => runBulkBankCredit()}>
                  <Save size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Bulk</span>
                </button>
              </>
            )}
            {activeToolTab === 'deposits' && (
              <>
                <button type="button" className="admin-icon-button finance-modal-action" disabled={submitting} onClick={() => runDepositAction('extend')}>Gia hạn</button>
                <button type="button" className="admin-icon-button finance-modal-action" disabled={submitting} onClick={() => runDepositAction('manual-credit')}>
                  <Save size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Credit</span>
                </button>
                <button type="button" className="admin-danger-button finance-modal-action" disabled={submitting} onClick={() => runDepositAction('cancel')}>
                  <Ban size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Hủy</span>
                </button>
              </>
            )}
            {activeToolTab === 'wallet' && (
              <>
                <button type="button" className="admin-icon-button finance-modal-action" disabled={submitting} onClick={runBalanceCheck}>Check</button>
                <button type="button" className="admin-icon-button finance-modal-action" disabled={submitting} onClick={runReconciliation}>Preview</button>
                <button type="button" className="admin-primary-button finance-modal-action" disabled={submitting} onClick={loadBalanceIntegrityReport}>Report</button>
              </>
            )}
          </div>
        )}
        isOpen={toolsOpen}
        maxWidth="760px"
        onClose={() => setToolsOpen(false)}
        title="Công cụ tài chính"
      >
        <FinanceTools
          activeToolTab={activeToolTab}
          bankActionForm={bankActionForm}
          bankBulkForm={bankBulkForm}
          depositActionForm={depositActionForm}
          loadBalanceIntegrityReport={loadBalanceIntegrityReport}
          onActiveToolTabChange={setActiveToolTab}
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
