import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { money } from '../../../../utils/currency'

export function useDashboardMetrics({
  displayBalance,
  orderList,
  ticketList,
  unreadNotifications,
  userDashboard,
}) {
  const { t } = useTranslation()

  return useMemo(
    () => [
      {
        detail: t('overview.balanceDetail', { defaultValue: 'Khả dụng để mua dịch vụ' }),
        label: t('overview.walletBalance', { defaultValue: 'Số dư ví' }),
        progress: Math.min(100, Math.max(12, (displayBalance / 1000000) * 100)),
        tone: 'green',
        value: money.format(displayBalance),
      },
      {
        detail: t('overview.processingDetail', { defaultValue: 'Cần theo dõi tiến độ' }),
        label: t('overview.processingOrders', { defaultValue: 'Đơn đang xử lý' }),
        progress: Math.min(
          100,
          Math.max(
            12,
            Number(
              userDashboard?.processingOrders ??
                orderList.filter((order) => order.status === 'PROCESSING').length
            ) * 18
          )
        ),
        value: String(
          userDashboard?.processingOrders ??
            orderList.filter((order) => order.status === 'PROCESSING').length
        ).padStart(2, '0'),
        tone: 'orange',
      },
      {
        detail: t('overview.pendingTicketsDetail', { defaultValue: 'Đang chờ phản hồi của bạn' }),
        label: t('overview.pendingTickets', { defaultValue: 'Ticket chờ phản hồi' }),
        progress: Math.min(
          100,
          Math.max(
            12,
            Number(
              userDashboard?.pendingUserTickets ??
                ticketList.filter((ticket) => ticket.status === 'PENDING_USER').length
            ) * 22
          )
        ),
        tone: 'blue',
        value: String(
          userDashboard?.pendingUserTickets ??
            ticketList.filter((ticket) => ticket.status === 'PENDING_USER').length
        ).padStart(2, '0'),
      },
    ],
    [displayBalance, orderList, ticketList, userDashboard, t]
  )
}
export default useDashboardMetrics
