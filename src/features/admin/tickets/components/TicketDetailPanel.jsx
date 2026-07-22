import { useEffect, useRef, useState } from 'react'
import { Download, MessageSquare, Paperclip, Send, Trash2 } from 'lucide-react'
import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate } from '../../adminFormat'
import { toApiUrl } from '../../../../lib/api'
import { adminTicketsApi } from '../../../../api/admin/tickets.api'
import { ticketCategories, ticketPriorities, ticketStatuses, getTicketCategoryLabel, getTicketPriorityLabel, ticketCategoryLabels, ticketPriorityLabels, ticketStatusLabels } from '../tickets.constants'

function TicketDetailPanel({
  admins = [],
  attachments = [],
  editor,
  file,
  message,
  onDeleteAttachment,
  onEditorChange,
  onFileChange,
  onSendMessage,
  onUpdateTicketFields,
  onUploadAttachment,
  onMessageChange,
  selectedTicket,
  submitting,
  token,
}) {
  const [previewUrls, setPreviewUrls] = useState({})
  const objectUrls = useRef({})

  useEffect(() => {
    const urls = Object.values(objectUrls.current)
    urls.forEach((url) => URL.revokeObjectURL(url))
    objectUrls.current = {}
    setPreviewUrls({})

    if (!token || !selectedTicket) return

    attachments.forEach((att) => {
      if (!att.contentType?.startsWith('image/')) return
      const previewPath = adminTicketsApi.getTicketAttachmentPreviewUrl(selectedTicket.ticketCode, att.id)
      fetch(toApiUrl(previewPath), { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (!res.ok) return null
          return res.blob()
        })
        .then((blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          objectUrls.current[att.id] = url
          setPreviewUrls((prev) => ({ ...prev, [att.id]: url }))
        })
        .catch(() => {})
    })

    return () => {
      Object.values(objectUrls.current).forEach((url) => URL.revokeObjectURL(url))
      objectUrls.current = {}
    }
  }, [attachments, selectedTicket, token])
  return (
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
            <div><dt>Danh mục</dt><dd>{getTicketCategoryLabel(selectedTicket.category)}</dd></div>
            <div><dt>Ưu tiên</dt><dd>{getTicketPriorityLabel(selectedTicket.priority)}</dd></div>
            <div><dt>Đơn liên quan</dt><dd>{selectedTicket.orderId ? `#${selectedTicket.orderId}` : 'Không có'}</dd></div>
            <div><dt>Cập nhật</dt><dd>{formatAdminDate(selectedTicket.updatedAt)}</dd></div>
          </dl>

          <div className="admin-action-row">
            <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onUpdateTicketFields({ status: 'PENDING_USER' })}>
              Chờ khách phản hồi
            </button>
            <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onUpdateTicketFields({ status: 'RESOLVED' })}>
              Đánh dấu xử lý xong
            </button>
            <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onUpdateTicketFields({ status: 'OPEN' })}>
              Reopen
            </button>
            <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => onUpdateTicketFields({ status: 'CLOSED' })}>
              Close
            </button>
          </div>

          <form className="admin-form compact" onSubmit={(event) => { event.preventDefault(); onUpdateTicketFields() }}>
            <div className="admin-form-grid single">
              <label>
                <span>Assign admin</span>
                <select value={editor.assignedAdminId} onChange={(event) => onEditorChange((current) => ({ ...current, assignedAdminId: event.target.value }))}>
                  <option value="">Chưa assign</option>
                  {admins.map((admin) => <option value={admin.id} key={admin.id}>{admin.name || admin.email}</option>)}
                </select>
              </label>
              <label>
                <span>Priority</span>
                <select value={editor.priority} onChange={(event) => onEditorChange((current) => ({ ...current, priority: event.target.value }))}>
                  {ticketPriorities.filter(Boolean).map((priority) => <option value={priority} key={priority}>{ticketPriorityLabels[priority] || priority}</option>)}
                </select>
              </label>
              <label>
                <span>Category</span>
                <select value={editor.category} onChange={(event) => onEditorChange((current) => ({ ...current, category: event.target.value }))}>
                  {ticketCategories.filter(Boolean).map((category) => <option value={category} key={category}>{ticketCategoryLabels[category] || category}</option>)}
                </select>
              </label>
              <label>
                <span>Status</span>
                <select value={editor.status} onChange={(event) => onEditorChange((current) => ({ ...current, status: event.target.value }))}>
                  {ticketStatuses.filter(Boolean).map((status) => <option value={status} key={status}>{ticketStatusLabels[status] || status}</option>)}
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

          <form className="admin-form compact" onSubmit={onSendMessage}>
            <label>
              <span>Phản hồi khách</span>
              <textarea value={message} onChange={(event) => onMessageChange(event.target.value)} rows="4" required />
            </label>
            <button type="submit" disabled={submitting}>
              <Send size={17} strokeWidth={2} aria-hidden="true" />
              <span>Gửi phản hồi</span>
            </button>
          </form>

          <form className="admin-form compact" onSubmit={onUploadAttachment}>
            <div className="admin-panel-head compact-head">
              <h3>Attachment</h3>
              <Paperclip size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <label>
              <span>File đính kèm</span>
              <input onChange={(event) => onFileChange(event.target.files?.[0] || null)} type="file" />
            </label>
            <button type="submit" disabled={submitting || !file}>Upload</button>
          </form>

          <div className="admin-mini-list">
            {attachments.map((attachment) => {
              const isImage = attachment.contentType?.startsWith('image/')
              const previewUrl = previewUrls[attachment.id]
              const downloadPath = adminTicketsApi.getTicketAttachmentDownloadUrl(selectedTicket.ticketCode, attachment.id)
              return (
                <article key={attachment.id} className={isImage ? 'attachment-image-item' : ''}>
                  {isImage && previewUrl && (
                    <a href={toApiUrl(downloadPath)} target="_blank" rel="noopener noreferrer">
                      <img src={previewUrl} alt={attachment.fileName} className="attachment-thumb" />
                    </a>
                  )}
                  <div className="attachment-info">
                    <strong>{attachment.fileName}</strong>
                    <span>{attachment.contentType || 'file'} · {attachment.sizeBytes || 0} bytes</span>
                  </div>
                  <div className="attachment-actions">
                    <a href={toApiUrl(downloadPath)} target="_blank" rel="noopener noreferrer" className="admin-icon-button slim" title="Tải xuống">
                      <Download size={14} strokeWidth={2} aria-hidden="true" />
                    </a>
                    <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={() => onDeleteAttachment(attachment.id)}>
                      <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </>
      ) : (
        <AdminEmptyState message="Chọn một ticket để xem chi tiết." />
      )}
    </aside>
  )
}

export default TicketDetailPanel
