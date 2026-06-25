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

export const manualWorkflowStatuses = [
  'NEW_REQUEST',
  'SCOPING',
  'WAITING_USER',
  'WAITING_PAYMENT',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
]

export const manualWorkflowStatusLabels = {
  NEW_REQUEST: 'Yêu cầu mới',
  SCOPING: 'Đang chốt scope',
  WAITING_USER: 'Chờ khách',
  WAITING_PAYMENT: 'Chờ thanh toán',
  IN_PROGRESS: 'Đang triển khai',
  IN_REVIEW: 'Chờ nghiệm thu',
  DONE: 'Hoàn tất',
}

export const manualQueueOptions = [
  { id: 'all', label: 'Tất cả' },
  { id: 'manual', label: 'Dịch vụ thủ công' },
  { id: 'unassigned', label: 'Chưa gán' },
  { id: 'mine', label: 'Của tôi' },
  { id: 'due', label: 'Sắp quá hạn' },
  { id: 'overdue', label: 'Quá hạn' },
  { id: 'waiting_user', label: 'Chờ khách' },
  { id: 'waiting_payment', label: 'Chờ thanh toán' },
]

export const getManualWorkflowStatusLabel = (status) => manualWorkflowStatusLabels[status] || status
