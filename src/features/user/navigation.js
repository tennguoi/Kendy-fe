import { Grid3X3, Home, LifeBuoy, PlusCircle, ReceiptText, ShieldCheck, User } from 'lucide-react'

export const navItems = [
  { id: 'overview', label: 'nav.overview', icon: Home, path: '/' },
  { id: 'deposit', label: 'nav.deposit', icon: PlusCircle, path: '/deposit' },
  { id: 'services', label: 'nav.services', icon: Grid3X3, path: '/services' },
  { id: 'orders', label: 'nav.orders', icon: ReceiptText, path: '/orders' },
  { id: 'warranty', label: 'nav.warranty', icon: ShieldCheck, path: '/warranty' },
  { id: 'support', label: 'nav.support', icon: LifeBuoy, path: '/support', hidden: true },
  { id: 'profile', label: 'nav.profile', icon: User, path: '/profile', hidden: true },
]
