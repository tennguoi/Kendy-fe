import { MessageSquare, RefreshCw, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { adminApi } from '../../api/admin.api'
import { AdminEmptyState, AdminStatusBadge } from './AdminShared'
import { formatAdminDate, includesKeyword } from './adminFormat'

const ticketStatuses = ['', 'OPEN', 'PENDING_ADMIN', 'PENDING_USER', 'RESOLVED', 'CLOSED']
const ticketPriorities = ['', 'LOW', 'NORMAL', 'HIGH', 'URGENT']

function AdminTicketsView({
  error,
  loading,
  onReload,
  onSetError,
  onSetNotice,
  tickets,
  token,
}) {
  const [message, setMessage] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [query, setQuery] = useState('')
  const [selectedCode, setSelectedCode] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedTicket = tickets.find((ticket) => ticket.ticketCode === selectedCode) || tickets[0]

  const visibleTickets = useMemo(
    () =>
      tickets
        .filter((ticket) => !statusFilter || ticket.status === statusFilter)
        .filter((ticket) => !priorityFilter || ticket.priority === priorityFilter)
        .filter((ticket) => includesKeyword(ticket, query, ['ticketCode', 'subject', 'category', 'status', 'userId']))
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)),
    [priorityFilter, query, statusFilter, tickets],
  )

  const submitMessage = async (event) => {
    event.preventDefault()
    if (!selectedTicket || !message.trim()) {
      return
    }

    setSubmitting(true)
    onSetError('')
    try {
      await adminApi.sendTicketMessage(selectedTicket.ticketCode, { message: message.trim() }, token)
      setMessage('')
      await onReload()
      onSetNotice(`Đã phản hồi ticket ${selectedTicket.ticketCode}.`)
    } catch (err) {
      onSetError(err.message || 'Không gửi được phản hồi ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  const updateTicket = async (status) => {
    if (!selectedTicket) {
      return
    }

    setSubmitting(true)
    onSetError('')
    try {
      await adminApi.updateTicket(selectedTicket.ticketCode, { status, priority: selectedTicket.priority }, token)
      await onReload()
      onSetNotice(`Đã cập nhật ticket ${selectedTicket.ticketCode}.`)
    } catch (err) {
      onSetError(err.message || 'Không cập nhật được ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">Tickets</span>
          <h2>Quản lý hỗ trợ</h2>
        </div>
        <button type="button" className="admin-icon-button" onClick={onReload} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {(error || loading) && <p className={error ? 'admin-message error' : 'admin-message'}>{error || 'Đang tải ticket...'}</p>}

      <div className="admin-filters support-filters">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm ticket, user, chủ đề" type="search" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          {ticketStatuses.map((status) => (
            <option value={status} key={status || 'all'}>{status || 'Tất cả trạng thái'}</option>
          ))}
        </select>
        <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
          {ticketPriorities.map((priority) => (
            <option value={priority} key={priority || 'all'}>{priority || 'Tất cả ưu tiên'}</option>
          ))}
        </select>
      </div>

      <div className="admin-grid detail-layout">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Danh sách ticket</h3>
            <span>{visibleTickets.length} ticket</span>
          </div>
          <div className="admin-ticket-list">
            {visibleTickets.map((ticket) => (
              <button
                type="button"
                className={selectedTicket?.ticketCode === ticket.ticketCode ? 'selected' : ''}
                key={ticket.ticketCode}
                onClick={() => setSelectedCode(ticket.ticketCode)}
              >
                <span>
                  <strong>{ticket.subject}</strong>
                  <small>{ticket.ticketCode} · User #{ticket.userId}</small>
                </span>
                <span className="admin-ticket-meta">
                  <AdminStatusBadge status={ticket.status} />
                  <small>{ticket.priority}</small>
                </span>
              </button>
            ))}
            {visibleTickets.length === 0 && <AdminEmptyState />}
          </div>
        </div>

        <aside className="admin-panel admin-detail-panel">
          <div className="admin-panel-head">
            <h3>{selectedTicket ? selectedTicket.ticketCode : 'Chọn ticket'}</h3>
            {selectedTicket && <AdminStatusBadge status={selectedTicket.status} />}
          </div>

          {selectedTicket ? (
            <>
              <dl className="admin-detail-list">
                <div><dt>Chủ đề</dt><dd>{selectedTicket.subject}</dd></div>
                <div><dt>User</dt><dd>#{selectedTicket.userId}</dd></div>
                <div><dt>Danh mục</dt><dd>{selectedTicket.category}</dd></div>
                <div><dt>Ưu tiên</dt><dd>{selectedTicket.priority}</dd></div>
                <div><dt>Đơn liên quan</dt><dd>{selectedTicket.orderId ? `#${selectedTicket.orderId}` : 'Không có'}</dd></div>
                <div><dt>Cập nhật</dt><dd>{formatAdminDate(selectedTicket.updatedAt)}</dd></div>
              </dl>

              <div className="admin-action-row">
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => updateTicket('PENDING_USER')}>
                  Chờ khách phản hồi
                </button>
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => updateTicket('RESOLVED')}>
                  Đánh dấu xử lý xong
                </button>
              </div>

              <div className="admin-conversation">
                {(selectedTicket.messages || []).map((item) => (
                  <article className={`admin-message-bubble ${String(item.senderRole || '').toLowerCase()}`} key={item.id}>
                    <span><MessageSquare size={14} strokeWidth={2} aria-hidden="true" /> {item.senderRole}</span>
                    <p>{item.message}</p>
                    <small>{formatAdminDate(item.createdAt)}</small>
                  </article>
                ))}
                {(selectedTicket.messages || []).length === 0 && <AdminEmptyState message="Ticket chưa có hội thoại." />}
              </div>

              <form className="admin-form compact" onSubmit={submitMessage}>
                <label>
                  <span>Phản hồi khách</span>
                  <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows="4" required />
                </label>
                <button type="submit" disabled={submitting}>
                  <Send size={17} strokeWidth={2} aria-hidden="true" />
                  <span>Gửi phản hồi</span>
                </button>
              </form>
            </>
          ) : (
            <AdminEmptyState message="Chọn một ticket để xem chi tiết." />
          )}
        </aside>
      </div>
    </section>
  )
}

export default AdminTicketsView
