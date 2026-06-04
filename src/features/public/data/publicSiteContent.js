import {
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCheck,
  Headphones,
  History,
  KeyRound,
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
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react'

export const navItems = [
  { label: 'Trang chủ', href: '#top' },
  { label: 'Dịch vụ', href: '#services' },
  { label: 'Bảng giá', href: '#pricing' },
  { label: 'Hướng dẫn', href: '#workflow' },
  { label: 'Chính sách', href: '#policies' },
  { label: 'Liên hệ', href: '#contact' },
]

export const trustStats = [
  {
    value: '12.000+',
    label: 'Đơn đã xử lý',
    detail: 'Lịch sử đơn hàng và trạng thái xử lý rõ ràng theo từng giao dịch.',
  },
  {
    value: '< 1 phút',
    label: 'Nạp tiền tự động',
    detail: 'SePay webhook giúp đối soát nhanh khi chuyển khoản đúng nội dung.',
  },
  {
    value: '24/7',
    label: 'Tiếp nhận yêu cầu',
    detail: 'Người dùng có thể đặt đơn, nạp ví và gửi ticket bất cứ lúc nào.',
  },
  {
    value: '100%',
    label: 'Lịch sử ví minh bạch',
    detail: 'Mọi giao dịch cộng, trừ, hoàn tiền đều có lịch sử để kiểm tra lại.',
  },
]

export const serviceCategories = [
  {
    title: 'Tài khoản & công cụ số',
    description: 'CapCut Pro, tài khoản Facebook, công cụ hỗ trợ sáng tạo nội dung và vận hành kênh.',
    icon: KeyRound,
    highlights: ['CapCut Pro', 'Via/BM/Page', 'Tài khoản theo nhu cầu'],
  },
  {
    title: 'Marketing & quảng cáo',
    description: 'Dịch vụ hỗ trợ setup, tối ưu và xử lý nhu cầu quảng cáo cho cá nhân hoặc đội vận hành.',
    icon: Megaphone,
    highlights: ['Chạy quảng cáo FB', 'Setup chiến dịch', 'Tư vấn ngân sách'],
  },
  {
    title: 'Automation & API',
    description: 'Dịch vụ tự động hóa thao tác, tích hợp API và hỗ trợ vận hành quy trình số.',
    icon: Workflow,
    highlights: ['API workflow', 'Tự động hóa thao tác', 'Kết nối hệ thống'],
  },
  {
    title: 'Subscription tools',
    description: 'Gói công cụ trả phí theo tháng hoặc năm, có điều kiện sử dụng và hỗ trợ rõ ràng.',
    icon: CreditCard,
    highlights: ['Gói tháng/năm', 'Gia hạn subscription', 'Hỗ trợ đăng nhập'],
  },
  {
    title: 'Custom services',
    description: 'Tiếp nhận yêu cầu riêng, báo giá theo phạm vi và theo dõi bằng ticket để không thất lạc thông tin.',
    icon: Wrench,
    highlights: ['Báo giá riêng', 'Xử lý thủ công', 'Ticket theo yêu cầu'],
  },
]

export const featuredServices = [
  {
    name: 'CapCut Pro 12 tháng',
    category: 'Subscription tools',
    price: 'Từ 390.000đ',
    processingTime: '5-30 phút',
    warranty: '7 ngày hỗ trợ đăng nhập',
    mode: 'Bán tự động',
    conditions: ['Dùng đúng email nhận bàn giao', 'Không tự ý đổi vùng hoặc thông tin gói'],
  },
  {
    name: 'Tài khoản Facebook Ads',
    category: 'Marketing & quảng cáo',
    price: 'Từ 250.000đ',
    processingTime: 'Trong ngày',
    warranty: 'Theo điều kiện từng loại tài khoản',
    mode: 'Kiểm duyệt thủ công',
    conditions: ['Cần xác nhận nhu cầu trước khi mua', 'Bảo hành không áp dụng cho vi phạm chính sách nền tảng'],
  },
  {
    name: 'Setup chiến dịch quảng cáo',
    category: 'Marketing & quảng cáo',
    price: 'Báo giá theo ngân sách',
    processingTime: '1-3 ngày',
    warranty: 'Hỗ trợ tối ưu theo gói',
    mode: 'Thủ công',
    conditions: ['Cần brief sản phẩm và mục tiêu', 'Ngân sách quảng cáo không bao gồm trong phí dịch vụ'],
  },
  {
    name: 'Automation/API theo yêu cầu',
    category: 'Automation & API',
    price: 'Báo giá riêng',
    processingTime: 'Theo phạm vi',
    warranty: 'Bảo trì theo thỏa thuận',
    mode: 'Custom',
    conditions: ['Cần mô tả luồng xử lý', 'Có kiểm thử trước khi bàn giao'],
  },
]

export const workflowSteps = [
  {
    title: 'Đăng ký tài khoản',
    text: 'Tạo tài khoản để có ví, lịch sử mua và kênh hỗ trợ riêng.',
    icon: LockKeyhole,
  },
  {
    title: 'Nạp tiền vào ví',
    text: 'Tạo yêu cầu nạp, chuyển khoản đúng nội dung và chờ hệ thống cộng ví.',
    icon: Wallet,
  },
  {
    title: 'Chọn dịch vụ',
    text: 'Xem điều kiện, bảo hành, thời gian xử lý rồi đặt mua bằng số dư ví.',
    icon: PackageCheck,
  },
  {
    title: 'Theo dõi đơn hàng',
    text: 'Kiểm tra trạng thái, nhận kết quả và gửi ticket nếu cần hỗ trợ.',
    icon: ReceiptText,
  },
]

export const depositFlow = [
  {
    title: 'Người dùng chuyển khoản',
    text: 'Mỗi yêu cầu nạp tạo ra nội dung chuyển khoản riêng.',
    icon: CreditCard,
  },
  {
    title: 'SePay gửi webhook',
    text: 'Giao dịch ngân hàng được gửi về hệ thống để kiểm tra tự động.',
    icon: Zap,
  },
  {
    title: 'Hệ thống đối soát',
    text: 'Số tiền, nội dung và trạng thái được so khớp trước khi cộng ví.',
    icon: RefreshCw,
  },
  {
    title: 'Ví được cộng tiền',
    text: 'Người dùng thấy số dư mới và lịch sử giao dịch trong dashboard.',
    icon: CheckCircle2,
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
    text: 'Đội hỗ trợ tiếp nhận yêu cầu custom, lỗi đơn và vấn đề thanh toán qua ticket.',
    icon: LifeBuoy,
  },
]

export const faqItems = [
  {
    question: 'Nạp tiền bao lâu thì được cộng vào ví?',
    answer: 'Khi chuyển khoản đúng số tiền và đúng nội dung, hệ thống có thể đối soát tự động trong khoảng dưới 1 phút. Một số giao dịch ngân hàng có thể chậm hơn tùy thời điểm.',
  },
  {
    question: 'Nếu chuyển khoản sai nội dung thì sao?',
    answer: 'Bạn cần gửi ticket kèm ảnh giao dịch, số tiền, thời gian chuyển khoản và tài khoản ngân hàng để đội hỗ trợ kiểm tra thủ công.',
  },
  {
    question: 'Đơn lỗi có được hoàn tiền không?',
    answer: 'Có, nếu lỗi thuộc phạm vi bảo hành hoặc dịch vụ không thể xử lý theo mô tả. Tiền hoàn sẽ được cộng lại vào ví và có lịch sử giao dịch rõ ràng.',
  },
  {
    question: 'Mua xong nhận kết quả ở đâu?',
    answer: 'Kết quả, trạng thái xử lý và ghi chú bàn giao được hiển thị trong chi tiết đơn hàng ở dashboard.',
  },
  {
    question: 'Liên hệ hỗ trợ bằng cách nào?',
    answer: 'Sau khi đăng nhập, bạn có thể tạo ticket theo từng đơn hoặc từng giao dịch nạp tiền để đội hỗ trợ có đủ ngữ cảnh xử lý.',
  },
]

export const footerGroups = [
  {
    title: 'Dịch vụ',
    links: ['Tài khoản & công cụ số', 'Marketing & quảng cáo', 'Automation/API', 'Custom services'],
  },
  {
    title: 'Hướng dẫn',
    links: ['Cách nạp tiền', 'Cách mua dịch vụ', 'Theo dõi đơn hàng', 'Tạo ticket hỗ trợ'],
  },
  {
    title: 'Chính sách',
    links: ['Chính sách thanh toán', 'Chính sách bảo mật', 'Hoàn tiền & bảo hành', 'Điều khoản sử dụng'],
  },
]

export const policyHighlights = [
  { label: 'Thanh toán', value: 'Nạp ví qua chuyển khoản ngân hàng và đối soát SePay.' },
  { label: 'Bảo hành', value: 'Điều kiện bảo hành hiển thị theo từng dịch vụ trước khi mua.' },
  { label: 'Hoàn tiền', value: 'Hoàn về ví khi đơn không thể xử lý hoặc thuộc phạm vi lỗi được bảo hành.' },
]

export const platformSignals = [
  { label: 'Đơn đang xử lý', value: '18', icon: Clock3 },
  { label: 'Ticket hỗ trợ', value: '04', icon: Headphones },
  { label: 'Đã cộng ví hôm nay', value: '+8.450.000đ', icon: Wallet },
  { label: 'Chính sách rõ ràng', value: 'Bảo hành/hoàn tiền', icon: Settings },
]
