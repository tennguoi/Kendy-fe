import {
  BadgeDollarSign,
  ClipboardList,
  Grid3X3,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  WalletCards,
} from 'lucide-react'

export const adminNavItems = [
  { id: 'admin-overview', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'admin-users', label: 'Người dùng', icon: Users },
  { id: 'admin-orders', label: 'Đơn hàng', icon: ClipboardList },
  { id: 'admin-finance', label: 'Tài chính', icon: WalletCards },
  { id: 'admin-tickets', label: 'Ticket', icon: MessageSquare },
  { id: 'admin-services', label: 'Dịch vụ', icon: Grid3X3 },
  { id: 'admin-pricing', label: 'Bảng giá', icon: BadgeDollarSign },
  { id: 'admin-settings', label: 'Cài đặt', icon: Settings },
]
