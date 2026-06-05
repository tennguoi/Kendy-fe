import { MessageSquare, Paperclip, RefreshCw, Send, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../api/admin.api'
import { AdminEmptyState, AdminStatusBadge } from './AdminShared'
import { formatAdminDate } from './adminFormat'

const ticketStatuses = ['', 'OPEN', 'PENDING_ADMIN', 'PENDING_USER', 'RESOLVED', 'CLOSED']
const ticketPriorities = ['', 'LOW', 'NORMAL', 'HIGH', 'URGENT']
const ticketCategories = ['', 'DEPOSIT', 'ORDER', 'ACCOUNT', 'SERVICE', 'OTHER']

function AdminTicketsView({
  onSetError,
  onSetNotice,
  token,
}) {
  const [admins, setAdmins] = useState([])
  const [attachments, setAttachments] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [editor, setEditor] = useState({ assignedAdminId: '', category: '', priority: 'NORMAL', status: 'OPEN' })
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [query, setQuery] = useState('')
  const [resolution, setResolution] = useState(null)
  const [selectedCode, setSelectedCode] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [tickets, setTickets] = useState([])

  const selectedTicket = tickets.find((ticket) => ticket.ticketCode === selectedCode) || tickets[0]
  const closedTicketsText = resolution ? String(resolution.closedTickets || 0) : '--'
  const averageResolutionText = resolution ? String(Math.round(resolution.averageResolutionMinutes || 0)) : '--'

  const setViewError = useCallback((messageText) => {
    setError(messageText)
    onSetError(messageText)
  }, [onSetError])

  const patchTicket = (saved) => {
    setTickets((items) => items.map((item) => (item.ticketCode === saved.ticketCode ? saved : item)))
  }

  const loadTickets = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setViewError('')
    try {
      const [ticketData, adminData, resolutionData] = await Promise.all([
        adminApi.searchTickets({
          category: categoryFilter,
          priority: priorityFilter,
          query: query.trim(),
          status: statusFilter,
        }, token),
        adminApi.getAdmins(token),
        adminApi.getTicketResolutionTime(token),
      ])
      setTickets(ticketData)
      setAdmins(adminData)
      setResolution(resolutionData)
      setSelectedCode((current) => (current && ticketData.some((ticket) => ticket.ticketCode === current) ? current : ticketData[0]?.ticketCode || null))
    } catch (err) {
      setViewError(err.message || 'Không tải được danh sách ticket.')
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, priorityFilter, query, setViewError, statusFilter, token])

  const loadAttachments = useCallback(async (ticketCode) => {
    if (!token || !ticketCode) {
      setAttachments([])
      return
    }

    try {
      setAttachments(await adminApi.getTicketAttachments(ticketCode, token))
    } catch {
      setAttachments([])
    }
  }, [token])

  useEffect(() => {
    const timer = window.setTimeout(loadTickets, 250)
    return () => window.clearTimeout(timer)
  }, [loadTickets])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (selectedTicket) {
        setEditor({
          assignedAdminId: selectedTicket.assignedAdminId ? String(selectedTicket.assignedAdminId) : '',
          category: selectedTicket.category || '',
          priority: selectedTicket.priority || 'NORMAL',
          status: selectedTicket.status || 'OPEN',
        })
        loadAttachments(selectedTicket.ticketCode)
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadAttachments, selectedTicket])

  const submitMessage = async (event) => {
    event.preventDefault()
    if (!selectedTicket || !message.trim()) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.sendTicketMessage(selectedTicket.ticketCode, { message: message.trim() }, token)
      patchTicket(saved)
      setMessage('')
      onSetNotice(`Đã phản hồi ticket ${selectedTicket.ticketCode}.`)
    } catch (err) {
      setViewError(err.message || 'Không gửi được phản hồi ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  const updateTicketFields = async (next = {}) => {
    if (!selectedTicket) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const payload = {
        assignedAdminId: editor.assignedAdminId ? Number(editor.assignedAdminId) : null,
        priority: next.priority || editor.priority,
        status: next.status || editor.status,
      }
      let saved = await adminApi.updateTicket(selectedTicket.ticketCode, payload, token)
      if (next.category || editor.category) {
        saved = await adminApi.updateTicketCategory(selectedTicket.ticketCode, { category: next.category || editor.category }, token)
      }
      if (next.priority) {
        saved = await adminApi.updateTicketPriority(selectedTicket.ticketCode, { priority: next.priority }, token)
      }
      patchTicket(saved)
      onSetNotice(`Đã cập nhật ticket ${selectedTicket.ticketCode}.`)
    } catch (err) {
      setViewError(err.message || 'Không cập nhật được ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  const uploadAttachment = async (event) => {
    event.preventDefault()
    if (!selectedTicket || !file) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.uploadTicketAttachment(selectedTicket.ticketCode, file, token)
      setFile(null)
      await loadAttachments(selectedTicket.ticketCode)
      onSetNotice(`Đã tải attachment cho ${selectedTicket.ticketCode}.`)
    } catch (err) {
      setViewError(err.message || 'Không tải được attachment.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteAttachment = async (attachmentId) => {
    if (!selectedTicket) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.deleteTicketAttachment(selectedTicket.ticketCode, attachmentId, token)
      await loadAttachments(selectedTicket.ticketCode)
      onSetNotice(`Đã xóa attachment #${attachmentId}.`)
    } catch (err) {
      setViewError(err.message || 'Không xóa được attachment.')
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
        <button type="button" className="admin-icon-button" onClick={loadTickets} disabled={loading}>
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
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          {ticketCategories.map((category) => (
            <option value={category} key={category || 'all'}>{category || 'Tất cả danh mục'}</option>
          ))}
        </select>
      </div>

      <div className="admin-report-grid compact-report">
        <div><span>Ticket đã đóng</span><strong>{closedTicketsText}</strong></div>
        <div><span>Phút xử lý TB</span><strong>{averageResolutionText}</strong></div>
      </div>

      <div className="admin-grid detail-layout">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Danh sách ticket</h3>
            <span>{tickets.length} ticket</span>
          </div>
          <div className="admin-ticket-list">
            {tickets.map((ticket) => (
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
            {tickets.length === 0 && <AdminEmptyState />}
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
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => updateTicketFields({ status: 'PENDING_USER' })}>
                  Chờ khách phản hồi
                </button>
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => updateTicketFields({ status: 'RESOLVED' })}>
                  Đánh dấu xử lý xong
                </button>
                <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => updateTicketFields({ status: 'OPEN' })}>
                  Reopen
                </button>
                <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => updateTicketFields({ status: 'CLOSED' })}>
                  Close
                </button>
              </div>

              <form className="admin-form compact" onSubmit={(event) => { event.preventDefault(); updateTicketFields() }}>
                <div className="admin-form-grid single">
                  <label>
                    <span>Assign admin</span>
                    <select value={editor.assignedAdminId} onChange={(event) => setEditor((current) => ({ ...current, assignedAdminId: event.target.value }))}>
                      <option value="">Chưa assign</option>
                      {admins.map((admin) => <option value={admin.id} key={admin.id}>{admin.name || admin.email}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Priority</span>
                    <select value={editor.priority} onChange={(event) => setEditor((current) => ({ ...current, priority: event.target.value }))}>
                      {ticketPriorities.filter(Boolean).map((priority) => <option value={priority} key={priority}>{priority}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Category</span>
                    <select value={editor.category} onChange={(event) => setEditor((current) => ({ ...current, category: event.target.value }))}>
                      {ticketCategories.filter(Boolean).map((category) => <option value={category} key={category}>{category}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Status</span>
                    <select value={editor.status} onChange={(event) => setEditor((current) => ({ ...current, status: event.target.value }))}>
                      {ticketStatuses.filter(Boolean).map((status) => <option value={status} key={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
                <button type="submit" disabled={submitting}>Lưu phân công</button>
              </form>

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

              <form className="admin-form compact" onSubmit={uploadAttachment}>
                <div className="admin-panel-head compact-head">
                  <h3>Attachment</h3>
                  <Paperclip size={18} strokeWidth={2} aria-hidden="true" />
                </div>
                <label>
                  <span>File đính kèm</span>
                  <input onChange={(event) => setFile(event.target.files?.[0] || null)} type="file" />
                </label>
                <button type="submit" disabled={submitting || !file}>Upload</button>
              </form>

              <div className="admin-mini-list">
                {attachments.map((attachment) => (
                  <article key={attachment.id}>
                    <strong>{attachment.fileName}</strong>
                    <span>{attachment.contentType || 'file'} · {attachment.sizeBytes || 0} bytes</span>
                    <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={() => deleteAttachment(attachment.id)}>
                      <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                      <span>Xóa</span>
                    </button>
                  </article>
                ))}
              </div>
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
