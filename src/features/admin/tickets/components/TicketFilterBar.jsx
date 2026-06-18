import { ticketCategories, ticketPriorities, ticketStatuses, ticketCategoryLabels, ticketPriorityLabels, ticketStatusLabels } from '../tickets.constants'
import SearchField from '../../../../components/SearchField/SearchField'

function TicketFilterBar({
  categoryFilter,
  onCategoryFilterChange,
  onPriorityFilterChange,
  onQueryChange,
  onStatusFilterChange,
  onTicketQueueChange,
  priorityFilter,
  query,
  statusFilter,
  ticketQueue,
}) {
  return (
    <div className="admin-filters support-filters">
      <select value={ticketQueue} onChange={(event) => onTicketQueueChange(event.target.value)}>
        <option value="all">Tất cả ticket</option>
        <option value="unassigned">Chưa assign</option>
        <option value="mine">Assigned to me</option>
      </select>
      <SearchField value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm ticket, user, chủ đề" />
      <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
        {ticketStatuses.map((status) => (
          <option value={status} key={status || 'all'}>{ticketStatusLabels[status] || status || 'Tất cả trạng thái'}</option>
        ))}
      </select>
      <select value={priorityFilter} onChange={(event) => onPriorityFilterChange(event.target.value)}>
        {ticketPriorities.map((priority) => (
          <option value={priority} key={priority || 'all'}>{ticketPriorityLabels[priority] || priority || 'Tất cả ưu tiên'}</option>
        ))}
      </select>
      <select value={categoryFilter} onChange={(event) => onCategoryFilterChange(event.target.value)}>
        {ticketCategories.map((category) => (
          <option value={category} key={category || 'all'}>{ticketCategoryLabels[category] || category || 'Tất cả danh mục'}</option>
        ))}
      </select>
    </div>
  )
}

export default TicketFilterBar
