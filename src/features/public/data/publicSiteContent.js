import {
  CheckCircle2,
  CreditCard,
  FileCheck,
  Headphones,
  History,
  LifeBuoy,
  LockKeyhole,
  Megaphone,
  MessageSquare,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  Settings,
  ShieldCheck,
  Wallet,
} from 'lucide-react'

export const navItems = [
  { label: 'Trang chủ', href: '#top' },
  { label: 'Dịch vụ', href: '#services' },
  { label: 'Bảng giá', href: '#pricing' },
  { label: 'Hướng dẫn', href: '#workflow' },
  { label: 'Chính sách', href: '#policies' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Liên hệ', href: '#contact' },
]

export const trustStats = [
  {
    label: 'Đơn hàng có mã theo dõi',
    detail: 'Mỗi đơn có trạng thái, thời gian xử lý và ghi chú bàn giao rõ ràng.',
    icon: ReceiptText,
  },
  {
    label: 'Ví tiền minh bạch',
    detail: 'Lịch sử nạp, mua và hoàn tiền được lưu để kiểm tra lại khi cần.',
    icon: Wallet,
  },
  {
    label: 'Hỗ trợ sau mua',
    detail: 'Ticket gắn với đơn hàng giúp xử lý vấn đề đúng ngữ cảnh.',
    icon: Headphones,
  },
  {
    label: 'Chính sách rõ ràng',
    detail: 'Điều kiện bảo hành, hoàn tiền và thời gian xử lý được đặt trước hành động mua.',
    icon: FileCheck,
  },
]

export const workflowSteps = [
  {
    title: 'Chọn dịch vụ',
    text: 'Xem gói CapCut, Facebook, nâng cấp hoặc quảng cáo theo nhu cầu.',
    icon: PackageCheck,
  },
  {
    title: 'Đăng nhập / tạo tài khoản',
    text: 'Tài khoản giúp lưu lịch sử đơn, ví tiền và ticket hỗ trợ.',
    icon: LockKeyhole,
  },
  {
    title: 'Nạp ví hoặc gửi tư vấn',
    text: 'Gói mua nhanh dùng số dư ví; dịch vụ quảng cáo tạo yêu cầu tư vấn.',
    icon: Wallet,
  },
  {
    title: 'Theo dõi đơn hàng',
    text: 'Kiểm tra trạng thái, nhận kết quả và gửi ticket nếu cần hỗ trợ.',
    icon: ReceiptText,
  },
  {
    title: 'Nhận hỗ trợ / bảo hành',
    text: 'Nếu lỗi thuộc phạm vi bảo hành, tạo ticket gắn với đúng mã đơn.',
    icon: LifeBuoy,
  },
]

export const depositFlow = [
  {
    title: 'Tạo mã nạp',
    text: 'Chọn số tiền và nhận nội dung chuyển khoản riêng cho tài khoản của bạn.',
    icon: CreditCard,
  },
  {
    title: 'Chuyển khoản',
    text: 'Chuyển đúng số tiền và đúng nội dung để hệ thống nhận diện giao dịch.',
    icon: RefreshCw,
  },
  {
    title: 'Giao dịch được xác nhận',
    text: 'Hệ thống kiểm tra giao dịch ngân hàng và cập nhật trạng thái nạp.',
    icon: Wallet,
  },
  {
    title: 'Kendy cộng ví',
    text: 'Số dư mới xuất hiện trong ví kèm lịch sử giao dịch.',
    icon: CheckCircle2,
  },
  {
    title: 'Mua dịch vụ',
    text: 'Dùng số dư để đặt mua CapCut, Facebook, nâng cấp hoặc dịch vụ quảng cáo.',
    icon: PackageCheck,
  },
]

export const whyChooseUs = [
  {
    title: 'Uy tín tài chính',
    text: 'Ví tiền có lịch sử cộng, trừ và hoàn tiền để người dùng kiểm tra lại khi cần.',
    icon: History,
  },
  {
    title: 'Trạng thái đơn minh bạch',
    text: 'Đơn hàng được theo dõi theo từng trạng thái thay vì trao đổi thủ công rời rạc.',
    icon: ReceiptText,
  },
  {
    title: 'Ticket theo từng đơn',
    text: 'Khi có lỗi, nội dung hỗ trợ gắn với đúng đơn và đúng giao dịch.',
    icon: MessageSquare,
  },
  {
    title: 'Chính sách rõ ràng',
    text: 'Điều kiện sử dụng, bảo hành và hoàn tiền được hiển thị trước khi mua.',
    icon: FileCheck,
  },
  {
    title: 'Bảo mật tài khoản',
    text: 'Luồng đăng nhập, token và thông tin giao dịch được tách khỏi public site.',
    icon: ShieldCheck,
  },
  {
    title: 'Hỗ trợ vận hành',
    text: 'Đội hỗ trợ tiếp nhận yêu cầu riêng, lỗi đơn và vấn đề thanh toán qua ticket.',
    icon: LifeBuoy,
  },
]

export const serviceSignals = [
  { label: 'Facebook Ads', value: 'Via, BM, Page', icon: Megaphone },
  { label: 'Hỗ trợ sau mua', value: 'Ticket riêng', icon: Headphones },
  { label: 'Nâng cấp gói', value: 'CapCut Pro', icon: Wallet },
  { label: 'Điều kiện rõ', value: 'Bảo hành/hoàn tiền', icon: Settings },
]

export const proofItems = [
  {
    label: 'Lịch sử đơn',
    title: 'Đơn CapCut Pro đang xử lý',
    description: 'Khách xem được mã đơn, trạng thái và thời gian xử lý thay vì chờ tin nhắn thủ công.',
    tone: 'blue',
    lines: ['OD9K7Q2P4A', 'Đang xử lý', '5-30 phút'],
  },
  {
    label: 'Lịch sử ví',
    title: 'Giao dịch nạp đã cộng',
    description: 'Mỗi lần nạp, mua hoặc hoàn tiền đều có ghi nhận để kiểm tra sau này.',
    tone: 'green',
    lines: ['+500.000đ', 'Đã cộng ví', 'KD-8F4N2L6Q'],
  },
  {
    label: 'Ticket hỗ trợ',
    title: 'Hỗ trợ gắn với đúng đơn',
    description: 'Khi có lỗi, khách tạo ticket theo đơn để đội hỗ trợ nắm rõ bối cảnh xử lý.',
    tone: 'amber',
    lines: ['TK-1024', 'Đang phản hồi', 'CapCut Pro 12 tháng'],
  },
]
