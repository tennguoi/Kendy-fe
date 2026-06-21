import { RefreshCw, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { userApi } from '../../../api/user.api'
import { normalizePaged } from '../../../utils/pagination'
import Pagination from '../../../components/Pagination/Pagination'
import { formatDate } from '../../../utils/date'

const WARRANTY_STATUS_LABELS = {
  OPEN: 'Mở',
  REVIEWING: 'Đang xem xét',
  APPROVED_REPLACE: 'Đã duyệt đổi',
  APPROVED_REFUND: 'Đã duyệt hoàn tiền',
  REJECTED: 'Từ chối',
  RESOLVED: 'Đã xử lý',
}


function statusClass(status) {
  return `warranty-status warranty-status-${String(status || '').toLowerCase().replaceAll('_', '-')}`
}

function normalizeWarrantyList(value) {
  if (Array.isArray(value)) {
    return value
  }
  if (!value || typeof value !== 'object') {
    return []
  }
  const keys = ['content', 'items', 'data', 'records', 'results']
  return keys.map((key) => value[key]).find(Array.isArray) || []
}

function WarrantyView({ onSetNotice, token }) {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState([])
  const [statusFilter, setStatusFilter] = useState('')

  const loadRequests = useCallback(async (page) => {
    if (!token) {
      return
    }
    const targetPage = page ?? currentPage
    setLoading(true)
    setError('')
    try {
      const data = await userApi.getWarranties(token, { page: targetPage, limit: 20 })
      const { items, totalPages: pages } = normalizePaged(data, 20)
      setRequests(items)
      setTotalPages(pages)
      setCurrentPage(targetPage)
    } catch (err) {
      setError(err.message || t('warranty.loadError', { defaultValue: 'Không tải được danh sách bảo hành.' }))
    } finally {
      setLoading(false)
    }
  }, [currentPage, token, t])

  useEffect(() => { setCurrentPage(0) }, [statusFilter])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const filteredRequests = useMemo(() => (
    statusFilter ? requests.filter((request) => request.status === statusFilter) : requests
  ), [requests, statusFilter])

  const openCount = requests.filter((request) => request.status === 'OPEN' || request.status === 'REVIEWING').length

  const handleRefresh = async () => {
    await loadRequests()
    if (onSetNotice) {
      onSetNotice(t('warranty.loadedNotice', { defaultValue: 'Đã tải lại yêu cầu bảo hành.' }))
    }
  }

  return (
    <section className="warranty-workspace">
      <div className="warranty-toolbar">
        <div>
          <h2>{t('warranty.myWarranties', { defaultValue: 'Bảo hành của tôi' })}</h2>
          <p>{t('warranty.openRequests', { count: openCount, defaultValue: '{{count}} yêu cầu đang xử lý' })}</p>
        </div>
        <button type="button" className="admin-icon-button" onClick={handleRefresh} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>{t('warranty.reload', { defaultValue: 'Tải lại' })}</span>
        </button>
      </div>

      {error && <p className="admin-message error">{error}</p>}

      <div className="warranty-filter-row">
        <ShieldCheck size={18} strokeWidth={2} aria-hidden="true" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">{t('warranty.statusAll', { defaultValue: 'Tất cả trạng thái' })}</option>
          {Object.entries(WARRANTY_STATUS_LABELS).map(([value, label]) => (
            <option value={value} key={value}>{t(`status.${value}`, { defaultValue: label })}</option>
          ))}
        </select>
        <span>{t('warranty.requestCount', { count: filteredRequests.length, defaultValue: '{{count}} yêu cầu' })}</span>
      </div>

      {loading && <p className="warranty-muted">{t('warranty.loading', { defaultValue: 'Đang tải yêu cầu bảo hành...' })}</p>}

      <div className="warranty-list">
        {filteredRequests.map((request) => (
          <article className="warranty-item" key={request.id}>
            <div className="warranty-item-head">
              <div>
                <strong>{request.orderCode}</strong>
                <span>{request.serviceName}</span>
              </div>
              <span className={statusClass(request.status)}>
                {t(`status.${request.status}`, { defaultValue: WARRANTY_STATUS_LABELS[request.status] || request.status })}
              </span>
            </div>
            <dl className="warranty-meta">
              <div><dt>{t('warranty.sentDate', { defaultValue: 'Ngày gửi' })}</dt><dd>{formatDate(request.createdAt)}</dd></div>
              <div><dt>{t('warranty.updatedDate', { defaultValue: 'Cập nhật' })}</dt><dd>{formatDate(request.updatedAt || request.resolvedAt)}</dd></div>
              {request.originalCredentialId && (
                <div><dt>{t('warranty.originalCredential', { defaultValue: 'Credential gốc' })}</dt><dd>#{request.originalCredentialId}</dd></div>
              )}
              {request.replacementCredentialId && (
                <div><dt>{t('warranty.replacementCredential', { defaultValue: 'Credential mới' })}</dt><dd>#{request.replacementCredentialId}</dd></div>
              )}
            </dl>
            <div className="warranty-copy">
              <strong>{t('warranty.reason', { defaultValue: 'Lý do' })}</strong>
              <p>{request.reason || '-'}</p>
            </div>
            {request.adminNote && (
              <div className="warranty-copy">
                <strong>{t('warranty.adminResponse', { defaultValue: 'Phản hồi admin' })}</strong>
                <p>{request.adminNote}</p>
              </div>
            )}
          </article>
        ))}
      </div>

      {filteredRequests.length > 0 && (
        <Pagination
          currentPage={currentPage + 1}
          totalPages={totalPages}
          onPageChange={(page) => loadRequests(page - 1)}
        />
      )}

      {!loading && filteredRequests.length === 0 && (
        <div className="warranty-empty">
          <ShieldCheck size={28} strokeWidth={2} aria-hidden="true" />
          <strong>{t('warranty.noWarranties', { defaultValue: 'Chưa có yêu cầu bảo hành' })}</strong>
          <span>{t('warranty.warrantyInstruction', { defaultValue: 'Yêu cầu bảo hành được tạo từ chi tiết đơn hàng đã hoàn thành.' })}</span>
        </div>
      )}
    </section>
  )
}

export default WarrantyView
