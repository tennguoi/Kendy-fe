export const ticketStatuses = ['', 'OPEN', 'PENDING_ADMIN', 'PENDING_USER', 'RESOLVED', 'CLOSED']
export const ticketStatusLabels = {
  OPEN: 'Mở',
  PENDING_ADMIN: 'Chờ admin',
  PENDING_USER: 'Chờ người dùng',
  RESOLVED: 'Đã giải quyết',
  CLOSED: 'Đã đóng',
}

export const ticketPriorities = ['', 'LOW', 'NORMAL', 'HIGH', 'URGENT']
export const ticketPriorityLabels = {
  LOW: 'Thấp',
  NORMAL: 'Bình thường',
  HIGH: 'Cao',
  URGENT: 'Khẩn cấp',
}

export const ticketCategories = ['', 'DEPOSIT', 'ORDER', 'ACCOUNT', 'SERVICE', 'OTHER']
export const ticketCategoryLabels = {
  DEPOSIT: 'Nạp tiền',
  ORDER: 'Đơn hàng',
  ACCOUNT: 'Tài khoản',
  SERVICE: 'Dịch vụ',
  OTHER: 'Khác',
}

export const getTicketStatusLabel = (status) => ticketStatusLabels[status] || status
export const getTicketPriorityLabel = (priority) => ticketPriorityLabels[priority] || priority
export const getTicketCategoryLabel = (category) => ticketCategoryLabels[category] || category

