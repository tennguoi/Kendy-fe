import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bell,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  FolderOpen,
  Inbox,
  Layers,
  LayoutGrid,
  LifeBuoy,
  MessageSquare,
  PackageOpen,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  User,
  WalletCards,
  X,
} from 'lucide-react'
import { useToast } from '../Toast'
import Button from '../Button/Button'
import Loading from '../Loading/Loading'
import Pagination from '../Pagination/Pagination'
import SearchField from '../SearchField/SearchField'
import Modal from '../Modal/Modal'
import ScrollReveal from '../ScrollReveal/ScrollReveal'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
import BaseInput from '../ui/BaseInput'
import BaseSelect from '../ui/BaseSelect'
import BaseTextarea from '../ui/BaseTextarea'
import StatusBadge from '../status/StatusBadge'
import { AdminStatusBadge, AdminEmptyState } from '../../features/admin/AdminShared'
import InfoLine from '../bank/InfoLine'
import RecentTransactions from '../wallet/RecentTransactions'
import RichEditor from '../RichEditor/RichEditor'
import './DevPlayground.css'

const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'inputs', label: 'Form Controls' },
  { id: 'badges', label: 'Trạng thái & Badges' },
  { id: 'data', label: 'Hiển thị dữ liệu' },
  { id: 'feedback', label: 'Tương tác & Feedback' },
  { id: 'editor', label: 'Soạn thảo' },
]

