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
  { labelKey: 'auth.homePage', label: 'Trang chủ', href: '/' },
  { labelKey: 'public.policies.service.title', label: 'Danh mục', href: '/catalog' },
  { labelKey: 'adminNav.pricing', label: 'Bảng giá', href: '/#pricing' },
  { labelKey: 'public.workflow.eyebrow', label: 'Hướng dẫn', href: '/#workflow' },
  { labelKey: 'public.whyChooseUs.policy.title', label: 'Chính sách', href: '/#policies' },
  { labelKey: 'deposit.statusAll', label: 'FAQ', href: '/#faq' },
  { labelKey: 'support.title', label: 'Liên hệ', href: '/#contact' },
]

export const trustStats = [
  {
    labelKey: 'public.trust.stats.order.label',
    label: 'Đơn hàng có mã theo dõi',
    detailKey: 'public.trust.stats.order.detail',
    detail: 'Mỗi đơn có trạng thái, thời gian xử lý và ghi chú bàn giao rõ ràng.',
    icon: ReceiptText,
  },
  {
    labelKey: 'public.trust.stats.wallet.label',
    label: 'Ví tiền minh bạch',
    detailKey: 'public.trust.stats.wallet.detail',
    detail: 'Lịch sử nạp, mua và hoàn tiền được lưu để kiểm tra lại khi cần.',
    icon: Wallet,
  },
  {
    labelKey: 'public.trust.stats.support.label',
    label: 'Hỗ trợ sau mua',
    detailKey: 'public.trust.stats.support.detail',
    detail: 'Ticket gắn với đơn hàng giúp xử lý vấn đề đúng ngữ cảnh.',
    icon: Headphones,
  },
  {
    labelKey: 'public.trust.stats.policy.label',
    label: 'Chính sách rõ ràng',
    detailKey: 'public.trust.stats.policy.detail',
    detail: 'Điều kiện bảo hành, hoàn tiền và thời gian xử lý được đặt trước hành động mua.',
    icon: FileCheck,
  },
]

export const workflowSteps = [
  {
    titleKey: 'public.workflow.steps.step1.title',
    title: 'Chọn dịch vụ',
    textKey: 'public.workflow.steps.step1.text',
    text: 'Xem gói CapCut, Facebook, nâng cấp hoặc quảng cáo theo nhu cầu.',
    icon: PackageCheck,
  },
  {
    titleKey: 'public.workflow.steps.step2.title',
    title: 'Đăng nhập / tạo tài khoản',
    textKey: 'public.workflow.steps.step2.text',
    text: 'Tài khoản giúp lưu lịch sử đơn, ví tiền và ticket hỗ trợ.',
    icon: LockKeyhole,
  },
  {
    titleKey: 'public.workflow.steps.step3.title',
    title: 'Nạp ví hoặc gửi tư vấn',
    textKey: 'public.workflow.steps.step3.text',
    text: 'Gói mua nhanh dùng số dư ví; dịch vụ quảng cáo tạo yêu cầu tư vấn.',
    icon: Wallet,
  },
  {
    titleKey: 'public.workflow.steps.step4.title',
    title: 'Theo dõi đơn hàng',
    textKey: 'public.workflow.steps.step4.text',
    text: 'Kiểm tra trạng thái, nhận kết quả và gửi ticket nếu cần hỗ trợ.',
    icon: ReceiptText,
  },
  {
    titleKey: 'public.workflow.steps.step5.title',
    title: 'Nhận hỗ trợ / bảo hành',
    textKey: 'public.workflow.steps.step5.text',
    text: 'Nếu lỗi thuộc phạm vi bảo hành, tạo ticket gắn với đúng mã đơn.',
    icon: LifeBuoy,
  },
]

export const depositFlow = [
  {
    titleKey: 'public.depositFlow.steps.step1.title',
    title: 'Tạo mã nạp',
    textKey: 'public.depositFlow.steps.step1.text',
    text: 'Chọn số tiền và nhận nội dung chuyển khoản riêng cho tài khoản của bạn.',
    icon: CreditCard,
  },
  {
    titleKey: 'public.depositFlow.steps.step2.title',
    title: 'Chuyển khoản',
    textKey: 'public.depositFlow.steps.step2.text',
    text: 'Chuyển đúng số tiền và đúng nội dung để hệ thống nhận diện giao dịch.',
    icon: RefreshCw,
  },
  {
    titleKey: 'public.depositFlow.steps.step3.title',
    title: 'Giao dịch được xác nhận',
    textKey: 'public.depositFlow.steps.step3.text',
    text: 'Hệ thống kiểm tra giao dịch ngân hàng và cập nhật trạng thái nạp.',
    icon: Wallet,
  },
  {
    titleKey: 'public.depositFlow.steps.step4.title',
    title: 'Kendy cộng ví',
    textKey: 'public.depositFlow.steps.step4.text',
    text: 'Số dư mới xuất hiện trong ví kèm lịch sử giao dịch.',
    icon: CheckCircle2,
  },
  {
    titleKey: 'public.depositFlow.steps.step5.title',
    title: 'Mua dịch vụ',
    textKey: 'public.depositFlow.steps.step5.text',
    text: 'Dùng số dư để đặt mua CapCut, Facebook, nâng cấp hoặc dịch vụ quảng cáo.',
    icon: PackageCheck,
  },
]

