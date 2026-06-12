import { Grid3X3, Home, LifeBuoy, PlusCircle, ReceiptText, User } from 'lucide-react'

export const navItems = [
  { id: 'overview', label: 'Tổng quan', icon: Home, path: '/' },
  { id: 'deposit', label: 'Nạp tiền', icon: PlusCircle, path: '/deposit' },
  { id: 'services', label: 'Dịch vụ', icon: Grid3X3, path: '/services' },
  { id: 'orders', label: 'Đơn hàng', icon: ReceiptText, path: '/orders' },
  { id: 'support', label: 'Hỗ trợ', icon: LifeBuoy, path: '/support', hidden: true },
  { id: 'profile', label: 'Hồ sơ của tôi', icon: User, path: '/profile', hidden: true },
]
