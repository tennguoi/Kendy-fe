import { useTranslation } from 'react-i18next'
import { Paperclip, Send, Trash2 } from 'lucide-react'
import StatusBadge from '../../../../components/status/StatusBadge'
import { formatSupportDate } from '../supportFormat'

function TicketDetailPanel({
  attachments = [],
  file,
  message,
  onCloseTicket,
  onDeleteAttachment,
  onFileChange,
  onReopenTicket,
  onSendMessage,
  onSetMessage,
  onUploadAttachment,
  selectedTicket,
  submitting,
}) {
  const { t } = useTranslation()

  if (!selectedTicket) {
    return null
  }

  const getSenderLabel = (senderRole) => {
    const roleUpper = String(senderRole || '').toUpperCase()
    if (roleUpper === 'ADMIN') {
      return t('public.proof.adminRole', { defaultValue: 'Admin Hỗ trợ' })
    }
    if (roleUpper === 'USER') {
      return t('common.user', { defaultValue: 'Người dùng' })
    }
    return senderRole
  }

  return (
    <div className="admin-panel-subsection">
      <div className="admin-panel-head compact-head">
        <h3>{selectedTicket.ticketCode}</h3>
        <StatusBadge status={selectedTicket.status} />
      </div>
      <div className="admin-conversation">
        {(selectedTicket.messages || []).map((item) => (
          <article className={`admin-message-bubble ${String(item.senderRole || '').toLowerCase()}`} key={item.id}>
            <span>{getSenderLabel(item.senderRole)}</span>
            <p>{item.message}</p>
            <small>{formatSupportDate(item.createdAt)}</small>
          </article>
        ))}
        {(selectedTicket.messages || []).length === 0 && <p className="admin-empty-state">{t('support.noConversation', { defaultValue: 'Ticket chưa có hội thoại.' })}</p>}
      </div>
      <form className="admin-form compact" onSubmit={onSendMessage}>
        <label>
          <span>{t('support.replyLabel', { defaultValue: 'Phản hồi' })}</span>
          <textarea value={message} onChange={(event) => onSetMessage(event.target.value)} rows="3" required />
        </label>
        <button type="submit" disabled={submitting || !message.trim()}>
          <Send size={17} strokeWidth={2} aria-hidden="true" />
          <span>{t('support.sendReplyBtn', { defaultValue: 'Gửi phản hồi' })}</span>
        </button>
      </form>
      <div className="admin-action-row">
        <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onReopenTicket(selectedTicket.ticketCode)}>{t('support.reopenBtn', { defaultValue: 'Reopen' })}</button>
        <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => onCloseTicket(selectedTicket.ticketCode)}>{t('support.closeBtn', { defaultValue: 'Close' })}</button>
      </div>
      <form className="admin-form compact" onSubmit={onUploadAttachment}>
        <div className="admin-panel-head compact-head">
          <h3>{t('support.attachmentTitle', { defaultValue: 'Attachment' })}</h3>
          <Paperclip size={18} strokeWidth={2} aria-hidden="true" />
        </div>
        <label>
          <span>{t('support.fileLabel', { defaultValue: 'File' })}</span>
          <input onChange={(event) => onFileChange(event.target.files?.[0] || null)} type="file" />
        </label>
        <button type="submit" disabled={submitting || !file}>{t('support.uploadBtn', { defaultValue: 'Upload' })}</button>
      </form>
      <div className="admin-mini-list">
        {attachments.map((attachment) => (
          <article key={attachment.id}>
            <strong>{attachment.fileName}</strong>
            <span>{attachment.contentType || 'file'} · {attachment.sizeBytes || 0} bytes</span>
            <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={() => onDeleteAttachment(selectedTicket.ticketCode, attachment.id)}>
              <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
              <span>{t('support.deleteBtn', { defaultValue: 'Xóa' })}</span>
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}

export default TicketDetailPanel
