export const orderStatuses = ['', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']
export const orderStatusLabels = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
  CANCELLED: 'Đã hủy',
}

export const getOrderStatusLabel = (status) => orderStatusLabels[status] || status

