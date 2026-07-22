import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Terminal,
  ShieldAlert,
} from 'lucide-react'
import Button from '../../../../components/Button/Button'
import './TestimonialsSection.css'

function TestimonialsSection() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('auto') // 'auto' | 'manual'
  const [showPassword, setShowPassword] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [warrantySimulated, setWarrantySimulated] = useState(false)
  const [customOrderCode, setCustomOrderCode] = useState('')

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!customOrderCode.trim()) return

    const query = customOrderCode.trim().toUpperCase()
    // Simulate lookup
    if (query.includes('FB') || query.includes('ADS') || query.includes('PAGE') || query.includes('BM')) {
      setActiveTab('manual')
    } else {
      setActiveTab('auto')
    }
  }

  return (
    <section className="public-section proof-section" id="proof">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">{t('public.proof.eyebrow', { defaultValue: 'Trải nghiệm minh bạch' })}</span>
          <h2>{t('public.proof.title', { defaultValue: 'Theo dõi & Nhận bàn giao đơn hàng thời gian thực' })}</h2>
        </div>
        <p>
          {t('public.proof.description', { defaultValue: 'Để đảm bảo tuyệt đối bảo mật, hệ thống không hiển thị đơn hàng thật từ database lên public site. Dưới đây là mô phỏng cách bạn quản lý, theo dõi tiến độ và nhận kết quả đơn hàng ngay sau khi thanh toán.' })}
        </p>
      </div>

      <div className="simulator-container">
        {/* Search simulation */}
        <div className="simulator-search-bar">
          <form onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <Terminal size={18} className="terminal-icon" />
              <input
                type="text"
                placeholder={t('public.proof.searchPlaceholder', { defaultValue: 'Nhập mã đơn hàng bất kỳ để tra cứu thử (Ví dụ: OD-CAPCUT-12M, OD-FBADS-99)...' })}
                value={customOrderCode}
                onChange={(e) => setCustomOrderCode(e.target.value)}
              />
              <Button type="submit" variant="dark" className="slim">
                <span>{t('public.proof.searchBtn', { defaultValue: 'Tra cứu thử' })}</span>
              </Button>
            </div>
          </form>
          <p className="search-tip">
            {t('public.proof.searchTip', { defaultValue: "💡 Gợi ý: Các mã chứa 'FB' hoặc 'ADS' sẽ mô phỏng dịch vụ Setup thủ công; các mã khác sẽ mô phỏng Gói tài khoản giao tự động." })}
          </p>
        </div>

        {/* Simulator Content Area */}
        <div className="simulator-box">
          {/* Tabs header */}
          <div className="simulator-tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'auto' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('auto')
              }}
            >
              <span>{t('public.proof.tabAuto', { defaultValue: '1. Đơn hàng tài khoản tự động (CapCut, ChatGPT...)' })}</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('manual')
              }}
            >
              <span>{t('public.proof.tabManual', { defaultValue: '2. Dịch vụ setup quảng cáo (Facebook Ads, BM...)' })}</span>
            </button>
          </div>

          <div className="simulator-body">
            {activeTab === 'auto' ? (
              <div className="sim-panel auto-panel">
                <div className="sim-order-header">
                  <div>
                    <span className="sim-badge success">{t('status.COMPLETED', { defaultValue: 'HOÀN THÀNH' })}</span>
                    <h3>{t('public.proof.orderTitle', { defaultValue: 'Đơn hàng:' })} {customOrderCode ? customOrderCode.toUpperCase() : 'OD-CAPCUT-MOCK77'}</h3>
                  </div>
                  <div className="sim-order-meta">
                    <span>{t('public.proof.timeAuto', { defaultValue: 'Thời gian hoàn thành: 2 phút trước' })}</span>
                    <span>{t('public.proof.serviceLabel', { defaultValue: 'Dịch vụ:' })} <b>{t('public.proof.serviceAuto', { defaultValue: 'CapCut Pro 12 Tháng' })}</b></span>
                  </div>
                </div>

                <div className="sim-grid">
                  {/* Timeline */}
                  <div className="sim-timeline">
                    <h4>{t('public.proof.flowTitle', { defaultValue: 'Hành trình đơn hàng' })}</h4>
                    <div className="timeline-steps">
                      <div className="step done">
                        <div className="step-circle"><CheckCircle2 size={16} /></div>
                        <div className="step-content">
                          <strong>{t('public.proof.stepInit', { defaultValue: 'Khởi tạo đơn hàng' })}</strong>
                          <span>{t('public.proof.stepInitDesc', { defaultValue: 'Hệ thống ghi nhận yêu cầu nạp gói' })}</span>
                        </div>
                      </div>
                      <div className="step done">
                        <div className="step-circle"><CheckCircle2 size={16} /></div>
                        <div className="step-content">
                          <strong>{t('public.proof.stepPaid', { defaultValue: 'Thanh toán thành công' })}</strong>
                          <span>{t('public.proof.stepPaidDesc', { defaultValue: 'Ví điện tử / QR chuyển khoản được đối soát' })}</span>
                        </div>
                      </div>
                      <div className="step active">
                        <div className="step-circle"><ShieldCheck size={16} /></div>
                        <div className="step-content">
                          <strong>{t('public.proof.stepDelivered', { defaultValue: 'Đã giao tài khoản tự động' })}</strong>
                          <span>{t('public.proof.stepDeliveredDesc', { defaultValue: 'Thông tin tài khoản được trích xuất từ kho' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Credentials / Delivery box */}
                  <div className="sim-delivery-box">
                    <div className="box-header">
                      <h4>{t('public.proof.deliveryTitle', { defaultValue: 'Thông tin tài khoản bàn giao' })}</h4>
                      <span className="secure-badge">{t('public.proof.deliverySecure', { defaultValue: 'Mã hóa AES-GCM' })}</span>
                    </div>

                    <div className="cred-fields">
                      <div className="cred-row">
                        <span className="label">{t('public.proof.labelUsername', { defaultValue: 'Tài khoản (Email)' })}</span>
                        <div className="value-copy">
                          <code>kendy_customer_vip@gmail.com</code>
                          <button type="button" onClick={() => handleCopy('kendy_customer_vip@gmail.com')} title="Copy">
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="cred-row">
                        <span className="label">{t('public.proof.labelPassword', { defaultValue: 'Mật khẩu' })}</span>
                        <div className="value-copy">
                          <code>{showPassword ? 'KendySecurePass999!' : '••••••••••••'}</code>
                          <div className="cred-actions">
                            <button type="button" onClick={() => setShowPassword(!showPassword)} title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}>
                              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button type="button" onClick={() => handleCopy('KendySecurePass999!')} title="Copy">
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="cred-row">
                        <span className="label">{t('public.proof.labelRecovery', { defaultValue: 'Mã khôi phục (Recovery)' })}</span>
                        <div className="value-copy">
                          <code>RC-9988-7766-5544</code>
                          <button type="button" onClick={() => handleCopy('RC-9988-7766-5544')} title="Copy">
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="cred-row">
                        <span className="label">{t('public.proof.label2FA', { defaultValue: 'Mã bảo mật (2FA Code)' })}</span>
                        <div className="value-copy">
                          <code>JBSWY3DPEHPK3PXP</code>
                          <button type="button" onClick={() => handleCopy('JBSWY3DPEHPK3PXP')} title="Copy Key">
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="sim-warranty-notes">
                      <div>
                        <span>{t('public.proof.expiresAt', { date: '16/06/2027', defaultValue: 'Hạn tài khoản: 16/06/2027' })}</span>
                        <span>{t('public.proof.warrantyUntil', { date: '23/06/2026', defaultValue: 'Bảo hành đến: 23/06/2026 (Còn 7 ngày)' })}</span>
                      </div>
                    </div>

                    {/* Warranty Simulation Button */}
                    <div className="warranty-sim-btn-wrapper">
                      {!warrantySimulated ? (
                        <button
                          type="button"
                          className="order-warranty-button"
                          onClick={() => setWarrantySimulated(true)}
                        >
                          <ShieldAlert size={16} />
                          <span>{t('public.proof.warrantyBtn', { defaultValue: 'Yêu cầu bảo hành / Đổi tài khoản (Thử nghiệm)' })}</span>
                        </button>
                      ) : (
                        <div className="warranty-feedback success animate-fade-in">
                          <CheckCircle2 size={16} />
                          <span>{t('public.proof.warrantyFeedback', { defaultValue: '<b>Hệ thống tự động:</b> Yêu cầu đã nhận! Một tài khoản CapCut mới sẽ được xuất kho và đổi trực tiếp cho bạn trên giao diện này trong vòng 5 giây.' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="sim-panel manual-panel">
                <div className="sim-order-header">
                  <div>
                    <span className="sim-badge warning">{t('status.PROCESSING', { defaultValue: 'ĐANG XỬ LÝ' })}</span>
                    <h3>{t('public.proof.orderTitle', { defaultValue: 'Đơn hàng:' })} {customOrderCode ? customOrderCode.toUpperCase() : 'OD-FBADS-MOCK88'}</h3>
                  </div>
                  <div className="sim-order-meta">
                    <span>{t('public.proof.timeManual', { defaultValue: 'Thời hạn cam kết xử lý: Trước 18:00 hôm nay' })}</span>
                    <span>{t('public.proof.serviceLabel', { defaultValue: 'Dịch vụ:' })} <b>{t('public.proof.serviceManual', { defaultValue: 'Setup chiến dịch Facebook Ads' })}</b></span>
                  </div>
                </div>

                <div className="sim-grid">
                  {/* Timeline & Checklist */}
                  <div className="sim-timeline">
                    <h4>{t('public.proof.flowManualTitle', { defaultValue: 'Quy trình xử lý thủ công của Admin' })}</h4>
                    <div className="timeline-steps">
                      <div className="step done">
                        <div className="step-circle"><CheckCircle2 size={16} /></div>
                        <div className="step-content">
                          <strong>{t('public.proof.stepAdminBrief', { defaultValue: 'Admin tiếp nhận Brief (Hôm qua)' })}</strong>
                          <span>{t('public.proof.stepAdminBriefDesc', { defaultValue: 'Xác minh fanpage và ngân sách khách hàng' })}</span>
                        </div>
                      </div>
                      <div className="step done">
                        <div className="step-circle"><CheckCircle2 size={16} /></div>
                        <div className="step-content">
                          <strong>{t('public.proof.stepAdminSetup', { defaultValue: 'Cài đặt tài khoản & Share pixel (Sáng nay)' })}</strong>
                          <span>{t('public.proof.stepAdminSetupDesc', { defaultValue: 'Hoàn thành liên kết tài khoản quảng cáo BM' })}</span>
                        </div>
                      </div>
                      <div className="step active">
                        <div className="step-circle"><Clock size={16} /></div>
                        <div className="step-content">
                          <strong>{t('public.proof.stepAdminCamp', { defaultValue: 'Đang setup chiến dịch (Đang xử lý)' })}</strong>
                          <span>{t('public.proof.stepAdminCampDesc', { defaultValue: 'Thiết lập nhóm đối tượng mục tiêu và tối ưu bài viết' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="checklist-box">
                      <h5>{t('public.proof.checklistTitle', { defaultValue: 'Checklist tiến độ xử lý đơn' })}</h5>
                      <ul>
                        <li className="done">
                          <span className="check-box">[✓]</span> {t('public.proof.checkBrief', { defaultValue: 'Nhận thông tin fanpage & ngân sách' })}
                        </li>
                        <li className="done">
                          <span className="check-box">[✓]</span> {t('public.proof.checkPixel', { defaultValue: 'Cấu hình pixel & chia sẻ tài nguyên quảng cáo' })}
                        </li>
                        <li className="doing">
                          <span className="check-box">[▸]</span> {t('public.proof.checkTarget', { defaultValue: 'Tải nội dung & setup nhóm đối tượng mục tiêu' })}
                        </li>
                        <li className="pending">
                          <span className="check-box">[ ]</span> {t('public.proof.checkPolicy', { defaultValue: 'Kiểm tra chính sách & bật quảng cáo chính thức' })}
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Chat / Ticket box simulation */}
                  <div className="sim-chat-box">
                    <div className="box-header">
                      <h4>{t('public.proof.ticketTitle', { defaultValue: 'Trao đổi trực tiếp (Ticket hỗ trợ đơn hàng)' })}</h4>
                      <span className="ticket-badge">{t('public.proof.ticketCode', { defaultValue: 'Ticket #TK-FBADS-99' })}</span>
                    </div>

                    <div className="chat-messages">
                      <div className="msg admin">
                        <div className="msg-meta">
                          <strong>{t('public.proof.adminRole', { defaultValue: 'Admin Hỗ trợ' })}</strong>
                          <span>Hôm qua, 15:30</span>
                        </div>
                        <div className="msg-text">
                          {t('public.proof.adminMsg1', { defaultValue: 'Chào anh/chị, em đã tiếp nhận brief chiến dịch Facebook Ads. Em đã kiểm tra fanpage của mình hoàn toàn đủ điều kiện chạy. Anh/chị vui lòng xác nhận giúp em ngân sách chạy hàng ngày là 500k đúng không ạ?' })}
                        </div>
                      </div>

                      <div className="msg user">
                        <div className="msg-meta">
                          <strong>{t('public.proof.userRole', { defaultValue: 'Bạn (Khách hàng)' })}</strong>
                          <span>Hôm qua, 15:42</span>
                        </div>
                        <div className="msg-text">
                          {t('public.proof.userMsg1', { defaultValue: 'Đúng rồi em nhé, ngân sách là 500k/ngày. Nhóm target nhớ loại trừ các đơn vị vận chuyển hoặc clone ra giúp anh nhé để tối ưu tệp.' })}
                        </div>
                      </div>

                      <div className="msg admin">
                        <div className="msg-meta">
                          <strong>{t('public.proof.adminRole', { defaultValue: 'Admin Hỗ trợ' })}</strong>
                          <span>Hôm qua, 16:00</span>
                        </div>
                        <div className="msg-text">
                          {t('public.proof.adminMsg2', { defaultValue: 'Dạ vâng, em đã ghi chú và loại trừ tệp clone cũng như các đơn vị vận chuyển rồi ạ. Em bắt đầu setup chiến dịch, khi nào lên camp xong em báo trên tiến độ này nhé!' })}
                        </div>
                      </div>
                    </div>

                    <div className="chat-input-simulation">
                      <input type="text" placeholder={t('public.proof.chatPlaceholder', { defaultValue: 'Nhập tin nhắn phản hồi admin (Mô phỏng)...' })} disabled />
                      <Button type="button" variant="dark" className="slim" disabled>
                        <span>{t('public.proof.chatSend', { defaultValue: 'Gửi' })}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {copiedText && (
          <div className="toast-notification animate-slide-up">
            <span>{t('public.proof.copiedToast', { defaultValue: '✓ Đã copy vào bộ nhớ tạm!' })}</span>
          </div>
        )}
      </div>
    </section>
  )
}

export default TestimonialsSection
