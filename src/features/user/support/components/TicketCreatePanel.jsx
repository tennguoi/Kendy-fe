import { RefreshCw } from 'lucide-react'
import { supportCategories, supportPriorities } from '../support.constants'

function TicketCreatePanel({
  loading,
  onCreateTicket,
  onRefresh,
  onTicketFormChange,
  submitting,
  ticketForm,
}) {
  return (
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
            {supportCategories.map((category) => <option value={category} key={category}>{category}</option>)}
          </select>
        </label>
        <label>
          <span>Ưu tiên</span>
          <select value={ticketForm.priority} onChange={(event) => onTicketFormChange('priority', event.target.value)}>
            {supportPriorities.map((priority) => <option value={priority} key={priority}>{priority}</option>)}
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
  )
}

export default TicketCreatePanel
