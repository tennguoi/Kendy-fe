import { Eye, EyeOff, KeyRound, PackageOpen, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import { normalizePaged } from '../../../utils/pagination'
import Loading from '../../../components/Loading/Loading'
import { AdminEmptyState } from '../AdminShared'
import { formatAdminDate } from '../adminFormat'
import Pagination from '../../../components/Pagination/Pagination'
import SearchField from '../../../components/SearchField/SearchField'

const statusOptions = [
  ['', 'Tất cả trạng thái'],
  ['DELIVERED', 'Đã cấp'],
  ['REPLACED', 'Đã thay thế'],
  ['REFUNDED', 'Đã hoàn tiền'],
  ['EXPIRED', 'Hết hạn'],
]

const statusLabels = {
  DELIVERED: 'Đã cấp',
  REPLACED: 'Đã thay thế',
  REFUNDED: 'Đã hoàn tiền',
  EXPIRED: 'Hết hạn',
  DISABLED: 'Đã vô hiệu hóa',
}

function toInstant(value, endOfDay = false) {
  if (!value) return undefined
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00'}`)
  return date.toISOString()
}

function AdminAssignedAccountsView({ onSetError, onSetNotice, token }) {
  const [accounts, setAccounts] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ deliveredFrom: '', deliveredTo: '', query: '', status: '' })
  const [loading, setLoading] = useState(false)
  const [revealed, setRevealed] = useState({})
  const [revealingId, setRevealingId] = useState(null)

  const setViewError = useCallback((message) => {
    setError(message)
    onSetError(message)
  }, [onSetError])

  const loadAccounts = useCallback(async (page) => {
    if (!token) return
    const targetPage = page ?? currentPage
    setLoading(true)
    setViewError('')
    try {
      const data = await adminApi.getAssignedCredentials({
        deliveredFrom: toInstant(filters.deliveredFrom),
        deliveredTo: toInstant(filters.deliveredTo, true),
        page: targetPage,
        query: filters.query.trim() || undefined,
        status: filters.status || undefined,
      }, token)
      const { items, totalPages: pages } = normalizePaged(data, 50)
      setAccounts(items)
      setTotalPages(pages)
      setCurrentPage(targetPage)
    } catch (err) {
      setViewError(err.message || 'Không tải được danh sách tài khoản đã cấp.')
    } finally {
      setLoading(false)
    }
  }, [currentPage, filters, setViewError, token])

  useEffect(() => {
    setCurrentPage(0)
  }, [filters.query, filters.status, filters.deliveredFrom, filters.deliveredTo])

  useEffect(() => {
    const timer = window.setTimeout(() => loadAccounts(), 250)
    return () => window.clearTimeout(timer)
  }, [loadAccounts])

  const metrics = useMemo(() => ({
    active: accounts.filter((item) => item.status === 'DELIVERED').length,
    customers: new Set(accounts.map((item) => item.deliveredToUserId).filter(Boolean)).size,
    expired: accounts.filter((item) => item.status === 'EXPIRED' || (item.expiresAt && new Date(item.expiresAt) < new Date())).length,
    total: accounts.length,
  }), [accounts])

  const toggleReveal = async (account) => {
    if (revealed[account.id]) {
      setRevealed((current) => {
        const next = { ...current }
        delete next[account.id]
        return next
      })
      return
    }
    setRevealingId(account.id)
    setViewError('')
    try {
      const data = await adminApi.revealServiceCredential(account.id, token)
      setRevealed((current) => ({ ...current, [account.id]: data }))
      onSetNotice(`Đã hiển thị thông tin tài khoản ${account.loginIdentifier}.`)
    } catch (err) {
      setViewError(err.message || 'Không thể hiển thị thông tin đăng nhập.')
    } finally {
      setRevealingId(null)
    }
  }

  return (
    <div className="admin-view assigned-accounts-view">
      <div className="admin-toolbar">
        <div>
          <span className="assigned-eyebrow">ACCOUNT DELIVERY</span>
          <h2>Tài khoản đã cấp</h2>
          <p>Theo dõi tài khoản đã bàn giao theo khách hàng, đơn hàng và dịch vụ.</p>
        </div>
        <button type="button" className="admin-icon-button" onClick={loadAccounts} disabled={loading}>
          <RefreshCw size={17} className={loading ? 'spin' : ''} /> Tải lại
        </button>
      </div>

      {error && <p className="admin-message error">{error}</p>}

      <div className="admin-metrics">
        <article className="admin-metric"><span>Tổng đã cấp</span><strong>{metrics.total}</strong></article>
        <article className="admin-metric"><span>Đang sử dụng</span><strong>{metrics.active}</strong></article>
        <article className="admin-metric"><span>Khách hàng</span><strong>{metrics.customers}</strong></article>
        <article className="admin-metric"><span>Đã/hết hạn</span><strong>{metrics.expired}</strong></article>
      </div>

      <section className="admin-panel assigned-filters-panel">
        <div className="admin-filters assigned-filters">
          <SearchField
            className="assigned-search"
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
            placeholder="Tìm khách hàng, email, tài khoản, đơn hàng, dịch vụ..."
          />
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input type="date" title="Cấp từ ngày" value={filters.deliveredFrom} onChange={(event) => setFilters((current) => ({ ...current, deliveredFrom: event.target.value }))} />
          <input type="date" title="Cấp đến ngày" value={filters.deliveredTo} onChange={(event) => setFilters((current) => ({ ...current, deliveredTo: event.target.value }))} />
        </div>
      </section>

      <section className="admin-panel assigned-list-panel">
        <div className="admin-panel-head">
          <div>
            <h3>Danh sách tài khoản</h3>
            <span>{accounts.length} kết quả</span>
          </div>
          <PackageOpen size={20} />
        </div>

        {loading ? <Loading /> : accounts.length === 0 ? (
          <AdminEmptyState message="Chưa có tài khoản nào được cấp." hint="Tài khoản sẽ xuất hiện khi đơn hàng sản phẩm giao tài khoản hoàn tất." />
        ) : (
          <div className="assigned-table-wrap">
            <table className="assigned-table">
              <thead><tr><th>Khách hàng</th><th>Dịch vụ / tài khoản</th><th>Đơn hàng</th><th>Ngày cấp</th><th>Hết hạn</th><th>Trạng thái</th><th>Thông tin</th></tr></thead>
              <tbody>
                {accounts.map((account) => {
                  const secret = revealed[account.id]
                  return (
                    <tr key={account.id}>
                      <td>
                        <strong>{account.deliveredToName || 'Khách hàng'}</strong>
                        <small>{account.deliveredToEmail || '-'}</small>
                        {account.deliveredToPhone && <small>{account.deliveredToPhone}</small>}
                      </td>
                      <td><strong>{account.serviceName}</strong><small>{account.loginIdentifier}</small></td>
                      <td><strong>{account.assignedOrderCode || '-'}</strong><small>#{account.assignedOrderId || '-'}</small></td>
                      <td>{formatAdminDate(account.deliveredAt)}</td>
                      <td>{formatAdminDate(account.expiresAt)}</td>
                      <td><span className={`assigned-status ${String(account.status).toLowerCase()}`}>{statusLabels[account.status] || account.status}</span></td>
                      <td>
                        <button type="button" className="assigned-reveal" onClick={() => toggleReveal(account)} disabled={revealingId === account.id}>
                          {secret ? <EyeOff size={16} /> : <Eye size={16} />}
                          {secret ? 'Ẩn' : revealingId === account.id ? 'Đang tải' : 'Xem'}
                        </button>
                        {secret && (
                          <div className="assigned-secret">
                            <KeyRound size={14} />
                            <span>{secret.passwordSecret || '-'}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              </table>
            </div>
          )}
          <Pagination
            currentPage={currentPage + 1}
            totalPages={totalPages}
            onPageChange={(page) => loadAccounts(page - 1)}
          />
        </section>
      </div>
    )
  }
  
  export default AdminAssignedAccountsView
