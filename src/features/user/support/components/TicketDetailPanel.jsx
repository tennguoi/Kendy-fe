import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Paperclip, Send, Trash2 } from 'lucide-react'
import StatusBadge from '../../../../components/status/StatusBadge'
import { formatSupportDate } from '../supportFormat'
import { toApiUrl } from '../../../../lib/api'
import { userTicketsApi } from '../../../../api/user/tickets.api'

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
      const previewPath = userTicketsApi.getTicketAttachmentPreviewUrl(selectedTicket.ticketCode, att.id)
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
        {attachments.map((attachment) => {
          const isImage = attachment.contentType?.startsWith('image/')
          const previewUrl = previewUrls[attachment.id]
          const downloadPath = userTicketsApi.getTicketAttachmentDownloadUrl(selectedTicket.ticketCode, attachment.id)
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
                <a href={toApiUrl(downloadPath)} target="_blank" rel="noopener noreferrer" className="admin-icon-button slim" title={t('support.downloadBtn', { defaultValue: 'Tải xuống' })}>
                  <Download size={14} strokeWidth={2} aria-hidden="true" />
                </a>
                <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={() => onDeleteAttachment(selectedTicket.ticketCode, attachment.id)}>
                  <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{t('support.deleteBtn', { defaultValue: 'Xóa' })}</span>
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default TicketDetailPanel
