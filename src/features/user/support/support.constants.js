export const supportCategories = ['DEPOSIT', 'ORDER', 'ACCOUNT', 'SERVICE', 'OTHER']
export const supportCategoryLabels = {
  DEPOSIT: 'Nạp tiền',
  ORDER: 'Đơn hàng',
  ACCOUNT: 'Tài khoản',
  SERVICE: 'Dịch vụ',
  OTHER: 'Khác',
}

export const supportPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT']
export const supportPriorityLabels = {
  LOW: 'Thấp',
  NORMAL: 'Bình thường',
  HIGH: 'Cao',
  URGENT: 'Khẩn cấp',
}

export const supportStatuses = ['', 'OPEN', 'PENDING_ADMIN', 'PENDING_USER', 'RESOLVED', 'CLOSED']
export const supportStatusLabels = {
  OPEN: 'Mở',
  PENDING_ADMIN: 'Chờ admin',
  PENDING_USER: 'Chờ người dùng',
  RESOLVED: 'Đã giải quyết',
  CLOSED: 'Đã đóng',
}

export const getSupportCategoryLabel = (category) => supportCategoryLabels[category] || category
export const getSupportPriorityLabel = (priority) => supportPriorityLabels[priority] || priority
export const getSupportStatusLabel = (status) => supportStatusLabels[status] || status

