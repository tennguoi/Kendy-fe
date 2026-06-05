import { Grid3X3, Home, LifeBuoy, PlusCircle, ReceiptText, Settings } from 'lucide-react'

export const navItems = [
  { id: 'overview', label: 'Tổng quan', icon: Home, path: '/' },
  { id: 'deposit', label: 'Nạp tiền', icon: PlusCircle, path: '/deposit' },
  { id: 'services', label: 'Dịch vụ', icon: Grid3X3, path: '/services' },
  { id: 'orders', label: 'Đơn hàng', icon: ReceiptText, path: '/orders' },
  { id: 'support', label: 'Hỗ trợ', icon: LifeBuoy, path: '/support' },
  { id: 'settings', label: 'Cài đặt', icon: Settings, path: '/settings' },
]
