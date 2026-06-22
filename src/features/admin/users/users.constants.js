export const userStatuses = ['', 'ACTIVE', 'LOCKED', 'PENDING_VERIFY']
export const userStatusLabels = {
  ACTIVE: 'Hoạt động',
  LOCKED: 'Đã khóa',
  PENDING_VERIFY: 'Chờ xác minh',
}

export const userRoles = ['USER', 'ADMIN', 'SUPER_ADMIN']
export const userRoleLabels = {
  USER: 'Người dùng',
  ADMIN: 'Quản trị viên',
  SUPER_ADMIN: 'Quản trị viên cấp cao',
}
export const userDetailTabs = [
  { id: 'orders', label: 'Đơn' },
  { id: 'wallet', label: 'Ví' },
  { id: 'tickets', label: 'Ticket' },
  { id: 'sessions', label: 'Session' },
  { id: 'api-keys', label: 'API Keys' },
  { id: 'audit', label: 'Audit' },
]

export const getUserStatusLabel = (status) => userStatusLabels[status] || status
export const getUserRoleLabel = (role) => userRoleLabels[role] || role

