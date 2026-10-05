import {
  Activity,
  Bell,
  BookOpen,
  FileArchive,
  HeartPulse,
  History,
  Image,
  Languages,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Webhook,
} from 'lucide-react'

export const settingsTabs = [
  // ── 1. Cấu hình & Thương hiệu ──
  { id: 'brand', group: 'config', label: 'Logo & Brand', title: 'Logo & Thương hiệu', kicker: 'Branding', description: 'Thay đổi Logo website và Icon trên tab trình duyệt (Favicon).', icon: Image },
  { id: 'webhooks', group: 'config', label: 'Webhook & SePay', title: 'Webhook & Cổng thanh toán', kicker: 'Payment', description: 'Theo dõi trạng thái webhook, cấu hình SePay và retry giao dịch thanh toán.', icon: Webhook },
  { id: 'operations', group: 'config', label: 'Vận hành', title: 'Vận hành hệ thống', kicker: 'Operations', description: 'Chế độ bảo trì (Maintenance mode), giới hạn API và email bảo mật.', icon: SlidersHorizontal },
  { id: 'language', group: 'config', label: 'Ngôn ngữ', title: 'Ngôn ngữ giao diện', kicker: 'Language', description: 'Chuyển đổi ngôn ngữ hiển thị giữa Tiếng Việt và English.', icon: Languages },

  // ── 2. Bảo mật & Quản trị ──
  { id: 'settings', group: 'security', label: 'Bảo mật & Keys', title: 'Bảo mật & system keys', kicker: 'Security', description: '2FA admin, backup/restore cấu hình và lịch sử thay đổi.', icon: ShieldCheck },
  { id: 'admins', group: 'security', label: 'Quản trị viên', title: 'Quyền quản trị', kicker: 'Access', description: 'Role, trạng thái admin, 2FA và phiên làm việc quản trị viên.', icon: UserCog },
  { id: 'audit', group: 'security', label: 'Nhật ký thao tác', title: 'Audit log', kicker: 'Trace', description: 'Tra cứu, lọc và xuất lịch sử thao tác quan trọng trong hệ thống.', icon: History },
  { id: 'notifications', group: 'security', label: 'Thông báo', title: 'Cấu hình thông báo', kicker: 'Alerts', description: 'Quản lý notification settings và các thông báo vận hành quan trọng.', icon: Bell },

  // ── 3. Kỹ thuật & Tiện ích ──
  { id: 'jobs', group: 'tools', label: 'Tiến trình nền', title: 'Background jobs', kicker: 'Jobs', description: 'Theo dõi tiến trình chạy nền (cron jobs), retry hoặc dừng job khi cần.', icon: Activity },
  { id: 'health', group: 'tools', label: 'Sức khỏe API', title: 'Sức khỏe hệ thống', kicker: 'Health', description: 'Thông tin trạng thái API, tài nguyên và chỉ số vận hành server.', icon: HeartPulse },
  { id: 'files', group: 'tools', label: 'Tệp nội bộ', title: 'Kho tệp tin', kicker: 'Storage', description: 'Upload, xem trước, tải xuống và quản lý tệp dành cho vận hành.', icon: FileArchive },
  { id: 'guide', group: 'tools', label: 'Hướng dẫn', title: 'Hướng dẫn vận hành', kicker: 'Docs', description: 'Tài liệu thao tác nhanh cho ban quản trị khi vận hành hệ thống.', icon: BookOpen },
]

export const settingsGroups = [
  { id: 'config', label: 'Cấu hình & Thương hiệu' },
  { id: 'security', label: 'Bảo mật & Quản trị' },
  { id: 'tools', label: 'Kỹ thuật & Tiện ích' },
]
