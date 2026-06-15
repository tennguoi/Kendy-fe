export const serviceTypes = ['MANUAL', 'AUTO', 'SUBSCRIPTION', 'API_CREDIT']
export const serviceTypeLabels = {
  MANUAL: 'Thủ công',
  AUTO: 'Tự động',
  SUBSCRIPTION: 'Đăng ký (Gia hạn)',
  API_CREDIT: 'Tài nguyên API'
}

export const serviceStatuses = ['DRAFT', 'ACTIVE', 'INACTIVE', 'MAINTENANCE']
export const serviceStatusLabels = {
  DRAFT: 'Bản nháp',
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngừng hoạt động',
  MAINTENANCE: 'Đang bảo trì'
}

export const stockStatuses = ['AVAILABLE', 'OUT_OF_STOCK', 'CONSULTING_ONLY']
export const stockStatusLabels = {
  AVAILABLE: 'Có sẵn (Còn hàng)',
  OUT_OF_STOCK: 'Hết hàng',
  CONSULTING_ONLY: 'Chỉ nhận tư vấn'
}

export const ctaTypes = ['BUY_NOW', 'CONTACT', 'CONSULT']
export const ctaTypeLabels = {
  BUY_NOW: 'Mua ngay',
  CONTACT: 'Liên hệ',
  CONSULT: 'Nhận tư vấn'
}

export const orderStatusLabels = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền'
}

export const facebookSchema = JSON.stringify({
  properties: {
    facebookUrl: { label: 'Link Facebook', type: 'string' },
    note: { label: 'Ghi chú xử lý', type: 'string' },
  },
  required: ['facebookUrl'],
  type: 'object',
}, null, 2)

export const getServiceTypeLabel = (type) => serviceTypeLabels[type] || type
export const getServiceStatusLabel = (status) => serviceStatusLabels[status] || status
export const getStockStatusLabel = (status) => stockStatusLabels[status] || status
export const getCtaTypeLabel = (type) => ctaTypeLabels[type] || type
export const getOrderStatusLabel = (status) => orderStatusLabels[status] || status

