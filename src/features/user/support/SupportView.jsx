import { Paperclip, RefreshCw, Send, Trash2 } from 'lucide-react'
import StatusBadge from '../../../components/status/StatusBadge'

const categories = ['DEPOSIT', 'ORDER', 'ACCOUNT', 'SERVICE', 'OTHER']
const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT']
const statuses = ['', 'OPEN', 'PENDING_ADMIN', 'PENDING_USER', 'RESOLVED', 'CLOSED']

function formatDate(value) {
  if (!value) {
    return 'Chưa có'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function SupportView({
  attachments = [],
  file,
  loading,
  message,
  onCloseTicket,
  onCreateTicket,
  onDeleteAttachment,
  onFileChange,
  onLoadTicket,
  onRefresh,
  onReopenTicket,
  onSearchChange,
  onSendMessage,
  onSetMessage,
  onStatusChange,
  onTicketFormChange,
  onUploadAttachment,
  query,
  selectedTicket,
  statusFilter,
  submitting,
  ticketForm,
  tickets = [],
}) {
  const selectedCode = selectedTicket?.ticketCode || ''

  return (
    <section className="support-layout">
      <article className="ticket-form">
        <div className="admin-panel-head">
          <div>
            <span className="eyebrow">Ticket</span>
            <h2>Yêu cầu hỗ trợ</h2>
          </div>
          <button type="button" className="admin-icon-button" disabled={loading} onClick={onRefresh}>
            <RefreshCw size={17} strokeWidth={2} aria-hidden="true" />
            <span>Tải lại</span>
          </button>
        </div>

        <form className="admin-form compact" onSubmit={onCreateTicket}>
          <label>
            <span>Chủ đề</span>
            <input value={ticketForm.subject} onChange={(event) => onTicketFormChange('subject', event.target.value)} required />
          </label>
          <label>
            <span>Danh mục</span>
            <select value={ticketForm.category} onChange={(event) => onTicketFormChange('category', event.target.value)}>
              {categories.map((category) => <option value={category} key={category}>{category}</option>)}
            </select>
          </label>
          <label>
            <span>Ưu tiên</span>
            <select value={ticketForm.priority} onChange={(event) => onTicketFormChange('priority', event.target.value)}>
              {priorities.map((priority) => <option value={priority} key={priority}>{priority}</option>)}
            </select>
          </label>
          <label>
            <span>Mã đơn</span>
            <input value={ticketForm.orderCode} onChange={(event) => onTicketFormChange('orderCode', event.target.value)} />
          </label>
          <label>
            <span>Mã nạp</span>
            <input value={ticketForm.depositCode} onChange={(event) => onTicketFormChange('depositCode', event.target.value)} />
          </label>
          <label>
            <span>Nội dung</span>
            <textarea value={ticketForm.message} onChange={(event) => onTicketFormChange('message', event.target.value)} required />
          </label>
          <button className="primary-button" type="submit" disabled={submitting}>
            Gửi ticket
          </button>
        </form>
      </article>

      <article className="ticket-list">
        <div className="admin-panel-head">
          <h2>Ticket của tôi</h2>
          <span>{tickets.length} ticket</span>
        </div>
        <div className="admin-filters single-filter">
          <input value={query} onChange={(event) => onSearchChange(event.target.value)} placeholder="Tìm ticket, chủ đề, mã đơn" type="search" />
          <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
            {statuses.map((status) => <option value={status} key={status || 'all'}>{status || 'Tất cả trạng thái'}</option>)}
          </select>
        </div>
        <div className="admin-ticket-list">
          {tickets.map((ticket) => (
            <button
              className={selectedCode === ticket.ticketCode ? 'selected' : ''}
              key={ticket.ticketCode}
              type="button"
              onClick={() => onLoadTicket(ticket.ticketCode)}
            >
              <span>
                <strong>{ticket.subject}</strong>
                <small>{ticket.ticketCode} · {ticket.category} · {formatDate(ticket.updatedAt)}</small>
              </span>
              <span className="admin-ticket-meta">
                <StatusBadge status={ticket.status} />
                <small>{ticket.priority}</small>
              </span>
            </button>
          ))}
          {tickets.length === 0 && <p className="admin-empty-state">Chưa có ticket hỗ trợ.</p>}
        </div>

        {selectedTicket && (
          <div className="admin-panel-subsection">
            <div className="admin-panel-head compact-head">
              <h3>{selectedTicket.ticketCode}</h3>
              <StatusBadge status={selectedTicket.status} />
            </div>
            <div className="admin-conversation">
              {(selectedTicket.messages || []).map((item) => (
                <article className={`admin-message-bubble ${String(item.senderRole || '').toLowerCase()}`} key={item.id}>
                  <span>{item.senderRole}</span>
                  <p>{item.message}</p>
                  <small>{formatDate(item.createdAt)}</small>
                </article>
              ))}
              {(selectedTicket.messages || []).length === 0 && <p className="admin-empty-state">Ticket chưa có hội thoại.</p>}
            </div>
            <form className="admin-form compact" onSubmit={onSendMessage}>
              <label>
                <span>Phản hồi</span>
                <textarea value={message} onChange={(event) => onSetMessage(event.target.value)} rows="3" required />
              </label>
              <button type="submit" disabled={submitting || !message.trim()}>
                <Send size={17} strokeWidth={2} aria-hidden="true" />
                <span>Gửi phản hồi</span>
              </button>
            </form>
            <div className="admin-action-row">
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onReopenTicket(selectedTicket.ticketCode)}>Reopen</button>
              <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => onCloseTicket(selectedTicket.ticketCode)}>Close</button>
            </div>
            <form className="admin-form compact" onSubmit={onUploadAttachment}>
              <div className="admin-panel-head compact-head">
                <h3>Attachment</h3>
                <Paperclip size={18} strokeWidth={2} aria-hidden="true" />
              </div>
              <label>
                <span>File</span>
                <input onChange={(event) => onFileChange(event.target.files?.[0] || null)} type="file" />
              </label>
              <button type="submit" disabled={submitting || !file}>Upload</button>
            </form>
            <div className="admin-mini-list">
              {attachments.map((attachment) => (
                <article key={attachment.id}>
                  <strong>{attachment.fileName}</strong>
                  <span>{attachment.contentType || 'file'} · {attachment.sizeBytes || 0} bytes</span>
                  <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={() => onDeleteAttachment(selectedTicket.ticketCode, attachment.id)}>
                    <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                    <span>Xóa</span>
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}
      </article>
    </section>
  )
}

export default SupportView
