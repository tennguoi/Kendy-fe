import { useTranslation } from 'react-i18next'
import StatusBadge from '../../../../components/status/StatusBadge'
import { supportStatuses, getSupportCategoryLabel, getSupportPriorityLabel, supportStatusLabels } from '../support.constants'
import { formatSupportDate } from '../supportFormat'
import Pagination from '../../../../components/Pagination/Pagination'
import SearchField from '../../../../components/SearchField/SearchField'

function TicketListPanel({
  currentPage,
  onLoadTicket,
  onPageChange,
  onSearchChange,
  onStatusChange,
  query,
  selectedCode,
  statusFilter,
  tickets = [],
  totalPages,
}) {
  const { t } = useTranslation()

  return (
    <>
      <div className="admin-panel-head">
        <h2>{t('support.myTickets', { defaultValue: 'Ticket của tôi' })}</h2>
        <span>{t('support.ticketCount', { count: tickets.length, defaultValue: '{{count}} ticket' })}</span>
      </div>
      <div className="admin-filters single-filter">
        <SearchField value={query} onChange={(event) => onSearchChange(event.target.value)} placeholder={t('support.searchPlaceholder', { defaultValue: 'Tìm ticket, chủ đề, mã đơn' })} />
        <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
          {supportStatuses.map((status) => (
            <option value={status} key={status || 'all'}>
              {status ? t('status.' + status, { defaultValue: supportStatusLabels[status] }) : t('support.statusAll', { defaultValue: 'Tất cả trạng thái' })}
            </option>
          ))}
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
              <small>{ticket.ticketCode} · {t('status.' + ticket.category, { defaultValue: getSupportCategoryLabel(ticket.category) })} · {formatSupportDate(ticket.updatedAt)}</small>
            </span>
            <span className="admin-ticket-meta">
              <StatusBadge status={ticket.status} />
              <small>{t('status.' + ticket.priority, { defaultValue: getSupportPriorityLabel(ticket.priority) })}</small>
            </span>
          </button>
        ))}
        {tickets.length === 0 && <p className="admin-empty-state">{t('support.noTickets', { defaultValue: 'Chưa có ticket hỗ trợ.' })}</p>}
      </div>
      <Pagination
        currentPage={currentPage || 1}
        totalPages={totalPages || 1}
        onPageChange={onPageChange}
      />
    </>
  )
}

export default TicketListPanel
