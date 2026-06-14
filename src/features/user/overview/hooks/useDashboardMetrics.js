import { useMemo } from 'react'
import { money } from '../../../../utils/currency'

export function useDashboardMetrics({
  displayBalance,
  orderList,
  ticketList,
  unreadNotifications,
  userDashboard,
}) {
  return useMemo(
    () => [
      {
        detail: 'Khả dụng để mua dịch vụ',
        label: 'Số dư ví',
        progress: Math.min(100, Math.max(12, displayBalance / 1000000 * 100)),
        tone: 'green',
        value: money.format(displayBalance),
      },
      {
        detail: 'Cần theo dõi tiến độ',
        label: 'Đơn đang xử lý',
        progress: Math.min(100, Math.max(12, Number(userDashboard?.processingOrders ?? orderList.filter((order) => order.status === 'PROCESSING').length) * 18)),
        value: String(userDashboard?.processingOrders ?? orderList.filter((order) => order.status === 'PROCESSING').length).padStart(2, '0'),
        tone: 'orange',
      },
      {
        detail: 'Đang chờ phản hồi của bạn',
        label: 'Ticket chờ phản hồi',
        progress: Math.min(100, Math.max(12, Number(userDashboard?.pendingUserTickets ?? ticketList.filter((ticket) => ticket.status === 'PENDING_USER').length) * 22)),
        tone: 'blue',
        value: String(userDashboard?.pendingUserTickets ?? ticketList.filter((ticket) => ticket.status === 'PENDING_USER').length).padStart(2, '0'),
      },
      {
        detail: 'Cập nhật mới từ hệ thống',
        label: 'Thông báo mới',
        progress: Math.min(100, Math.max(12, unreadNotifications * 16)),
        tone: 'red',
        value: String(unreadNotifications).padStart(2, '0'),
      },
    ],
    [displayBalance, orderList, ticketList, unreadNotifications, userDashboard],
  )
}
