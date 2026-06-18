export const orderStatuses = [
  '',
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'DELIVERED',
  'COMPLETED',
  'WARRANTY',
  'FAILED',
  'REFUNDED',
  'CANCELLED',
]

export const orderStatusLabels = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  PROCESSING: 'Đang thực hiện',
  DELIVERED: 'Đã bàn giao',
  COMPLETED: 'Hoàn thành',
  WARRANTY: 'Đang bảo hành',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
  CANCELLED: 'Đã hủy',
}

export const getOrderStatusLabel = (status) => orderStatusLabels[status] || status
