import { Ban, Download, RefreshCw, RotateCcw, Save } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import { AdminEmptyState, AdminStatusBadge } from '../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../adminFormat'
import Loading from '../../../components/Loading/Loading'

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

function FinanceView({
  onSetError,
  onSetNotice,
  token,
}) {
  const [activeTab, setActiveTab] = useState('bank')
  const [bankActionForm, setBankActionForm] = useState({ depositCode: '', reason: '', userId: '' })
  const [bankBulkForm, setBankBulkForm] = useState({ depositCode: '', ids: '', reason: '', userId: '' })
  const [bankStatus, setBankStatus] = useState('')
  const [bankTransactions, setBankTransactions] = useState([])
  const [balanceIssues, setBalanceIssues] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [depositActionForm, setDepositActionForm] = useState({ minutes: '60', reason: '' })
  const [depositStatus, setDepositStatus] = useState('')
  const [deposits, setDeposits] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [revenue, setRevenue] = useState(null)
  const [selectedBankId, setSelectedBankId] = useState(null)
  const [selectedDepositCode, setSelectedDepositCode] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [exportFormat, setExportFormat] = useState('xlsx')
  const [walletTransactions, setWalletTransactions] = useState([])
  const [walletType, setWalletType] = useState('')

  const selectedBank = bankTransactions.find((item) => item.id === selectedBankId) || bankTransactions[0]
  const selectedDeposit = deposits.find((item) => item.depositCode === selectedDepositCode) || deposits[0]

  const financeMetrics = [
    { label: 'Tiền nạp hoàn tất', value: formatAdminMoney(dashboard?.completedDepositAmount) },
    { label: 'Doanh thu hôm nay', value: formatAdminMoney(dashboard?.todayRevenue) },
    { label: 'Ví đang giữ', value: formatAdminMoney(revenue?.walletLiability || dashboard?.totalWalletBalance) },
    { label: 'Bank chưa khớp', value: String(dashboard?.unmatchedBankCount ?? 0) },
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
    event.preventDefault()
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

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div>
          <h2>Quản lý tài chính</h2>
        </div>
        <button type="button" className="admin-icon-button" onClick={loadFinance} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {error && <p className="admin-message error">{error}</p>}
      {!error && loading && <Loading fullScreen={false} message="Đang tải tài chính..." subMessage="" />}

      <div className="admin-metrics">
        {financeMetrics.map((metric) => (
          <article className="admin-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
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
          <div className="admin-grid detail-layout">
            <div className="admin-data-table">
              <div className="admin-filters single-filter">
                <select value={bankStatus} onChange={(event) => setBankStatus(event.target.value)}>
                  {bankStatuses.map((status) => <option value={status} key={status || 'all'}>{status || 'Tất cả bank status'}</option>)}
                </select>
              </div>
              <div className="admin-data-row head bank">
                <span>Reference</span>
                <span>Số tiền</span>
                <span>Nội dung</span>
                <span>Trạng thái</span>
                <span>Nhận lúc</span>
              </div>
              {bankTransactions.map((item) => (
                <button className={`admin-data-row bank ${selectedBank?.id === item.id ? 'selected' : ''}`} key={item.id} type="button" onClick={() => setSelectedBankId(item.id)}>
                  <span>
                    <strong>{item.referenceCode || `#${item.id}`}</strong>
                    <small>{item.bankName || item.gateway}</small>
                  </span>
                  <span>{formatAdminMoney(item.transferAmount)}</span>
                  <span>{item.content || item.code || 'Không có nội dung'}</span>
                  <span><AdminStatusBadge status={item.status} /></span>
                  <span>{formatAdminDate(item.receivedAt || item.transactionDate)}</span>
                </button>
              ))}
              {bankTransactions.length === 0 && <AdminEmptyState />}
            </div>
            <aside className="admin-detail-panel inline-detail">
              <div className="admin-panel-head">
                <h3>{selectedBank ? `Bank #${selectedBank.id}` : 'Chọn giao dịch'}</h3>
                {selectedBank && <AdminStatusBadge status={selectedBank.status} />}
              </div>
              {selectedBank ? (
                <>
                  <dl className="admin-detail-list">
                    <div><dt>User khớp</dt><dd>{selectedBank.matchedUserId ? `#${selectedBank.matchedUserId}` : 'Chưa khớp'}</dd></div>
                    <div><dt>Deposit</dt><dd>{selectedBank.matchedDepositRequestId ? `#${selectedBank.matchedDepositRequestId}` : 'Chưa có'}</dd></div>
                    <div><dt>Review</dt><dd>{selectedBank.reviewReason || 'Không có'}</dd></div>
                    <div><dt>Credit</dt><dd>{formatAdminDate(selectedBank.creditedAt)}</dd></div>
                  </dl>
                  <form className="admin-form compact" onSubmit={(event) => event.preventDefault()}>
                    <label>
                      <span>Mã nạp</span>
                      <input value={bankActionForm.depositCode} onChange={(event) => setBankActionForm((current) => ({ ...current, depositCode: event.target.value }))} />
                    </label>
                    <label>
                      <span>User ID manual credit</span>
                      <input value={bankActionForm.userId} onChange={(event) => setBankActionForm((current) => ({ ...current, userId: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" />
                    </label>
                    <label>
                      <span>Lý do</span>
                      <textarea value={bankActionForm.reason} onChange={(event) => setBankActionForm((current) => ({ ...current, reason: event.target.value }))} rows="3" required />
                    </label>
                    <div className="admin-action-row">
                      <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => runBankAction('match')}>Match</button>
                      <button type="button" className="admin-icon-button" disabled={submitting || !bankActionForm.userId} onClick={() => runBankAction('manual-credit')}>Manual credit</button>
                      <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => runBankAction('reprocess')}>
                        <RotateCcw size={16} strokeWidth={2} aria-hidden="true" />
                        <span>Reprocess</span>
                      </button>
                      <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => runBankAction('ignore')}>
                        <Ban size={16} strokeWidth={2} aria-hidden="true" />
                        <span>Ignore</span>
                      </button>
                    </div>
                  </form>
                  <form className="admin-form compact" onSubmit={runBulkBankCredit}>
                    <div className="admin-panel-head compact-head">
                      <h3>Bulk manual credit</h3>
                      <Save size={18} strokeWidth={2} aria-hidden="true" />
                    </div>
                    <label>
                      <span>Bank transaction IDs</span>
                      <textarea value={bankBulkForm.ids} onChange={(event) => setBankBulkForm((current) => ({ ...current, ids: event.target.value }))} rows="2" placeholder="VD: 101, 102, 103" />
                    </label>
                    <label>
                      <span>User ID</span>
                      <input value={bankBulkForm.userId} onChange={(event) => setBankBulkForm((current) => ({ ...current, userId: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" />
                    </label>
                    <label>
                      <span>Mã nạp</span>
                      <input value={bankBulkForm.depositCode} onChange={(event) => setBankBulkForm((current) => ({ ...current, depositCode: event.target.value }))} />
                    </label>
                    <label>
                      <span>Lý do</span>
                      <textarea value={bankBulkForm.reason} onChange={(event) => setBankBulkForm((current) => ({ ...current, reason: event.target.value }))} rows="2" />
                    </label>
                    <button type="button" className="admin-icon-button" onClick={() => setBankBulkForm((current) => ({ ...current, ids: selectedBank ? String(selectedBank.id) : current.ids }))}>
                      Dùng giao dịch đang chọn
                    </button>
                    <button type="submit" disabled={submitting}>Bulk manual credit</button>
                  </form>
                  <div className="admin-code-block">
                    <strong>Raw payload</strong>
                    <pre>{selectedBank.rawPayload || 'Không có raw payload'}</pre>
                  </div>
                </>
              ) : <AdminEmptyState />}
            </aside>
          </div>
        )}

        {activeTab === 'deposits' && (
          <div className="admin-grid detail-layout">
            <div className="admin-data-table">
              <div className="admin-filters single-filter">
                <select value={depositStatus} onChange={(event) => setDepositStatus(event.target.value)}>
                  {depositStatuses.map((status) => <option value={status} key={status || 'all'}>{status || 'Tất cả deposit status'}</option>)}
                </select>
              </div>
              <div className="admin-data-row head deposits">
                <span>Mã nạp</span>
                <span>User</span>
                <span>Số tiền</span>
                <span>Trạng thái</span>
                <span>Hết hạn</span>
              </div>
              {deposits.map((item) => (
                <button className={`admin-data-row deposits ${selectedDeposit?.id === item.id ? 'selected' : ''}`} key={item.id} type="button" onClick={() => setSelectedDepositCode(item.depositCode)}>
                  <span>
                    <strong>{item.depositCode}</strong>
                    <small>{item.transferContent}</small>
                  </span>
                  <span>#{item.userId}</span>
                  <span>{formatAdminMoney(item.amount)}</span>
                  <span><AdminStatusBadge status={item.status} /></span>
                  <span>{formatAdminDate(item.expiredAt)}</span>
                </button>
              ))}
              {deposits.length === 0 && <AdminEmptyState />}
            </div>
            <aside className="admin-detail-panel inline-detail">
              <div className="admin-panel-head">
                <h3>{selectedDeposit ? selectedDeposit.depositCode : 'Chọn yêu cầu nạp'}</h3>
                {selectedDeposit && <AdminStatusBadge status={selectedDeposit.status} />}
              </div>
              {selectedDeposit ? (
                <>
                  <dl className="admin-detail-list">
                    <div><dt>Ngân hàng</dt><dd>{selectedDeposit.bankName} · {selectedDeposit.bankAccount}</dd></div>
                    <div><dt>Chủ TK</dt><dd>{selectedDeposit.bankOwner}</dd></div>
                    <div><dt>Hoàn tất</dt><dd>{formatAdminDate(selectedDeposit.completedAt)}</dd></div>
                    <div><dt>Nội dung</dt><dd>{selectedDeposit.transferContent}</dd></div>
                  </dl>
                  <form className="admin-form compact" onSubmit={(event) => event.preventDefault()}>
                    <label>
                      <span>Số phút gia hạn</span>
                      <input value={depositActionForm.minutes} onChange={(event) => setDepositActionForm((current) => ({ ...current, minutes: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" />
                    </label>
                    <label>
                      <span>Lý do</span>
                      <textarea value={depositActionForm.reason} onChange={(event) => setDepositActionForm((current) => ({ ...current, reason: event.target.value }))} rows="3" required />
                    </label>
                    <div className="admin-action-row">
                      <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => runDepositAction('extend')}>Gia hạn</button>
                      <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => runDepositAction('manual-credit')}>
                        <Save size={16} strokeWidth={2} aria-hidden="true" />
                        <span>Manual credit</span>
                      </button>
                      <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => runDepositAction('cancel')}>
                        <Ban size={16} strokeWidth={2} aria-hidden="true" />
                        <span>Hủy nạp</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : <AdminEmptyState />}
            </aside>
          </div>
        )}

        {activeTab === 'wallet' && (
          <>
            <div className="admin-filters single-filter">
              <select value={walletType} onChange={(event) => setWalletType(event.target.value)}>
                {walletTypes.map((type) => <option value={type} key={type || 'all'}>{type || 'Tất cả loại ví'}</option>)}
              </select>
            </div>
            <div className="admin-action-row">
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={runBalanceCheck}>Balance check</button>
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={runReconciliation}>Reconciliation preview</button>
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={loadBalanceIntegrityReport}>Balance report</button>
            </div>
            <div className="admin-data-table">
              <div className="admin-data-row head wallet">
                <span>Mã GD</span>
                <span>Loại</span>
                <span>Số tiền</span>
                <span>Số dư sau</span>
                <span>Thời gian</span>
              </div>
              {walletTransactions.map((item) => (
                <div className="admin-data-row wallet" key={item.id}>
                  <span>
                    <strong>{item.transactionCode}</strong>
                    <small>{item.description || item.referenceType}</small>
                  </span>
                  <span>{item.type} · {item.direction}</span>
                  <span>{formatAdminMoney(item.amount)}</span>
                  <span>{formatAdminMoney(item.balanceAfter)}</span>
                  <span>{formatAdminDate(item.createdAt)}</span>
                </div>
              ))}
              {walletTransactions.length === 0 && <AdminEmptyState />}
            </div>
            <div className="admin-mini-list">
              {balanceIssues.map((issue) => (
                <article key={issue.userId}>
                  <strong>{issue.email || `User #${issue.userId}`}</strong>
                  <span>Lệch {formatAdminMoney(issue.difference)} · Stored {formatAdminMoney(issue.storedBalance)} · Ledger {formatAdminMoney(issue.ledgerBalance)}</span>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default FinanceView