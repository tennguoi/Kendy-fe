import {
  BadgeDollarSign,
  ClipboardList,
  Grid3X3,
  Newspaper,
  LayoutDashboard,
  MessageSquare,
  Percent,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
} from 'lucide-react'

export const adminNavItems = [
  { id: 'admin-overview', label: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
  { id: 'admin-users', label: 'Người dùng', path: '/admin/users', icon: Users },
  { id: 'admin-orders', label: 'Đơn hàng', path: '/admin/orders', icon: ClipboardList },
  { id: 'admin-finance', label: 'Tài chính', path: '/admin/finance', icon: WalletCards },
  { id: 'admin-tickets', label: 'Ticket', path: '/admin/tickets', icon: MessageSquare },
  { id: 'admin-services', label: 'Dịch vụ', path: '/admin/services', icon: Grid3X3 },
  { id: 'admin-pricing', label: 'Bảng giá', path: '/admin/pricing', icon: BadgeDollarSign },
  { id: 'admin-coupons', label: 'Coupon', path: '/admin/coupons', icon: Percent },
  { id: 'admin-warranty', label: 'Bảo hành', path: '/admin/warranty', icon: ShieldCheck },
  { id: 'admin-content', label: 'Nội dung', path: '/admin/content', icon: Newspaper },
  { id: 'admin-settings', label: 'Cài đặt', path: '/admin/settings', icon: Settings },
]
