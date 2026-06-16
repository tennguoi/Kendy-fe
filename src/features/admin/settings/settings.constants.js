import {
  Activity,
  Bell,
  BookOpen,
  FileArchive,
  HeartPulse,
  History,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Webhook,
} from 'lucide-react'

export const settingsTabs = [
  { id: 'settings', label: 'Bảo mật', title: 'Bảo mật & system keys', kicker: 'Security', description: '2FA admin, backup/restore setting và lịch sử thay đổi cấu hình.', icon: ShieldCheck },
  { id: 'operations', label: 'Vận hành', title: 'Vận hành hệ thống', kicker: 'Operations', description: 'Maintenance mode, giới hạn API và nội dung email bảo mật.', icon: SlidersHorizontal },
  { id: 'webhooks', label: 'Webhook', title: 'Webhook & SePay', kicker: 'Integration', description: 'Theo dõi trạng thái webhook, cấu hình SePay và retry giao dịch cần xử lý.', icon: Webhook },
  { id: 'notifications', label: 'Thông báo', title: 'Thông báo admin', kicker: 'Notifications', description: 'Quản lý notification settings và các thông báo vận hành cần đọc.', icon: Bell },
  { id: 'admins', label: 'Quản trị viên', title: 'Quyền quản trị', kicker: 'Access', description: 'Role, permission, trạng thái admin, 2FA và session của quản trị viên.', icon: UserCog },
  { id: 'audit', label: 'Nhật ký', title: 'Audit log', kicker: 'Trace', description: 'Tra cứu, lọc và xuất lịch sử thao tác quan trọng trong hệ thống.', icon: History },
  { id: 'files', label: 'Tệp tin', title: 'Tệp nội bộ', kicker: 'Storage', description: 'Upload, preview, tải xuống và xóa tệp dành cho vận hành.', icon: FileArchive },
  { id: 'jobs', label: 'Công việc', title: 'Background jobs', kicker: 'Jobs', description: 'Theo dõi trạng thái job, retry hoặc hủy job khi cần.', icon: Activity },
  { id: 'health', label: 'Trạng thái', title: 'Sức khỏe hệ thống', kicker: 'Health', description: 'Thông tin trạng thái API và các chỉ báo vận hành nhanh.', icon: HeartPulse },
  { id: 'guide', label: 'Hướng dẫn', title: 'Hướng dẫn vận hành', kicker: 'Docs', description: 'Tài liệu thao tác nhanh cho admin khi vận hành hệ thống.', icon: BookOpen },
]
