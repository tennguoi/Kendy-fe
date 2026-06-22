export const catalogTabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'favorites', label: 'Đã ghim' },
  { id: 'recent', label: 'Gần đây' },
]

export const serviceTypeLabels = {
  ACCOUNT_STOCK: 'Tài khoản giao ngay',
  MANUAL: 'Dịch vụ thủ công',
}

export const serviceStatusLabels = {
  ACTIVE: 'Đang bán',
  INACTIVE: 'Ngừng bán',
  MAINTENANCE: 'Bảo trì',
  DRAFT: 'Bản nháp',
}

export const getServiceTypeLabel = (type) => serviceTypeLabels[type] || type
export const getServiceStatusLabel = (status) => serviceStatusLabels[status] || status
