import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supportCategories, supportPriorities, supportCategoryLabels, supportPriorityLabels } from '../support.constants'

function TicketCreatePanel({
  loading,
  onCreateTicket,
  onRefresh,
  onTicketFormChange,
  submitting,
  ticketForm,
}) {
  const { t } = useTranslation()

  return (
    <article className="ticket-form">
      <div className="admin-panel-head">
        <div>
          <h2>{t('support.createTicket', { defaultValue: 'Yêu cầu hỗ trợ' })}</h2>
        </div>
        <button type="button" className="admin-icon-button" disabled={loading} onClick={onRefresh}>
          <RefreshCw size={17} strokeWidth={2} aria-hidden="true" />
          <span>{t('support.reload', { defaultValue: 'Tải lại' })}</span>
        </button>
      </div>

      <form className="admin-form compact" onSubmit={onCreateTicket}>
        <label>
          <span>{t('support.subject', { defaultValue: 'Chủ đề' })}</span>
          <input value={ticketForm.subject} onChange={(event) => onTicketFormChange('subject', event.target.value)} required />
        </label>
        <label>
          <span>{t('support.category', { defaultValue: 'Danh mục' })}</span>
          <select value={ticketForm.category} onChange={(event) => onTicketFormChange('category', event.target.value)}>
            {supportCategories.map((category) => (
              <option value={category} key={category}>
                {t('status.' + category, { defaultValue: supportCategoryLabels[category] })}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{t('support.priority', { defaultValue: 'Ưu tiên' })}</span>
          <select value={ticketForm.priority} onChange={(event) => onTicketFormChange('priority', event.target.value)}>
            {supportPriorities.map((priority) => (
              <option value={priority} key={priority}>
                {t('status.' + priority, { defaultValue: supportPriorityLabels[priority] })}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{t('support.orderCode', { defaultValue: 'Mã đơn' })}</span>
          <input value={ticketForm.orderCode} onChange={(event) => onTicketFormChange('orderCode', event.target.value)} />
        </label>
        <label>
          <span>{t('support.depositCode', { defaultValue: 'Mã nạp' })}</span>
          <input value={ticketForm.depositCode} onChange={(event) => onTicketFormChange('depositCode', event.target.value)} />
        </label>
        <label>
          <span>{t('support.content', { defaultValue: 'Nội dung' })}</span>
          <textarea value={ticketForm.message} onChange={(event) => onTicketFormChange('message', event.target.value)} required />
        </label>
        <button className="primary-button" type="submit" disabled={submitting}>
          {t('support.submitBtn', { defaultValue: 'Gửi ticket' })}
        </button>
      </form>
    </article>
  )
}

export default TicketCreatePanel