export default function DevPlayground() {
  const { t } = useTranslation()
  const { addToast } = useToast()

  const [activeCategory, setActiveCategory] = useState('all')

  // Button state
  const [btnLoading, setBtnLoading] = useState(false)

  // Form states
  const [inputText, setInputText] = useState('Kendy Digital')
  const [inputEmail, setInputEmail] = useState('admin@kendy.vn')
  const [inputError, setInputError] = useState('Email không đúng định dạng')
  const [inputPassword, setInputPassword] = useState('SuperSecretPass123')
  const [showPassword, setShowPassword] = useState(false)
  const [inputDate, setInputDate] = useState('2026-10-04')
  const [inputNumber, setInputNumber] = useState('150000')
  const [inputCheckbox, setInputCheckbox] = useState(true)
  const [selectService, setSelectService] = useState('netflix')
  const [textareaValue, setTextareaValue] = useState(
    'Tài khoản bảo hành 1 đổi 1 trong suốt thời gian sử dụng. Vui lòng không thay đổi email và thanh toán.'
  )
  const [searchQuery, setSearchQuery] = useState('')

  // InfoLine Copy state
  const [copiedKey, setCopiedKey] = useState('')
  const handleCopy = (label, value) => {
    navigator.clipboard.writeText(value)
    setCopiedKey(label)
    addToast({ type: 'success', title: 'Đã sao chép', message: `${label}: ${value}` })
    setTimeout(() => setCopiedKey(''), 2000)
  }

  // Modal & Loading state
  const [modalOpen, setModalOpen] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  // Pagination state
  const [page, setPage] = useState(1)

  // RichEditor toggle
  const [showEditor, setShowEditor] = useState(false)
  const [editorHtml, setEditorHtml] = useState(
    '<p>Xin chào! Đây là trình soạn thảo <strong>CKEditor 5</strong> tích hợp sẵn trong KendyDigital.</p>'
  )

  const showToast = useCallback(
    (type) => {
      const labels = {
        info: 'Thông báo hệ thống',
        success: 'Thao tác thành công',
        error: 'Có lỗi xảy ra',
      }
      const messages = {
        info: 'Đơn hàng #KD-8920 đang được hệ thống tự động xử lý.',
        success: 'Đã nạp thành công 500.000đ vào ví Kendy.',
        error: 'Mật khẩu giải mã thất bại hoặc phiên làm việc đã hết hạn.',
      }
      addToast({
        type,
        title: labels[type],
        message: messages[type],
        action: type === 'info' ? '/orders' : type === 'success' ? '/deposit' : undefined,
        timeout: 4500,
      })
    },
    [addToast]
  )

  const sampleTransactions = [
    {
      id: 1,
      code: 'TXN-MB-9021',
      note: 'Nạp tiền tự động SePay (MB Bank)',
      direction: 'IN',
      amount: 500000,
      balance: 750000,
    },
    {
      id: 2,
      code: 'ORD-10492',
      note: 'Thanh toán gói Netflix Premium 4K (1 Tháng)',
      direction: 'OUT',
      amount: 89000,
      balance: 661000,
    },
    {
      id: 3,
      code: 'WRN-REF-003',
      note: 'Hoàn tiền bảo hành đơn #ORD-9912',
      direction: 'IN',
      amount: 89000,
      balance: 750000,
    },
  ]

  const serviceOptions = [
    { value: 'netflix', label: 'Netflix Premium 4K UltraHD' },
    { value: 'spotify', label: 'Spotify Premium Family 1 Năm' },
    { value: 'chatgpt', label: 'ChatGPT Plus (GPT-4o) Chính chủ' },
    { value: 'canva', label: 'Canva Pro Giáo dục vĩnh viễn' },
    { value: 'youtube', label: 'YouTube Premium không quảng cáo' },
  ]

  const shouldShow = (category) => activeCategory === 'all' || activeCategory === category

  if (showLoading) {
    return (
      <div className="playground" style={{ display: 'grid', placeItems: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loading fullScreen={false} message="Đang giả lập tải dữ liệu..." />
          <div style={{ marginTop: 20 }}>
            <Button variant="outline" onClick={() => setShowLoading(false)}>
              <X size={16} /> Đóng màn hình Loading
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="playground">
      {/* Header */}
      <header className="playground-header">
        <div className="playground-badge">
          <Sparkles size={14} /> Design System & Component Showcase
        </div>
        <h1>KendyDigital Component Playground</h1>
        <p className="sub">
          Xem trước toàn bộ thư viện UI components dùng chung của dự án. Tất cả components đều hỗ trợ Dark/Light
          mode và chuẩn Accessibility.
        </p>
      </header>

      {/* Sticky Category Navigation */}
      <nav className="playground-nav" aria-label="Component categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`playground-chip ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {/* ── 1. BUTTONS ─────────────────────────────────────────── */}
      {shouldShow('buttons') && (
        <section className="playground-section" id="buttons">
          <div className="playground-section-head">
            <h2>
              <Layers size={20} /> Button Variants
            </h2>
            <span className="playground-section-count">7 biến thể</span>
          </div>
          <div className="playground-card">
            <span className="playground-item-label">Màu sắc & Style chuẩn</span>
            <div className="playground-row" style={{ marginBottom: 20 }}>
              <Button variant="primary">Primary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="glass">Glass Button</Button>
              <Button variant="dark">Dark Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="">Default Button</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>

            <span className="playground-item-label">Nút có Icon & Trạng thái</span>
            <div className="playground-row">
              <Button variant="primary">
                <Plus size={16} /> Tạo đơn hàng
              </Button>
              <Button variant="outline">
                <RefreshCw size={16} className={btnLoading ? 'spin' : ''} /> Tải lại
              </Button>
              <Button variant="ghost">
                <Send size={16} /> Gửi tin nhắn
              </Button>
              <button
                type="button"
                className="playground-trigger-btn outline"
                onClick={() => setBtnLoading((c) => !c)}
              >
                {btnLoading ? 'Dừng Spin' : 'Bật Spin Icon'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── 2. FORM CONTROLS ───────────────────────────────────── */}
      {shouldShow('inputs') && (
        <section className="playground-section" id="inputs">
          <div className="playground-section-head">
            <h2>
              <Sliders size={20} /> Form Controls (BaseInput, BaseSelect, BaseTextarea, SearchField)
            </h2>
            <span className="playground-section-count">Inputs & Selects</span>
          </div>

          <div className="playground-grid-2">
            {/* BaseInput Samples */}
            <div className="playground-card">
              <span className="playground-item-label">BaseInput — Chuẩn & Addons</span>
              <div className="playground-row column" style={{ gap: 14 }}>
                <BaseInput
                  id="demo-text"
                  label="Tên dịch vụ / Dự án"
                  placeholder="Nhập tên..."
                  value={inputText}
                  onChange={(val) => setInputText(val)}
                  helperText="Hiển thị trên hóa đơn và trang chủ"
                />

                <BaseInput
                  id="demo-password"
                  type={showPassword ? 'text' : 'password'}
                  label="Mật khẩu kho tài khoản"
                  value={inputPassword}
                  onChange={(val) => setInputPassword(val)}
                  helperText="Mật khẩu sẽ được mã hóa AES-256 GCM"
                >
                  <button
                    type="button"
                    className="playground-input-addon-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? 'Ẩn' : 'Hiện'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </BaseInput>

                <BaseInput
                  id="demo-number"
                  type="number"
                  label="Số tiền nạp (VND)"
                  value={inputNumber}
                  onChange={(val) => setInputNumber(val)}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--kd-muted)', paddingRight: 4 }}>đ</span>
                </BaseInput>
              </div>
            </div>

            {/* BaseInput Validation & Types */}
            <div className="playground-card">
              <span className="playground-item-label">Validation & Loại Input khác</span>
              <div className="playground-row column" style={{ gap: 14 }}>
                <BaseInput
                  id="demo-email-err"
                  label="Email nhận tài khoản (Validation Error)"
                  value={inputEmail}
                  onChange={(val) => {
                    setInputEmail(val)
                    setInputError(val.includes('@') ? '' : 'Email không đúng định dạng')
                  }}
                  error={inputError}
                />

                <BaseInput
                  id="demo-date"
                  type="date"
                  label="Ngày hết hạn dịch vụ"
                  value={inputDate}
                  onChange={(val) => setInputDate(val)}
                  helperText="Thời hạn tự động thu hồi tài khoản"
                />

                <div style={{ marginTop: 6 }}>
                  <BaseInput
                    id="demo-checkbox"
                    type="checkbox"
                    label="Tự động gia hạn gói khi đến hạn"
                    value={inputCheckbox}
                    onChange={(val) => setInputCheckbox(val)}
                  />
                </div>
              </div>
            </div>

            {/* BaseSelect */}
            <div className="playground-card">
              <span className="playground-item-label">BaseSelect — Dropdown tìm kiếm thông minh</span>
              <div className="playground-row column" style={{ gap: 14 }}>
                <BaseSelect
                  label="Chọn dịch vụ số cần cấp"
                  value={selectService}
                  onChange={(val) => setSelectService(val)}
                  options={serviceOptions}
                  placeholder="-- Chọn dịch vụ --"
                  helperText="Đã tích hợp debounce lọc nhanh"
                />
                <p style={{ fontSize: 12, color: 'var(--kd-muted)' }}>
                  Giá trị đang chọn: <strong>{selectService}</strong>
                </p>
              </div>
            </div>

            {/* BaseTextarea & SearchField */}
            <div className="playground-card">
              <span className="playground-item-label">BaseTextarea & SearchField</span>
              <div className="playground-row column" style={{ gap: 14 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--kd-muted)', display: 'block', marginBottom: 6 }}>
                    Thanh tìm kiếm (SearchField)
                  </span>
                  <SearchField
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery('')}
                    placeholder="Tìm theo mã đơn, email khách, IP..."
                  />
                </div>

                <BaseTextarea
                  id="demo-textarea"
                  label="Chính sách bảo hành & Hướng dẫn sử dụng"
                  rows="3"
                  value={textareaValue}
                  onChange={(val) => setTextareaValue(val)}
                  helperText="Hỗ trợ tối đa 500 ký tự"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 3. BADGES & STATUSES ───────────────────────────────── */}
      {shouldShow('badges') && (
        <section className="playground-section" id="badges">
          <div className="playground-section-head">
            <h2>
              <ShieldCheck size={20} /> Trạng thái & Badges
            </h2>
            <span className="playground-section-count">User & Admin Badges</span>
          </div>

          <div className="playground-grid-2">
            {/* User StatusBadge */}
            <div className="playground-card">
              <span className="playground-item-label">User StatusBadge (Đơn hàng & Giao dịch)</span>
              <p>Dùng ở phía khách hàng: màn hình đơn hàng, lịch sử ví và ticket:</p>
              <div className="playground-row" style={{ gap: 10, marginTop: 14 }}>
                <StatusBadge status="PAID" />
                <StatusBadge status="COMPLETED" />
                <StatusBadge status="PENDING" />
                <StatusBadge status="PROCESSING" />
                <StatusBadge status="REFUNDED" />
                <StatusBadge status="CANCELLED" />
                <StatusBadge status="FAILED" />
              </div>
            </div>

            {/* Admin StatusBadge */}
            <div className="playground-card">
              <span className="playground-item-label">AdminStatusBadge (Quản trị viên & Dịch vụ)</span>
              <p>Dùng ở bảng người dùng và danh mục dịch vụ admin:</p>
              <div className="playground-row" style={{ gap: 10, marginTop: 14 }}>
                <AdminStatusBadge status="ACTIVE" type="user" />
                <AdminStatusBadge status="LOCKED" type="user" />
                <AdminStatusBadge status="PENDING_VERIFY" type="user" />
                <AdminStatusBadge status="DISABLED" type="user" />
                <AdminStatusBadge status="ACTIVE" type="service" />
                <AdminStatusBadge status="MAINTENANCE" type="service" />
                <AdminStatusBadge status="INACTIVE" type="service" />
              </div>
            </div>
          </div>

          {/* Admin Empty State */}
          <div className="playground-card" style={{ marginTop: 18 }}>
            <span className="playground-item-label">AdminEmptyState — Trạng thái rỗng chuyên nghiệp</span>
            <AdminEmptyState
              message="Chưa tìm thấy đơn hàng nào trong khoảng thời gian này"
              hint="Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm."
            />
          </div>
        </section>
      )}

      {/* ── 4. DATA DISPLAY ────────────────────────────────────── */}
      {shouldShow('data') && (
        <section className="playground-section" id="data">
          <div className="playground-section-head">
            <h2>
              <LayoutGrid size={20} /> Hiển thị dữ liệu & Thông tin
            </h2>
            <span className="playground-section-count">InfoLine, Ledger, Pagination</span>
          </div>

          <div className="playground-grid-2">
            {/* InfoLine */}
            <div className="playground-card">
              <span className="playground-item-label">InfoLine — Dòng thông tin kèm nút sao chép (Copy)</span>
              <p>Dùng trong màn hình nạp tiền SePay, chi tiết đơn hàng và tài khoản:</p>
              <div className="playground-row column" style={{ gap: 8, marginTop: 12 }}>
                <InfoLine
                  label="Ngân hàng"
                  value="MB Bank (Quân Đội)"
                  copied={copiedKey}
                  onCopy={handleCopy}
                />
                <InfoLine
                  label="Số tài khoản"
                  value="0987654321"
                  copied={copiedKey}
                  onCopy={handleCopy}
                  strong
                />
                <InfoLine
                  label="Chủ tài khoản"
                  value="KENDY DIGITAL"
                  copied={copiedKey}
                  onCopy={handleCopy}
                />
                <InfoLine
                  label="Cú pháp nạp"
                  value="KENDY NAP 10492"
                  copied={copiedKey}
                  onCopy={handleCopy}
                  strong
                />
              </div>
            </div>

            {/* Pagination & Language */}
            <div className="playground-card">
              <span className="playground-item-label">Pagination & LanguageSwitcher</span>
              <div className="playground-row column" style={{ gap: 20 }}>
                <div>
                  <span className="playground-item-label">Chuyển đổi ngôn ngữ (i18n)</span>
                  <LanguageSwitcher />
                </div>

                <div>
                  <span className="playground-item-label">Thanh phân trang (Trang {page} / 20)</span>
                  <Pagination currentPage={page} totalPages={20} onPageChange={setPage} />
                </div>
              </div>
            </div>
          </div>

          {/* RecentTransactions */}
          <div className="playground-card" style={{ marginTop: 18 }}>
            <span className="playground-item-label">RecentTransactions — Lịch sử giao dịch ví</span>
            <RecentTransactions
              transactions={sampleTransactions}
              onViewChange={(v) => addToast({ type: 'info', title: 'Điều hướng', message: `Chuyển tới ${v}` })}
            />
          </div>
        </section>
      )}

      {/* ── 5. FEEDBACK & INTERACTION ──────────────────────────── */}
      {shouldShow('feedback') && (
        <section className="playground-section" id="feedback">
          <div className="playground-section-head">
            <h2>
              <Bell size={20} /> Tương tác & Phản hồi (Toast, Modal, Loading, ScrollReveal)
            </h2>
            <span className="playground-section-count">Modals & Notifications</span>
          </div>

          <div className="playground-grid-3">
            {/* Toast Triggers */}
            <div className="playground-card">
              <span className="playground-item-label">Hệ thống Toast Notification</span>
              <p>Thông báo nổi tự động biến mất sau 4.5s hoặc bấm để thực hiện hành động:</p>
              <div className="playground-row column" style={{ gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  className="playground-trigger-btn"
                  onClick={() => showToast('info')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Toast Info (Đơn hàng)
                </button>
                <button
                  type="button"
                  className="playground-trigger-btn success"
                  onClick={() => showToast('success')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Toast Success (Nạp tiền)
                </button>
                <button
                  type="button"
                  className="playground-trigger-btn error"
                  onClick={() => showToast('error')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Toast Error (Bảo mật)
                </button>
              </div>
            </div>

            {/* Modal Dialog */}
            <div className="playground-card">
              <span className="playground-item-label">Modal Dialog</span>
              <p>Pop-up có backdrop làm mờ, hỗ trợ phím ESC và click outside:</p>
              <div style={{ marginTop: 18 }}>
                <Button variant="primary" onClick={() => setModalOpen(true)}>
                  <Sparkles size={16} /> Mở Demo Modal
                </Button>
              </div>
            </div>

            {/* Loading Spinner */}
            <div className="playground-card">
              <span className="playground-item-label">Loading Indicator</span>
              <p>Màn hình chờ hoặc spinner cho các thao tác API bất đồng bộ:</p>
              <div style={{ marginTop: 18 }}>
                <Button variant="outline" onClick={() => setShowLoading(true)}>
                  <RefreshCw size={16} /> Bật Loading toàn màn hình
                </Button>
              </div>
            </div>
          </div>

          {/* ScrollReveal */}
          <div className="playground-card" style={{ marginTop: 18 }}>
            <span className="playground-item-label">ScrollReveal — Hiệu ứng xuất hiện khi cuộn</span>
            <div className="playground-grid-3" style={{ marginTop: 12 }}>
              {[1, 2, 3].map((i) => (
                <ScrollReveal key={i} delay={i * 120}>
                  <div
                    style={{
                      background: 'color-mix(in srgb, var(--kd-soft) 40%, var(--kd-card))',
                      padding: 18,
                      borderRadius: 12,
                      border: '1px solid var(--kd-border)',
                      textAlign: 'center',
                    }}
                  >
                    <PackageOpen size={24} style={{ color: 'var(--kd-blue)', marginBottom: 8 }} />
                    <strong style={{ display: 'block', fontSize: 14 }}>Thẻ hiển thị #{i}</strong>
                    <small style={{ color: 'var(--kd-muted)' }}>ScrollReveal tự kích hoạt hiệu ứng fade-up</small>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. RICH EDITOR ─────────────────────────────────────── */}
      {shouldShow('editor') && (
        <section className="playground-section" id="editor">
          <div className="playground-section-head">
            <h2>
              <MessageSquare size={20} /> Trình soạn thảo văn bản (RichEditor - CKEditor 5)
            </h2>
            <span className="playground-section-count">WYSIWYG Editor</span>
          </div>

          <div className="playground-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span className="playground-item-label">CKEditor 5 Classic Build</span>
                <p style={{ margin: 0 }}>Dùng trong viết bài Blog, mô tả dịch vụ và chính sách bảo hành.</p>
              </div>
              <Button variant="outline" onClick={() => setShowEditor((prev) => !prev)}>
                {showEditor ? 'Ẩn Editor' : 'Mở Editor thử nghiệm'}
              </Button>
            </div>

            {showEditor ? (
              <div style={{ marginTop: 14 }}>
                <RichEditor value={editorHtml} onChange={setEditorHtml} minHeight={220} />
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--kd-muted)' }}>
                  <strong>HTML Output preview:</strong> <code>{editorHtml.slice(0, 140)}...</code>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--kd-muted)', fontStyle: 'italic', margin: '10px 0 0' }}>
                Bấm nút "Mở Editor thử nghiệm" ở trên để load CKEditor 5.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Modal Instance */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Xác nhận cấp phát tài khoản">
        <div style={{ color: 'var(--kd-text)', lineHeight: 1.6 }}>
          <p>Bạn đang thử nghiệm mở component <strong>Modal</strong> trong KendyDigital.</p>
          <p style={{ color: 'var(--kd-muted)', fontSize: '0.9rem' }}>
            Hỗ trợ nút đóng X ở góc, bấm ra ngoài backdrop hoặc ấn phím <code>ESC</code> trên bàn phím để đóng.
          </p>
        </div>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setModalOpen(false)
              addToast({ type: 'success', title: 'Thành công', message: 'Đã xác nhận thao tác từ Modal' })
            }}
          >
            Đồng ý
          </Button>
        </div>
      </Modal>
    </div>
  )
}