export const whyChooseUs = [
  {
    titleKey: 'public.whyChooseUs.reputation.title',
    title: 'Uy tín tài chính',
    textKey: 'public.whyChooseUs.reputation.text',
    text: 'Ví tiền có lịch sử cộng, trừ và hoàn tiền để người dùng kiểm tra lại khi cần.',
    icon: History,
  },
  {
    titleKey: 'public.whyChooseUs.transparency.title',
    title: 'Trạng thái đơn minh bạch',
    textKey: 'public.whyChooseUs.transparency.text',
    text: 'Đơn hàng được theo dõi theo từng trạng thái thay vì trao đổi thủ công rời rạc.',
    icon: ReceiptText,
  },
  {
    titleKey: 'public.whyChooseUs.ticket.title',
    title: 'Ticket theo từng đơn',
    textKey: 'public.whyChooseUs.ticket.text',
    text: 'Khi có lỗi, nội dung hỗ trợ gắn với đúng đơn và đúng giao dịch.',
    icon: MessageSquare,
  },
  {
    titleKey: 'public.whyChooseUs.policy.title',
    title: 'Chính sách rõ ràng',
    textKey: 'public.whyChooseUs.policy.text',
    text: 'Điều kiện sử dụng, bảo hành và hoàn tiền được hiển thị trước khi mua.',
    icon: FileCheck,
  },
  {
    titleKey: 'public.whyChooseUs.security.title',
    title: 'Bảo mật tài khoản',
    textKey: 'public.whyChooseUs.security.text',
    text: 'Luồng đăng nhập, token và thông tin giao dịch được tách khỏi public site.',
    icon: ShieldCheck,
  },
  {
    titleKey: 'public.whyChooseUs.support.title',
    title: 'Hỗ trợ vận hành',
    textKey: 'public.whyChooseUs.support.text',
    text: 'Đội hỗ trợ tiếp nhận yêu cầu riêng, lỗi đơn và vấn đề thanh toán qua ticket.',
    icon: LifeBuoy,
  },
]

export const serviceSignals = [
  { labelKey: 'public.signals.fbAds', label: 'Facebook Ads', valueKey: 'public.signals.fbAdsValue', value: 'Via, BM, Page', icon: Megaphone },
  { labelKey: 'public.signals.postSupport', label: 'Hỗ trợ sau mua', valueKey: 'public.signals.postSupportValue', value: 'Ticket riêng', icon: Headphones },
  { labelKey: 'public.signals.upgrade', label: 'Nâng cấp gói', valueKey: 'public.signals.upgradeValue', value: 'CapCut Pro', icon: Wallet },
  { labelKey: 'public.signals.clearTerms', label: 'Điều kiện rõ', valueKey: 'public.signals.clearTermsValue', value: 'Bảo hành/hoàn tiền', icon: Settings },
]

export const proofItems = [
  {
    labelKey: 'public.proof.serviceAuto',
    label: 'Lịch sử đơn',
    titleKey: 'public.proof.serviceAuto',
    title: 'Đơn CapCut Pro đang xử lý',
    descriptionKey: 'public.proof.stepDeliveredDesc',
    description: 'Khách xem được mã đơn, trạng thái và thời gian xử lý thay vì chờ tin nhắn thủ công.',
    tone: 'blue',
    lines: ['OD9K7Q2P4A', 'Đang xử lý', '5-30 phút'],
  },
  {
    labelKey: 'public.whyChooseUs.reputation.title',
    label: 'Lịch sử ví',
    titleKey: 'public.proof.stepPaid',
    title: 'Giao dịch nạp đã cộng',
    descriptionKey: 'public.depositFlow.description',
    description: 'Mỗi lần nạp, mua hoặc hoàn tiền đều có ghi nhận để kiểm tra sau này.',
    tone: 'green',
    lines: ['+500.000đ', 'Đã cộng ví', 'KD-8F4N2L6Q'],
  },
  {
    labelKey: 'public.whyChooseUs.ticket.title',
    label: 'Ticket hỗ trợ',
    titleKey: 'public.proof.ticketCode',
    title: 'Hỗ trợ gắn với đúng đơn',
    descriptionKey: 'public.proof.stepAdminBriefDesc',
    description: 'Khi có lỗi, khách tạo ticket theo đơn để đội hỗ trợ nắm rõ bối cảnh xử lý.',
    tone: 'amber',
    lines: ['TK-1024', 'Đang phản hồi', 'CapCut Pro 12 tháng'],
  },
]
