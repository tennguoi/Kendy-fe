import { useState } from 'react'

const sections = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'users', label: 'Người dùng' },
  { id: 'services', label: 'Dịch vụ' },
  { id: 'pricing', label: 'Bảng giá' },
  { id: 'account-inventory', label: 'Kho tài khoản' },
  { id: 'assigned-accounts', label: 'Tài khoản đã cấp' },
  { id: 'orders', label: 'Đơn hàng' },
  { id: 'finance', label: 'Tài chính' },
  { id: 'coupons', label: 'Coupon' },
  { id: 'warranty', label: 'Bảo hành' },
  { id: 'tickets', label: 'Ticket & Hỗ trợ' },
  { id: 'content', label: 'Website' },
  { id: 'settings', label: 'Cài đặt hệ thống' },
  { id: 'workflow', label: 'Quy trình nghiệp vụ' },
  { id: 'user-guide', label: 'Hướng dẫn người dùng' },
  { id: 'security', label: 'Bảo mật' },
  { id: 'troubleshooting', label: 'Xử lý sự cố' },
  { id: 'profile', label: 'Hồ sơ admin' },
]

function GuideTab() {
  const [activeSection, setActiveSection] = useState('dashboard')

  return (
    <div className="admin-guide-layout">
      <nav className="admin-guide-nav">
        {sections.map((s) => (
          <button
            type="button"
            key={s.id}
            className={activeSection === s.id ? 'active' : ''}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="admin-guide-content">
        {activeSection === 'dashboard' && (
          <div>
            <h3>Tổng quan hệ thống</h3>
            <p>
              Dashboard là màn hình trung tâm hiển thị các chỉ số vận hành cốt lõi. Admin có thể nắm bắt
              nhanh tình hình kinh doanh và phát hiện bất thường cần xử lý.
            </p>

            <h4>Chỉ số tổng quan (Metric Cards)</h4>
            <ul>
              <li><strong>Doanh thu</strong> – Hôm nay + tháng này, kèm biểu đồ area 14 ngày.</li>
              <li><strong>Đơn hàng</strong> – Tổng đơn hôm nay + tỉ lệ hoàn thành (biểu đồ donut).</li>
              <li><strong>Người dùng mới</strong> – Hôm nay + tháng này.</li>
              <li><strong>Ticket chờ</strong> – Ticket <code>OPEN</code> hoặc <code>PENDING_ADMIN</code> cần xử lý.</li>
              <li><strong>Giao dịch ngân hàng</strong> – Số giao dịch cần kiểm tra thủ công.</li>
              <li><strong>Nợ ví</strong> – Tổng số dư ví của tất cả user (wallet liability).</li>
            </ul>

            <h4>Biểu đồ & Báo cáo</h4>
            <ul>
              <li><strong>Doanh thu 14 ngày</strong> – Biểu đồ area, xem xu hướng tăng trưởng.</li>
              <li><strong>Nạp tiền 7 ngày</strong> – Biểu đồ sparkline, xem khối lượng nạp.</li>
              <li><strong>Đơn hàng</strong> – Biểu đồ sparkline tăng trưởng đơn hàng.</li>
              <li><strong>Chất lượng đơn hàng</strong> – Tỉ lệ hoàn thành / thất bại.</li>
              <li><strong>Ngân hàng</strong> – Giao dịch thành công / chờ / thất bại (bar chart).</li>
            </ul>

            <h4>Top & Cảnh báo</h4>
            <ul>
              <li><strong>Top khách hàng</strong> – Xếp hạng doanh thu theo user.</li>
              <li><strong>Top dịch vụ bán chạy</strong> – Service có doanh thu cao nhất.</li>
              <li><strong>Kho sắp hết</strong> – Dịch vụ ACCOUNT_STOCK sắp hết credential.</li>
              <li><strong>Credential sắp hết hạn</strong> – Cảnh báo credential sắp expiry.</li>
              <li><strong>Đơn cần xử lý thủ công</strong> – Đơn MANUAL đang PROCESSING.</li>
              <li><strong>Yêu cầu bảo hành mới</strong> – Warranty request OPEN.</li>
            </ul>

            <h4>Hoạt động gần đây (Activity Feed)</h4>
            <ul>
              <li>Luồng audit log real-time: ai làm gì, lúc nào.</li>
              <li>Hiển thị các thao tác admin gần đây nhất.</li>
            </ul>

            <h4>Thao tác nhanh (Quick Actions)</h4>
            <ul>
              <li>Tạo dịch vụ mới, tạo danh mục, nạp tiền thủ công, xử lý ticket.</li>
              <li>Click vào thẻ chỉ số để điều hướng nhanh đến trang quản lý.</li>
              <li>Nút <strong>Tải lại</strong> làm mới dữ liệu.</li>
            </ul>

            <div className="admin-guide-note">
              <strong>Lưu ý:</strong> Dữ liệu dashboard real-time từ database. Nếu số liệu sai lệch,
              hãy làm mới trang. Tất cả chỉ số tài chính bằng VND.
            </div>

            <div className="admin-guide-info">
              <strong>Ví dụ:</strong> Sáng 9h thấy "Đơn cần xử lý thủ công" = 5 → click vào thẻ đó để
              vào thẳng danh sách đơn PROCESSING và bắt đầu xử lý. Thấy "Kho sắp hết" báo service
              "Netflix Premium" còn 2 credential → vào Kho tài khoản nhập thêm ngay.
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div>
            <h3>Quản lý Người dùng & Tài khoản Hệ thống</h3>
            <p>
              Hệ thống quản lý người dùng là trung tâm kiểm soát toàn bộ các tài khoản của khách hàng và admin phụ.
              Admin có quyền kiểm tra hồ sơ, thay đổi trạng thái hoạt động, điều chỉnh tài chính và kiểm soát phiên đăng nhập của người dùng.
            </p>

            <h4>1. Vòng đời và Trạng thái Tài khoản Người dùng</h4>
            <ul>
              <li>
                <code>ACTIVE</code> (Hoạt động): Tài khoản có quyền đăng nhập đầy đủ, thực hiện giao dịch nạp tiền, mua dịch vụ, và gửi yêu cầu hỗ trợ.
              </li>
              <li>
                <code>PENDING_VERIFY</code> (Chờ xác minh): Tài khoản vừa đăng ký qua Email/Mật khẩu nhưng chưa nhấn vào link xác minh gửi qua hòm thư. Tài khoản này bị giới hạn một số tính năng (ví dụ: không được tạo API key hoặc bị giới hạn số tiền nạp).
              </li>
              <li>
                <code>LOCKED</code> (Bị khóa tạm thời): Tài khoản bị chặn quyền đăng nhập. Khi cố gắng đăng nhập, hệ thống sẽ hiển thị lý do khóa mà admin đã nhập. Thường dùng khi phát hiện gian lận, spam ticket hoặc vi phạm điều khoản sử dụng.
              </li>
              <li>
                <code>DISABLED</code> (Vô hiệu hóa vĩnh viễn): Tài khoản bị ngừng hoạt động hoàn toàn và không thể khôi phục tự động. Tất cả các API Key liên quan đều bị vô hiệu hóa.
              </li>
            </ul>

            <h4>2. Các Thao tác Quản trị và Hướng dẫn Chi tiết</h4>
            <ul>
              <li>
                <strong>Khóa / Mở khóa tài khoản:</strong>
                <ul>
                  <li>Cách thực hiện: Tại dòng của User, click icon <code>MoreHorizontal (⋮)</code> → Chọn "Khóa tài khoản" hoặc "Mở khóa".</li>
                  <li>Yêu cầu bắt buộc: Phải nhập lý do chi tiết. Lý do này được ghi nhận trực tiếp vào Nhật ký hoạt động (Audit log) và hiển thị cho người dùng ngoài trang đăng nhập.</li>
                </ul>
              </li>
              <li>
                <strong>Điều chỉnh số dư ví (Wallet Adjustment):</strong>
                <ul>
                  <li>Mục đích: Khắc phục lỗi thanh toán, cộng tiền khuyến mãi sự kiện hoặc thu hồi công nợ.</li>
                  <li>Cách thực hiện: Chọn "Công cụ" từ menu phụ của User → Chọn "Điều chỉnh số dư". Nhập số tiền (dương để cộng thêm, âm để trừ đi) và nhập lý do giao dịch.</li>
                  <li>Lưu ý: Hệ thống sẽ tự động tạo một giao dịch ví có loại <code>ADJUSTMENT</code> để làm bằng chứng đối soát tài chính. Không bao giờ thay đổi số dư trực tiếp trong cơ sở dữ liệu mà không thông qua thao tác này.</li>
                </ul>
              </li>
              <li>
                <strong>Quản lý Quyền và Vai trò (Role Assignment):</strong>
                <ul>
                  <li>Hệ thống hỗ trợ 2 vai trò chính: <code>USER</code> (Khách hàng) và <code>ADMIN</code> (Quản trị viên).</li>
                  <li>Chỉ <code>SUPER_ADMIN</code> mới có quyền nâng cấp hoặc hạ cấp quyền admin của tài khoản khác. Mọi thao tác đổi vai trò đều bắt buộc ghi rõ lý do bảo mật.</li>
                </ul>
              </li>
              <li>
                <strong>Giám sát và Thu hồi Phiên đăng nhập (Session Management):</strong>
                <ul>
                  <li>Admin có thể xem danh sách các thiết bị, địa chỉ IP và thời gian đăng nhập gần nhất của user.</li>
                  <li>Nếu nghi ngờ tài khoản bị lộ mật khẩu hoặc bị hack, bấm "Thu hồi phiên" cụ thể hoặc "Thu hồi tất cả phiên" để bắt buộc user đăng xuất trên toàn bộ thiết bị.</li>
                </ul>
              </li>
            </ul>

            <h4>3. Ví dụ Thực tế trong Vận hành Hằng ngày</h4>
            <div className="admin-guide-info">
              <strong>Ví dụ 1 (Xử lý khiếu nại tài khoản bị khóa):</strong> Khách hàng liên hệ qua Telegram báo: "Tài khoản của tôi tự dưng bị khóa không đăng nhập được".
              <br />
              <em>Quy trình xử lý:</em>
              <ol>
                <li>Vào menu <strong>Người dùng</strong> → Tìm kiếm email của khách hàng.</li>
                <li>Thấy trạng thái là <code>LOCKED</code>. Xem Panel chi tiết bên phải → Tab <strong>Audit logs</strong> thấy ghi: "Khóa bởi Admin X ngày 18/06/2026. Lý do: Spam liên tục 10 ticket hỗ trợ cùng nội dung".</li>
                <li>Hỏi rõ khách hàng và nhắc nhở không spam. Sau khi thống nhất, bấm "Mở khóa", nhập lý do: "Khách hàng cam kết không tái phạm spam ticket". Tài khoản trở lại trạng thái <code>ACTIVE</code> ngay lập tức.</li>
              </ol>
            </div>

            <div className="admin-guide-info">
              <strong>Ví dụ 2 (Cộng tiền đền bù / Điều chỉnh số dư):</strong> Khách hàng báo nạp 100,000 VND nhưng do lỗi ngân hàng bảo trì nên SePay không tự khớp, đồng thời khách hàng bị lỡ đợt khuyến mãi 10%.
              <br />
              <em>Quy trình xử lý:</em>
              <ol>
                <li>Vào mục <strong>Người dùng</strong> → Tìm tài khoản khách hàng.</li>
                <li>Bấm <code>⋮</code> → Chọn <strong>Công cụ</strong> → <strong>Điều chỉnh số dư</strong>.</li>
                <li>Nhập số tiền: <code>110000</code> (bao gồm 100k tiền gốc và 10k đền bù khuyến mãi).</li>
                <li>Nhập lý do: "Cộng tiền nạp thủ công + 10% khuyến mãi do SePay lỗi khớp muộn".</li>
                <li>Nhấn Xác nhận. Hệ thống cộng tiền và ghi nhận giao dịch ví loại <code>ADJUSTMENT</code> để báo cáo tài chính cuối tháng.</li>
              </ol>
            </div>

            <div className="admin-guide-info">
              <strong>Ví dụ 3 (Ngăn chặn xâm nhập trái phép):</strong> User báo nhận được email cảnh báo đăng nhập lạ từ địa chỉ IP ở quốc gia khác.
              <br />
              <em>Quy trình xử lý:</em>
              <ol>
                <li>Tìm kiếm tài khoản User đó trong danh sách quản lý.</li>
                <li>Mở tab <strong>Phiên đăng nhập</strong> ở panel chi tiết. Phát hiện có 1 phiên hoạt động từ thiết bị Chrome trên Linux ở IP lạ.</li>
                <li>Nhấn nút <strong>Thu hồi phiên (Revoke)</strong> bên cạnh phiên đó để đá kẻ gian ra khỏi tài khoản.</li>
                <li>Bấm <strong>Khóa tài khoản</strong> tạm thời và gửi email yêu cầu khách hàng reset mật khẩu và bật 2FA trước khi được admin mở khóa lại.</li>
              </ol>
            </div>
          </div>
        )}

        {activeSection === 'services' && (
          <div>
            <h3>Quản lý Dịch vụ</h3>
            <p>Dịch vụ định nghĩa sản phẩm khách có thể xem và mua. Màn hình hiện có hai lối tạo nhanh: <strong>Dịch vụ thường</strong> và <strong>Sản phẩm giao tài khoản</strong>.</p>

            <h4>Loại dịch vụ đang cấu hình được trên giao diện</h4>
            <ul>
              <li><code>MANUAL</code>: đơn được tạo ở trạng thái <code>PROCESSING</code>, có ticket hỗ trợ đi kèm và admin xử lý thủ công.</li>
              <li><code>ACCOUNT_STOCK</code>: lấy đúng một credential trong kho cho mỗi đơn và tự hoàn thành sau khi giao.</li>
              <li><code>AUTO</code>, <code>SUBSCRIPTION</code>, <code>API_CREDIT</code>: có thể chọn trong form, nhưng không sử dụng kho credential của <code>ACCOUNT_STOCK</code>.</li>
            </ul>

            <h4>Các tab trong form dịch vụ</h4>
            <ul>
              <li><strong>Cơ bản:</strong> tên, slug, danh mục, trạng thái, tình trạng kho, CTA, ảnh, nổi bật và hiển thị công khai.</li>
              <li><strong>Giá & Cam kết:</strong> giá bán, giá hiển thị, giá vốn, badge, thời gian xử lý và chính sách bảo hành.</li>
              <li><strong>Nội dung:</strong> mô tả, yêu cầu đầu vào, lợi ích và lưu ý sử dụng.</li>
              <li><strong>SEO:</strong> meta title và meta description.</li>
              <li><strong>Đơn hàng:</strong> chỉ xuất hiện sau khi dịch vụ đã được lưu.</li>
              <li><strong>Tài khoản cấp khách:</strong> chỉ dùng được với <code>ACCOUNT_STOCK</code> đã lưu; phần này chỉ tra cứu nhanh và dẫn sang Kho tài khoản.</li>
            </ul>

            <h4>Ví dụ đúng: tạo sản phẩm giao tài khoản</h4>
            <ol>
              <li>Vào <strong>Dịch vụ</strong> → <strong>Tạo mới</strong> → <strong>Sản phẩm giao tài khoản</strong>.</li>
              <li>Ở tab <strong>Cơ bản</strong>, nhập tên và slug; chọn trạng thái <code>ACTIVE</code>, CTA <code>BUY_NOW</code> và bật <strong>Hiển thị công khai</strong> nếu muốn bán ngay.</li>
              <li>Ở tab <strong>Giá & Cam kết</strong>, nhập giá bán lớn hơn 0; bổ sung giá vốn, thời gian xử lý và bảo hành nếu cần.</li>
              <li>Nhấn <strong>Lưu</strong>. Khi chưa có credential khả dụng, dịch vụ không thể tạo đơn mua thành công.</li>
              <li>Chuyển sang <strong>Kho tài khoản</strong>, chọn đúng dịch vụ vừa tạo và nhập credential.</li>
            </ol>

            <h4>Ví dụ đúng: tạm dừng bán</h4>
            <div className="admin-guide-info">
              Mở dịch vụ cần dừng → đổi trạng thái thành <code>MAINTENANCE</code> hoặc <code>INACTIVE</code>, hoặc tắt <strong>Hiển thị công khai</strong> → nhấn <strong>Lưu</strong>. Backend chỉ cho mua khi dịch vụ ở <code>ACTIVE</code>, CTA là <code>BUY_NOW</code> và tình trạng kho không phải <code>OUT_OF_STOCK</code>/<code>CONSULTING_ONLY</code>.
            </div>
          </div>
        )}

        {activeSection === 'pricing' && (
          <div>
            <h3>Quản lý Bảng giá</h3>
            <p>
              Trang này cho phép admin quản lý nhanh giá bán, giá vốn và trạng thái hiển thị thương mại của tất cả dịch vụ trong hệ thống thông qua giao diện bảng chỉnh sửa nhanh (inline edit).
            </p>

            <h4>Các trường quản lý nhanh</h4>
            <ul>
              <li><strong>Giá bán (price):</strong> Số tiền thực tế trừ vào tài khoản khách hàng khi đặt đơn hàng.</li>
              <li><strong>Giá vốn (costPrice):</strong> Dữ liệu nội bộ để phục vụ tính toán doanh thu thuần và lợi nhuận thực tế. Khách hàng hoàn toàn không nhìn thấy trường này.</li>
              <li><strong>Badge khuyến mãi (pricingBadge):</strong> Nhãn nhỏ hiển thị nổi bật trên góc thẻ sản phẩm (ví dụ: "Bán chạy", "Giảm 30%", "New").</li>
              <li><strong>Nổi bật (featured):</strong> Đưa sản phẩm lên mục tiêu điểm trên trang chủ để kích thích mua sắm.</li>
              <li><strong>Hiển thị (publicVisible):</strong> Bật tắt nhanh việc hiển thị sản phẩm trên danh mục công khai.</li>
            </ul>

            <div className="admin-guide-note">
              <strong>Mẹo vận hành:</strong> Khi chạy chiến dịch Flash Sale, hãy đổi giá bán trực tiếp trên bảng này, đồng thời nhập badge <code>SALE 50%</code> và tích chọn <code>featured</code> để sản phẩm lập tức hiển thị thu hút trên trang chủ.
            </div>

            <div className="admin-guide-info">
              <strong>Ví dụ thực tế:</strong> Admin muốn giảm giá nhanh gói "Canva Pro 1 năm" từ 240,000 VND xuống 180,000 VND nhân ngày tựu trường.
              Admin truy cập Bảng giá → Tìm "Canva Pro" → Click vào ô giá bán sửa thành <code>180000</code> → Click ô badge nhập <code>STUDENT SALE</code> → Nhấn lưu. Sản phẩm ngoài trang chủ lập tức thay đổi giao diện bắt mắt.
            </div>
          </div>
        )}

        {activeSection === 'account-inventory' && (
          <div>
            <h3>Kho tài khoản</h3>
            <p>Kho chỉ chứa credential của dịch vụ <code>ACCOUNT_STOCK</code>. Mỗi credential thuộc đúng một dịch vụ và chỉ được giao cho một đơn hàng.</p>

            <h4>Trường dữ liệu</h4>
            <ul>
              <li><strong>Tài khoản đăng nhập</strong> và <strong>Mật khẩu</strong> là bắt buộc khi tạo mới.</li>
              <li><strong>Thông tin khôi phục</strong>, <strong>Mã/secret 2FA</strong>, <strong>Hạn tài khoản</strong>, <strong>Bảo hành đến</strong>, <strong>Hướng dẫn cho khách</strong> và <strong>Ghi chú nội bộ</strong> là tùy chọn.</li>
              <li>Mật khẩu, recovery và 2FA được lưu mã hóa. Nút <strong>Xem</strong> gọi API reveal có kiểm tra quyền và ghi audit log.</li>
              <li>Hệ thống chặn trùng tài khoản đăng nhập hoặc payload credential trong cùng một dịch vụ.</li>
            </ul>

            <h4>Trạng thái credential</h4>
            <ul>
              <li><code>AVAILABLE</code>: có thể cấp cho đơn mới.</li>
              <li><code>RESERVED</code>: đang giữ cho một checkout chuyển khoản; hết hạn hoặc hủy checkout sẽ trả về <code>AVAILABLE</code>.</li>
              <li><code>DELIVERED</code>: đã gắn với một đơn và một khách hàng.</li>
              <li><code>REPLACED</code>: credential cũ đã được thay trong quy trình bảo hành.</li>
              <li><code>REFUNDED</code>: đơn chứa credential đã được refund.</li>
              <li><code>DISABLED</code>: admin khóa credential chưa giao. Không thể khóa trực tiếp credential đang <code>RESERVED</code> hoặc <code>DELIVERED</code>.</li>
              <li><code>EXPIRED</code>: credential hết hạn.</li>
            </ul>

            <h4>Nhập một tài khoản</h4>
            <ol>
              <li>Chọn <strong>Dịch vụ giao tài khoản</strong> ở bộ lọc đầu trang.</li>
              <li>Nhấn <strong>Tạo mới</strong> → <strong>Nhập một tài khoản</strong>.</li>
              <li>Nhập tài khoản, mật khẩu và thông tin tùy chọn → nhấn <strong>Nhập vào kho</strong>.</li>
              <li>Credential mới ở trạng thái <code>AVAILABLE</code>. Nếu dịch vụ đang hết hàng, backend đồng bộ lại tình trạng kho khi có hàng khả dụng.</li>
            </ol>

            <h4>Import CSV hiện tại</h4>
            <p>Giao diện hiện nhận <strong>nội dung CSV dán vào textarea</strong>, không có nút tải file lên.</p>
            <div className="admin-guide-code">login,password,recovery,twoFactor,hướng dẫn,ghi chú</div>
            <div className="admin-guide-code">
              netflix01@example.com,Pass123,recovery@example.com,,Dùng profile 1,Nguồn A<br />
              netflix02@example.com,Pass456,,,Không đổi mật khẩu,Nguồn A
            </div>
            <ol>
              <li>Chọn đúng dịch vụ.</li>
              <li>Nhấn <strong>Tạo mới</strong> → <strong>Import CSV</strong>.</li>
              <li>Dán các dòng CSV vào ô nội dung → nhấn <strong>Import</strong>.</li>
              <li>Import đang bật chế độ bỏ qua trùng lặp; kết quả thông báo số dòng đã tạo và số dòng bị bỏ qua.</li>
            </ol>

            <div className="admin-guide-note">
              <strong>Lưu ý:</strong> Màn Kho tài khoản quản lý cả credential chưa giao và đã giao. Chỉ credential <code>AVAILABLE</code> mới hiện nút Sửa/Khóa; thông tin đã cấp nên tra cứu thêm tại mục <strong>Tài khoản đã cấp</strong> hoặc chi tiết đơn hàng.
            </div>
          </div>
        )}

        {activeSection === 'assigned-accounts' && (
          <div>
            <h3>Tài khoản đã cấp</h3>
            <p>Đây là màn tra cứu các credential đã từng gắn với khách hàng. Mỗi dòng tương ứng một credential, một khách hàng và tối đa một đơn hàng.</p>

            <h4>Dữ liệu hiển thị</h4>
            <ul>
              <li>Khách hàng: tên, email và số điện thoại nếu có.</li>
              <li>Dịch vụ và tài khoản đăng nhập đã giao.</li>
              <li>Mã đơn hàng, ngày giao, ngày hết hạn và trạng thái credential.</li>
              <li>Nút <strong>Xem</strong> chỉ hiện/ẩn mật khẩu đã giải mã. Màn này không sửa credential và không thực hiện đổi bảo hành.</li>
            </ul>

            <h4>Tìm kiếm và bộ lọc thực tế</h4>
            <ul>
              <li>Ô tìm kiếm hỗ trợ tên/email/SĐT khách hàng, login credential, tên dịch vụ và mã đơn hàng.</li>
              <li>Lọc theo trạng thái: đã cấp, đã thay thế, đã hoàn tiền hoặc hết hạn.</li>
              <li>Lọc theo khoảng ngày cấp. Hiện chưa có dropdown lọc riêng theo dịch vụ.</li>
            </ul>

            <h4>Ví dụ đúng: khách cần xem lại tài khoản đã mua</h4>
            <ol>
              <li>Vào <strong>Tài khoản đã cấp</strong>, tìm bằng email khách hoặc mã đơn.</li>
              <li>Đối chiếu tên dịch vụ, login credential, ngày giao và trạng thái.</li>
              <li>Nhấn <strong>Xem</strong> nếu cần kiểm tra mật khẩu. Có thể nhấn lại <strong>Ẩn</strong> sau khi kiểm tra.</li>
              <li>Nếu cần gửi đầy đủ recovery, 2FA hoặc hướng dẫn sử dụng, mở <strong>Đơn hàng</strong> tương ứng; chi tiết đơn hiển thị delivery đầy đủ hơn.</li>
            </ol>

            <h4>Ví dụ đúng: credential đã được đổi bảo hành</h4>
            <div className="admin-guide-info">
              Tìm login cũ hoặc email khách → dòng cũ có thể mang trạng thái <code>REPLACED</code>. Sau đó tìm mã đơn hoặc email khách để kiểm tra credential thay thế ở trạng thái <code>DELIVERED</code>. Việc duyệt đổi thực hiện tại mục <strong>Bảo hành</strong>, không thực hiện trong màn Tài khoản đã cấp.
            </div>

            <div className="admin-guide-note">
              <strong>Không hỗ trợ tài khoản dùng chung nhiều khách:</strong> mô hình dữ liệu hiện tại là một credential gắn với một đơn và một khách hàng. Không dùng màn này để quản lý một login cấp đồng thời cho nhiều user.
            </div>
          </div>
        )}

        {activeSection === 'orders' && (
          <div>
            <h3>Quản lý Đơn hàng</h3>
            <p>Mỗi lần mua thành công tạo một đơn có mã bắt đầu bằng <code>OD</code>. Một đơn <code>ACCOUNT_STOCK</code> nhận tối đa một credential.</p>

            <h4>Trạng thái được hệ thống hỗ trợ</h4>
            <ul>
              <li><code>PENDING_PAYMENT</code>, <code>PAID</code>, <code>PROCESSING</code>, <code>DELIVERED</code>, <code>COMPLETED</code>, <code>WARRANTY</code>, <code>CANCELLED</code>, <code>FAILED</code>, <code>REFUNDED</code>.</li>
              <li>Luồng hiện dùng thường xuyên: đơn thủ công bắt đầu ở <code>PROCESSING</code>; đơn kho tài khoản được giao và chuyển thẳng sang <code>COMPLETED</code>.</li>
              <li><code>FAILED</code> chỉ ghi nhận xử lý thất bại, không tự hoàn tiền.</li>
            </ul>

            <h4>Luồng mua bằng ví</h4>
            <ol>
              <li>Backend kiểm tra user <code>ACTIVE</code>, dịch vụ <code>ACTIVE</code>, CTA <code>BUY_NOW</code>, giá hợp lệ và số dư đủ.</li>
              <li>Với <code>ACCOUNT_STOCK</code>, backend phải tìm được một credential <code>AVAILABLE</code>; nếu không có, yêu cầu mua bị từ chối.</li>
              <li>Ví bị trừ đúng giá sau coupon và đơn được tạo.</li>
              <li>Credential được chuyển sang <code>DELIVERED</code>, gắn với đơn/user; đơn chuyển sang <code>COMPLETED</code>.</li>
            </ol>

            <h4>Luồng thanh toán chuyển khoản</h4>
            <ol>
              <li>Hệ thống tạo checkout và deposit. Với <code>ACCOUNT_STOCK</code>, một credential được chuyển sang <code>RESERVED</code> đến thời hạn của deposit.</li>
              <li>Khi deposit hoàn tất, tiền được cộng vào ví và hệ thống cố tạo đơn từ checkout.</li>
              <li>Nếu reservation vẫn hợp lệ, đơn được tạo, ví bị trừ và credential được giao.</li>
              <li>Nếu reservation đã mất/hết hạn, tiền vẫn ở ví nhưng đơn không được tạo tự động; user có thể đặt lại bằng số dư ví hoặc liên hệ admin.</li>
            </ol>

            <h4>Thao tác trong chi tiết đơn</h4>
            <ul>
              <li><strong>Hoàn thành/Báo lỗi:</strong> chỉ áp dụng khi đơn còn ở <code>PENDING_PAYMENT</code> hoặc <code>PROCESSING</code>.</li>
              <li><strong>Hủy & hoàn:</strong> yêu cầu lý do, chuyển đơn sang <code>CANCELLED</code> và hoàn toàn bộ <code>order.amount</code> vào ví.</li>
              <li><strong>Refund:</strong> yêu cầu lý do và hoàn toàn bộ giá trị đơn. Hiện API không hỗ trợ nhập số tiền hoàn một phần.</li>
              <li><strong>Gia hạn:</strong> chỉ dành cho đơn <code>PENDING_PAYMENT</code>/<code>PROCESSING</code>.</li>
              <li><strong>Chạy lại:</strong> đưa đơn chưa refund về <code>PROCESSING</code>; thao tác này không tự lấy credential mới từ kho.</li>
              <li><strong>Thủ công:</strong> với đơn <code>MANUAL</code>, có thể gán admin, hạn xử lý, checklist và ghi chú nội bộ.</li>
            </ul>

            <h4>Ví dụ đúng: xử lý đơn thủ công</h4>
            <ol>
              <li>Mở đơn <code>PROCESSING</code> và xem tab <strong>Thông tin</strong> để đọc input khách gửi.</li>
              <li>Ở tab <strong>Thủ công</strong>, gán admin phụ trách, hạn xử lý và checklist nếu cần.</li>
              <li>Khi hoàn tất, sang <strong>Xử lý đơn</strong>, nhập kết quả bàn giao rồi nhấn <strong>Hoàn thành</strong>.</li>
              <li>Nếu không thể xử lý, nhập mô tả lỗi và nhấn <strong>Báo lỗi</strong>. Muốn hoàn tiền phải thực hiện thêm thao tác <strong>Refund</strong>.</li>
            </ol>

            <h4>Ví dụ đúng: đơn kho tài khoản bị lỗi sau khi giao</h4>
            <div className="admin-guide-info">
              Không bấm <strong>Chạy lại</strong> để mong hệ thống tự lấy tài khoản mới. Hãy mở yêu cầu tại <strong>Bảo hành</strong> để duyệt đổi credential, hoặc dùng <strong>Refund</strong> nếu quyết định hoàn toàn bộ tiền. Khi refund, credential đã giao được chuyển sang <code>REFUNDED</code>.
            </div>
          </div>
        )}

        {activeSection === 'finance' && (
          <div>
            <h3>Quản lý Tài chính</h3>
            <p>
              Tổng hợp tất cả hoạt động liên quan đến tiền tệ. Trang này có 6 tab chính cùng bộ công cụ tài chính.
              Có các nút hàng đợi nhanh (Quick queue) để truy cập các giao dịch cần xử lý.
            </p>

            <h4>Chỉ số tổng quan</h4>
            <ul>
              <li><strong>Doanh thu hôm nay</strong> – Tổng doanh thu từ đơn hàng.</li>
              <li><strong>Đã nạp (Completed deposits)</strong> – Tổng tiền nạp đã xác nhận.</li>
              <li><strong>Nợ ví (Wallet liability)</strong> – Tổng số dư của tất cả user.</li>
              <li><strong>Giao dịch ngân hàng chưa khớp</strong> – Bank transactions chưa được gán.</li>
              <li><strong>Báo cáo doanh thu:</strong> nạp ròng, tổng doanh thu, tổng hoàn tiền, doanh thu thuần, lợi nhuận.</li>
            </ul>

            <h4>Tab 1: Giao dịch ngân hàng (Bank Transactions)</h4>
            <ul>
              <li>Hiển thị giao dịch đến từ ngân hàng (tự động qua SePay webhook hoặc admin nhập tay).</li>
              <li>Cột: thời gian, số tiền, nội dung chuyển khoản, tài khoản nguồn, trạng thái đối soát.</li>
              <li><strong>Ghép với yêu cầu nạp (Match):</strong> gán bank transaction vào deposit request.</li>
              <li><strong>Ghi có thủ công (Manual credit):</strong> nạp tiền vào ví user dựa trên bank transaction.</li>
              <li><strong>Xử lý lại (Reprocess):</strong> chạy lại xử lý cho bank transaction.</li>
              <li><strong>Bỏ qua (Ignore):</strong> đánh dấu bỏ qua (không ảnh hưởng).</li>
              <li><strong>Ghi có hàng loạt (Bulk credit):</strong> chọn nhiều transaction để xử lý cùng lúc.</li>
              <li>Quick queue: <strong>Chờ kiểm tra (Manual review)</strong>, <strong>Trùng (Duplicate)</strong>, <strong>Đã bỏ qua (Ignored)</strong>.</li>
            </ul>

            <h4>Tab 2: Yêu cầu nạp tiền (Deposits)</h4>
            <ul>
              <li>Danh sách yêu cầu nạp tiền từ user.</li>
              <li>Trạng thái: <code>PENDING</code>, <code>COMPLETED</code>, <code>MANUAL_REVIEW</code>, <code>CANCELLED</code>.</li>
              <li><strong>Xác nhận thủ công (Manual credit):</strong> nếu SePay không tự động xử lý.</li>
              <li><strong>Hủy yêu cầu (Cancel):</strong> nếu user gửi sai thông tin hoặc quá hạn.</li>
              <li><strong>Gia hạn (Extend):</strong> kéo dài thời gian chờ thanh toán.</li>
              <li>Chi tiết: user, số tiền, phương thức, mã giao dịch ngân hàng, thời gian.</li>
              <li>Bộ lọc theo trạng thái, thời gian, user.</li>
              <li>Quick queue: <strong>Chờ kiểm tra (Manual review)</strong>, <strong>Đã hết hạn (Expired)</strong>.</li>
            </ul>

            <h4>Tab 3: Giao dịch ví (Wallet Transactions)</h4>
            <ul>
              <li>Lịch sử biến động số dư của tất cả user.</li>
              <li><strong>Các loại giao dịch:</strong>
                <ul>
                  <li><code>PURCHASE</code> – Trừ tiền khi mua dịch vụ.</li>
                  <li><code>DEPOSIT</code> – Nạp tiền vào ví.</li>
                  <li><code>REFUND</code> – Hoàn tiền từ đơn bị hủy.</li>
                  <li><code>ADJUSTMENT</code> – Điều chỉnh số dư bởi admin (cộng hoặc trừ).</li>
                </ul>
              </li>
              <li>Tìm kiếm theo user, loại giao dịch, thời gian.</li>
              <li><strong>Kiểm tra cân đối (Balance check):</strong> phát hiện sai lệch số dư.</li>
              <li><strong>Đối chiếu (Reconciliation preview):</strong> xem preview đối soát.</li>
              <li><strong>Báo cáo toàn vẹn (Integrity report):</strong> báo cáo chi tiết.</li>
            </ul>

            <h4>Tab 4: Báo cáo doanh thu (Revenue Report)</h4>
            <ul>
              <li>Nạp ròng (Deposit volume) – Tổng tiền user đã nạp.</li>
              <li>Tổng doanh thu (Gross revenue) – Tổng tiền đơn hàng.</li>
              <li>Tổng hoàn tiền (Total refunds) – Tiền đã hoàn.</li>
              <li>Doanh thu thuần (Net revenue) – Gross – refunds.</li>
              <li>Lợi nhuận (Profit) – Net revenue – costPrice.</li>
            </ul>

            <h4>Tab 5: Xuất báo cáo (Exports)</h4>
            <ul>
              <li>Hỗ trợ xuất file CSV hoặc XLSX.</li>
              <li>Các loại: Doanh thu (Revenue), User, Đơn hàng (Orders), Giao dịch ngân hàng (Bank), Ticket.</li>
            </ul>

            <h4>Tab 6: Công cụ tài chính (Finance Tools)</h4>
            <ul>
              <li><strong>Điều chỉnh số dư</strong> – Nhập user, số tiền, lý do.</li>
              <li><strong>Nạp tiền thủ công</strong> – Tạo giao dịch nạp tiền cho user.</li>
              <li><strong>Hoàn tiền</strong> – Hoàn tiền cho đơn hàng.</li>
              <li>Mỗi thao tác đều ghi audit log.</li>
            </ul>

            <div className="admin-guide-note">
              <strong>Lưu ý:</strong> Mọi thao tác tài chính đều không thể xóa. Luôn kiểm tra kỹ số tiền
              và lý do trước khi xác nhận.
            </div>

            <div className="admin-guide-info">
              <strong>Ví dụ 1 (manual credit deposit):</strong> User "Trần Văn B" báo đã chuyển 500,000đ
              vào tài khoản ngân hàng nhưng chưa nhận được. Vào Bank Transactions → thấy giao dịch
              500,000đ từ "TRAN VAN B" → chọn Manual credit → tiền vào ví B ngay lập tức.
            </div>
            <div className="admin-guide-info">
              <strong>Ví dụ 2 (điều chỉnh số dư):</strong> User "Lê Thị C" bị trừ 2 lần cho cùng 1 đơn hàng
              → vào Wallet → kiểm tra thấy 2 giao dịch PURCHASE trùng → Công cụ → Điều chỉnh số dư →
              nhập user C, số tiền +200,000đ, lý do "Hoàn tiền do trừ lỗi 2 lần" → audit log ghi lại.
            </div>
            <div className="admin-guide-info">
              <strong>Ví dụ 3 (ghép bank transaction):</strong> Deposit request 300,000đ của user "Phạm D"
              đang <code>PENDING</code>. Vào Bank Transactions thấy giao dịch 300,000đ nội dung
              "DEPOSIT PD" → chọn Match → chọn deposit code của D → khớp xong, deposit thành COMPLETED.
            </div>
          </div>
        )}

        {activeSection === 'coupons' && (
          <div>
            <h3>Quản lý Coupon (Mã giảm giá)</h3>
            <p>
              Coupon cho phép admin tạo mã giảm giá để khuyến khích user mua dịch vụ.
              Coupon có thể áp dụng cho một hoặc nhiều dịch vụ cụ thể.
            </p>

            <h4>Cấu trúc Coupon</h4>
            <ul>
              <li><strong>code</strong> – Mã coupon (ví dụ: "SALE20", "WELCOME"). Phân biệt hoa-thường.</li>
              <li><strong>discountType</strong> – Loại giảm giá:
                <ul>
                  <li><code>PERCENTAGE</code> – Giảm theo phần trăm (vd: giảm 20%).</li>
                  <li><code>FIXED</code> – Giảm số tiền cố định (vd: giảm 50,000đ).</li>
                </ul>
              </li>
              <li><strong>discountValue</strong> – Giá trị giảm (số phần trăm hoặc số tiền).</li>
              <li><strong>minOrderAmount</strong> – Giá trị đơn hàng tối thiểu để áp dụng.</li>
              <li><strong>maxDiscountAmount</strong> – Số tiền giảm tối đa (áp dụng cho PERCENTAGE).</li>
              <li><strong>usageLimit</strong> – Số lần sử dụng tối đa (tổng thể).</li>
              <li><strong>perUserLimit</strong> – Số lần tối đa mỗi user có thể dùng.</li>
              <li><strong>startDate / endDate</strong> – Thời gian hiệu lực.</li>
              <li><strong>applicableServiceIds</strong> – Danh sách service được áp dụng (để trống = áp dụng tất cả).</li>
              <li><strong>status</strong> – <code>ACTIVE</code> hoặc <code>DISABLED</code>.</li>
            </ul>

            <h4>Thao tác</h4>
            <ul>
              <li><strong>Tạo coupon:</strong> điền các trường, chọn service được áp dụng.</li>
              <li><strong>Sửa:</strong> thay đổi thông tin, vô hiệu hóa.</li>
              <li><strong>Vô hiệu hóa:</strong> chuyển <code>DISABLED</code> để ngưng sử dụng.</li>
              <li>Xem số lần đã sử dụng, tổng giảm giá.</li>
            </ul>

            <div className="admin-guide-info">
              <strong>Ví dụ 1: Tạo coupon giảm % có giới hạn</strong><br />
              Vào Coupon → Tạo mới, điền:<br />
              - Mã (code): <code>SALE20</code> ← phân biệt hoa-thường, không dấu cách<br />
              - Loại giảm: <code>PERCENTAGE</code><br />
              - Giá trị giảm: <code>20</code> ← nghĩa là 20%<br />
              - Đơn tối thiểu (minOrderAmount): <code>100000</code><br />
              - Giảm tối đa (maxDiscountAmount): <code>50000</code> ← dù 20% của 1 triệu = 200k, chỉ giảm tối đa 50k<br />
              - Tổng lượt dùng (usageLimit): <code>100</code><br />
              - Mỗi user dùng (perUserLimit): <code>1</code><br />
              - Ngày bắt đầu / kết thúc: chọn ngày hợp lệ<br />
              - Áp dụng cho service: chọn <code>Netflix Premium</code> và <code>Spotify Premium</code><br />
              - Trạng thái: <code>ACTIVE</code><br />
              <strong>Nếu thiếu:</strong> Bỏ qua maxDiscountAmount → user mua Netflix 500k, giảm 20% = 100k, lỗ nếu giá vốn cao.<br />
              Để trống applicableServiceIds → coupon áp dụng cho tất cả dịch vụ, kể cả dịch vụ lợi nhuận thấp.
            </div>
            <div className="admin-guide-info">
              <strong>Ví dụ 2: Tạo coupon giảm tiền cố định cho user mới</strong><br />
              - Mã: <code>WELCOME50</code><br />
              - Loại giảm: <code>FIXED</code><br />
              - Giá trị giảm: <code>50000</code> ← giảm 50,000đ<br />
              - Đơn tối thiểu: <code>100000</code> ← đơn dưới 100k không áp dụng được<br />
              - Mỗi user dùng: <code>1</code><br />
              - Ngày kết thúc: cuối tháng ← khuyến mãi có thời hạn<br />
              <strong>Khi user nhập mã:</strong> đơn 150,000đ được giảm còn 100,000đ. Đơn 80,000đ không áp dụng được.
            </div>
          </div>
        )}

        {activeSection === 'warranty' && (
          <div>
            <h3>Quản lý Bảo hành (Warranty)</h3>
            <p>
              User có thể yêu cầu bảo hành cho dịch vụ đã mua (đặc biệt là dịch vụ
              <code>ACCOUNT_STOCK</code>). Admin xem xét và phê duyệt hoặc từ chối.
            </p>

            <h4>Trạng thái yêu cầu bảo hành</h4>
            <ul>
              <li><code>OPEN</code> – User mới gửi yêu cầu, chờ admin xem xét.</li>
              <li><code>REVIEWING</code> – Admin đang xem xét, kiểm tra thông tin.</li>
              <li><code>APPROVED_REPLACE</code> – Đã duyệt thay thế credential mới.</li>
              <li><code>APPROVED_REFUND</code> – Đã duyệt hoàn tiền.</li>
              <li><code>REJECTED</code> – Từ chối (kèm lý do).</li>
              <li><code>RESOLVED</code> – Đã giải quyết xong (thay thế hoặc hoàn tiền đã thực hiện).</li>
            </ul>

            <h4>Quy trình xử lý yêu cầu bảo hành</h4>
            <ol>
              <li><strong>Tiếp nhận:</strong> xem yêu cầu từ user (thông tin đơn hàng, credential, lý do).</li>
              <li><strong>Kiểm tra:</strong> xác minh thông tin, đánh giá tính hợp lệ.</li>
              <li><strong>Quyết định:</strong>
                <ul>
                  <li><strong>Thay thế (Replace):</strong> chọn credential khác từ kho để gán cho user.
                    Credential cũ chuyển <code>REPLACED</code>, credential mới chuyển <code>DELIVERED</code>.</li>
                  <li><strong>Hoàn tiền (Refund):</strong> hoàn tiền vào ví user.
                    Credential (nếu có) chuyển <code>REFUNDED</code>.</li>
                  <li><strong>Từ chối (Reject):</strong> ghi rõ lý do.</li>
                </ul>
              </li>
              <li><strong>Xác nhận:</strong> ghi chú kết quả, cập nhật trạng thái thành <code>RESOLVED</code>.</li>
            </ol>

            <h4>Thao tác</h4>
            <ul>
              <li>Bộ lọc: theo trạng thái, service, thời gian.</li>
              <li>Click vào yêu cầu để xem chi tiết và thực hiện thao tác.</li>
              <li>Xem lịch sử thay đổi trạng thái của yêu cầu.</li>
            </ul>

            <div className="admin-guide-note">
              <strong>Lưu ý:</strong> Khi thay thế credential, hệ thống lưu vết credential cũ và mới.
              User sẽ thấy credential mới trong chi tiết đơn hàng.
            </div>

            <div className="admin-guide-info">
              <strong>Ví dụ 1: Thay thế credential Netflix lỗi</strong><br />
              User gửi yêu cầu bảo hành: "Netflix báo sai mật khẩu"<br />
              - Vào Bảo hành → thấy yêu cầu <code>OPEN</code> → click xem chi tiết<br />
              - Kiểm tra credential cũ: <code>netflix@test.com</code> → thử Reveal mật khẩu và đăng nhập thử<br />
              - Xác nhận lỗi thật → bấm <strong>Approve Replace</strong><br />
              - Chọn credential mới từ kho: chọn <code>netflix_new@test.com</code> (còn AVAILABLE)<br />
              - Ghi chú: "Thay thế do lỗi đăng nhập, giao credential mới"<br />
              - Xác nhận → hệ thống đổi credential cũ → <code>REPLACED</code>, mới → <code>DELIVERED</code>, warranty → <code>RESOLVED</code><br />
              <strong>Nếu không chọn credential thay thế:</strong> warranty không thể RESOLVED được.
            </div>
            <div className="admin-guide-info">
              <strong>Ví dụ 2: Hoàn tiền do hết hàng thay thế</strong><br />
              User yêu cầu bảo hành Spotify nhưng kho không còn credential AVAILABLE để thay:<br />
              - Bấm <strong>Approve Refund</strong><br />
              - Nhập số tiền: <code>120000</code> (toàn bộ giá trị đơn)<br />
              - Lý do: "Hết hàng thay thế, hoàn 100% giá trị đơn hàng"<br />
              - Xác nhận → hệ thống trả tiền vào ví user, credential chuyển <code>REFUNDED</code><br />
              <strong>Lưu ý:</strong> Tiền hoàn vào ví user, không phải tiền mặt. User có thể dùng số dư đó mua dịch vụ khác.
            </div>
            <div className="admin-guide-info">
              <strong>Ví dụ 3: Từ chối bảo hành</strong><br />
              User yêu cầu bảo hành với lý do "Không thích Netflix, muốn đổi sang Spotify":<br />
              - Bấm <strong>Reject</strong><br />
              - Nhập lý do: "Bảo hành chỉ áp dụng cho lỗi kỹ thuật tài khoản, không áp dụng đổi ý hoặc đổi dịch vụ"<br />
              - Xác nhận → warranty chuyển <code>REJECTED</code>, credential giữ nguyên trạng thái
            </div>
          </div>
        )}

        {activeSection === 'tickets' && (
          <div>
            <h3>Quản lý Ticket hỗ trợ</h3>
            <p>
              Ticket là kênh hỗ trợ chính thức để user gửi yêu cầu, thắc mắc hoặc báo cáo vấn đề.
            </p>

            <h4>Chế độ xem (Queue views)</h4>
            <ul>
              <li><strong>Tất cả (All)</strong> – Toàn bộ ticket trong hệ thống.</li>
              <li><strong>Chưa gán (Unassigned)</strong> – Ticket chưa có admin nào nhận.</li>
              <li><strong>Của tôi (Assigned to me)</strong> – Ticket đã gán cho bạn.</li>
            </ul>

            <h4>Danh sách Ticket</h4>
            <ul>
              <li>Hiển thị: tiêu đề, user gửi, trạng thái, mức ưu tiên, ngày tạo, admin phụ trách.</li>
              <li>Click vào ticket để xem chi tiết hội thoại.</li>
              <li>Sắp xếp theo thời gian (mới nhất lên đầu).</li>
              <li>Bộ lọc theo trạng thái, mức ưu tiên, danh mục (category), tìm kiếm theo tiêu đề.</li>
              <li>Phân trang 50 ticket mỗi trang.</li>
            </ul>

            <h4>Trạng thái</h4>
            <ul>
              <li><code>OPEN</code> – Mới tạo, chưa xử lý.</li>
              <li><code>PENDING_ADMIN</code> – Đang chờ admin phản hồi.</li>
              <li><code>PENDING_USER</code> – Đang chờ người dùng phản hồi.</li>
              <li><code>RESOLVED</code> – Đã giải quyết.</li>
              <li><code>CLOSED</code> – Đã đóng.</li>
            </ul>

            <h4>Mức ưu tiên</h4>
            <ul>
              <li><code>LOW</code> – Thấp.</li>
              <li><code>MEDIUM</code> – Trung bình.</li>
              <li><code>HIGH</code> – Cao.</li>
              <li><code>URGENT</code> – Khẩn cấp.</li>
            </ul>

            <h4>Quy trình xử lý</h4>
            <ol>
              <li>Tiếp nhận: xem nội dung, đánh giá mức độ.</li>
              <li>Phân loại: gán ưu tiên, danh mục (category) và admin phụ trách (assignee).</li>
              <li>Xử lý: phản hồi và chuyển giữa <code>PENDING_ADMIN</code>/<code>PENDING_USER</code> theo bên đang cần trả lời.</li>
              <li>Phản hồi: trả lời user chi tiết, rõ ràng.</li>
              <li>Đóng ticket: <code>RESOLVED</code> → <code>CLOSED</code>.</li>
            </ol>

            <h4>Thông tin chi tiết ticket</h4>
            <ul>
              <li><strong>Hội thoại:</strong> tin nhắn giữa user và admin, hiển thị theo thời gian.</li>
              <li><strong>File đính kèm:</strong> user có thể đính kèm hình ảnh, tài liệu. Admin có thể xóa attachment.</li>
              <li><strong>Thời gian xử lý:</strong> xem thống kê thời gian đóng ticket và thời gian trung bình.</li>
            </ul>

            <div className="admin-guide-note">
              <strong>Quy tắc:</strong> Ticket <code>URGENT</code> cần phản hồi trong 1 giờ,
              <code>HIGH</code> trong 4 giờ. Không để ticket <code>OPEN</code> quá 24 giờ.
            </div>

            <div className="admin-guide-info">
              <strong>Ví dụ:</strong> User gửi ticket "Đã nạp 500k nhưng chưa thấy tiền trong ví"
              với priority <code>HIGH</code> → Vào ticket → kiểm tra
              Bank Transactions thấy giao dịch 500k → Manual credit → Trả lời user "Đã nạp thành công,
              kiểm tra số dư" → Resolve ticket.
            </div>
          </div>
        )}

        {activeSection === 'content' && (
          <div>
            <h3>Quản lý Website (Nội dung)</h3>
            <p>
              Trang này quản lý nội dung hiển thị trên website công khai.
            </p>

            <h4>Banner</h4>
            <ul>
              <li>Tạo banner hiển thị trên trang chủ.</li>
              <li>Thiết lập hình ảnh, tiêu đề, mô tả, nút CTA.</li>
              <li>Có thể bật/tắt countdown timer (ví dụ: "Kết thúc sau 00:12:05").</li>
              <li>QR code cho banner (hiển thị trên mobile).</li>
              <li>Sort order: sắp xếp thứ tự hiển thị.</li>
              <li>Trạng thái: bật/tắt từng banner.</li>
            </ul>

            <h4>FAQ</h4>
            <ul>
              <li>Tạo danh sách câu hỏi thường gặp.</li>
              <li>Mỗi FAQ gồm: câu hỏi, câu trả lời, thứ tự.</li>
              <li>Hiển thị trên website public để user tự tra cứu.</li>
            </ul>

            <h4>Thương hiệu (Brand)</h4>
            <ul>
              <li><strong>Logo</strong> – URL logo website.</li>
              <li><strong>Favicon</strong> – URL favicon.</li>
              <li><strong>Tên website</strong> – Tên hiển thị.</li>
              <li>Thông tin liên hệ: email, số điện thoại, địa chỉ.</li>
              <li>Social links: Facebook, Zalo, Telegram.</li>
            </ul>

            <h4>Giao diện (Theme)</h4>
            <ul>
              <li><strong>Màu chủ đạo</strong> – Màu primary của website.</li>
              <li><strong>Màu phụ</strong> – Màu secondary/ accent.</li>
              <li>Hỗ trợ light/dark mode.</li>
            </ul>

            <h4>Nội dung tĩnh (Site Sections)</h4>
            <ul>
              <li>Quản lý các section nội dung tĩnh của website.</li>
              <li>Ví dụ: "Về chúng tôi", "Chính sách bảo mật", "Điều khoản dịch vụ".</li>
              <li>Nội dung HTML, có thể chứa hình ảnh.</li>
            </ul>

            <h4>Email Templates</h4>
            <ul>
              <li>Quản lý mẫu email gửi cho user, gồm 3 loại:
                <ul>
                  <li><strong>Xác minh email (Email Verification)</strong> – link type, gửi khi user đăng ký.</li>
                  <li><strong>Đặt lại mật khẩu (Password Reset)</strong> – link type, gửi khi user quên mật khẩu.</li>
                  <li><strong>Mã 2FA (Two-Factor Code)</strong> – code type, gửi mã xác thực.</li>
                </ul>
              </li>
              <li>Mỗi template có các trường: subject, heading, intro, action/code label, detail text, security note, footer.</li>
              <li>Hỗ trợ xem trước HTML real-time.</li>
            </ul>

            <h4>Bài viết (Blog)</h4>
            <ul>
              <li>Tạo bài viết dạng blog/site section.</li>
              <li>Hỗ trợ hình ảnh, slug, SEO title/description.</li>
            </ul>

            <div className="admin-guide-info">
              <strong>Ví dụ 1 (banner countdown):</strong> Tạo banner "Khuyến mãi tháng 6 – Giảm 20%"
              với countdown timer kết thúc sau 7 ngày → banner tự động ẩn khi hết giờ.
            </div>
            <div className="admin-guide-info">
              <strong>Ví dụ 2 (FAQ):</strong> Thêm câu "Làm sao để nạp tiền?" → trả lời
              "Vào mục Nạp tiền, nhập số tiền và chuyển khoản theo thông tin hiển thị" →
              user tự xem FAQ mà không cần hỏi admin.
            </div>
            <div className="admin-guide-info">
              <strong>Ví dụ 3 (email template):</strong> Sửa email xác minh: subject =
              "Xác minh tài khoản {"{siteName}"}", heading = "Chào bạn,", intro = "Vui lòng click
              link dưới đây để xác minh email"... → xem preview HTML trước khi lưu.
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div>
            <h3>Cài đặt hệ thống</h3>
            <p>
              Trang cài đặt gồm nhiều tab chức năng. Dưới đây là hướng dẫn chi tiết từng tab.
            </p>

            <h4>Tab 1: Settings (Cấu hình chung)</h4>
            <ul>
              <li>Quản lý biến cấu hình dạng key-value.</li>
              <li><strong>Key</strong> – Tên biến (ví dụ: <code>min_deposit_amount</code>).</li>
              <li><strong>Value</strong> – Giá trị.</li>
              <li><strong>Public/Private</strong> – Public hiển thị cho user, private chỉ admin thấy.</li>
              <li>Tìm kiếm theo key.</li>
              <li><strong>Backup / Restore:</strong> xuất settings ra file JSON, khôi phục khi cần.</li>
              <li><strong>2FA bắt buộc:</strong> bật/tắt yêu cầu 2FA cho admin.</li>
              <li>Xem lịch sử thay đổi (ai thay đổi, giá trị cũ → mới).</li>
            </ul>

            <h4>Tab 2: Operations (Vận hành)</h4>
            <ul>
              <li><strong>Bảo trì hệ thống:</strong> bật/tắt chế độ bảo trì. Khi bật, user thấy thông báo bảo trì.</li>
              <li><strong>Rate limiting:</strong> cấu hình giới hạn request API cho từng nhóm:
                <ul>
                  <li><code>auth</code> – Giới hạn request đăng nhập/đăng ký.</li>
                  <li><code>finance</code> – Giới hạn request tài chính.</li>
                  <li><code>webhook</code> – Giới hạn request webhook.</li>
                </ul>
              </li>
              <li><strong>Email security templates:</strong> chỉnh sửa nội dung email hệ thống:
                <ul>
                  <li>Password reset email (subject + body).</li>
                  <li>Email verification email (subject + body).</li>
                  <li>Two-factor code email (subject + body).</li>
                </ul>
              </li>
              <li><strong>Cache:</strong> xóa cache hệ thống.</li>
            </ul>

            <h4>Tab 3: Webhooks & SePay</h4>
            <ul>
              <li>Cấu hình webhook SePay để tự động xử lý nạp tiền qua ngân hàng.</li>
              <li>Nhập thông số kết nối dạng JSON (gồm API key, secret, endpoint).</li>
              <li>Kiểm tra trạng thái kết nối webhook (đang hoạt động không).</li>
              <li>Xem nhật ký webhook (lịch sử request, response, thời gian, kết quả).</li>
              <li><strong>Retry:</strong> gửi lại webhook cho giao dịch cụ thể nếu xử lý thất bại (cần bank transaction ID, deposit code, lý do).</li>
            </ul>

            <h4>Tab 4: Notifications (Thông báo)</h4>
            <ul>
              <li>Xem danh sách thông báo hệ thống.</li>
              <li>Đánh dấu đã đọc.</li>
              <li>Cấu hình kênh nhận thông báo.</li>
            </ul>

            <h4>Tab 5: Administrators (Quản trị viên)</h4>
            <ul>
              <li><strong>Danh sách admin:</strong> xem tất cả tài khoản có quyền admin.</li>
              <li><strong>Vai trò (Role):</strong> tạo/sửa/xóa vai trò, gán quyền cho từng vai trò.</li>
              <li><strong>Phân quyền:</strong> gán quyền cụ thể cho admin hoặc vai trò.</li>
              <li><strong>2FA Admin:</strong> thiết lập, bật/tắt, reset 2FA.</li>
              <li><strong>Session Admin:</strong> xem và thu hồi phiên đăng nhập.</li>
              <li><strong>Khóa/Mở Admin:</strong> khóa tài khoản admin khi cần.</li>
              <li>Chỉ <code>SUPER_ADMIN</code> mới có thể quản lý admin khác.</li>
            </ul>

            <h4>Tab 6: Audit (Nhật ký hoạt động)</h4>
            <ul>
              <li>Xem lịch sử thao tác: ai làm, làm gì, lúc nào, trên đối tượng nào.</li>
              <li>Bộ lọc: hành động, admin, target ID, target type, thời gian.</li>
              <li>Xem chi tiết của một audit log.</li>
              <li><strong>Export:</strong> xuất ra file XLSX hoặc CSV.</li>
            </ul>

            <h4>Tab 7: Files (Quản lý tệp)</h4>
            <ul>
              <li><strong>Upload file</strong> – Chọn file từ máy tính.</li>
              <li><strong>Tải xuống</strong> – Nhập file ID để tải.</li>
              <li><strong>Xóa file</strong> – Xóa file không dùng.</li>
              <li><strong>Preview</strong> – Xem trước nếu hỗ trợ.</li>
            </ul>

            <h4>Tab 8: Jobs (Tác vụ nền)</h4>
            <ul>
              <li>Danh sách job chạy ngầm, trạng thái: <code>ACTIVE</code>, <code>FAILED</code>, <code>COMPLETED</code>.</li>
              <li><strong>Thử lại</strong> – Chạy lại job lỗi.</li>
              <li><strong>Hủy job</strong> – Dừng job đang chạy.</li>
              <li><strong>Logs</strong> – Xem nhật ký chi tiết.</li>
            </ul>

            <h4>Tab 9: Health (Sức khỏe hệ thống)</h4>
            <ul>
              <li><strong>Database</strong> – Kết nối PostgreSQL.</li>
              <li><strong>Redis</strong> – Kết nối Redis.</li>
              <li><strong>Disk</strong> – Dung lượng ổ đĩa.</li>
              <li><strong>Uptime</strong> – Thời gian chạy liên tục.</li>
            </ul>

            <div className="admin-guide-info">
              <strong>Ví dụ 1 (bật bảo trì):</strong> Cần update hệ thống → Operations → bật
              "Maintenance mode" → user vào web thấy "Hệ thống đang bảo trì" → xong việc → tắt.
            </div>
            <div className="admin-guide-info">
              <strong>Ví dụ 2 (khóa admin):</strong> Admin "Nguyễn Văn X" nghỉ việc →
              vào Administrators → chọn X → Khóa tài khoản, lý do "Đã nghỉ việc" →
              X không vào được admin nữa. Cấp quyền cho admin mới qua Roles.
            </div>
            <div className="admin-guide-info">
              <strong>Ví dụ 3 (audit log):</strong> User "Trần Văn Y" khiếu nại bị trừ tiền bất thường
              → vào Audit → lọc admin = "all", target type = "USER", target ID = Y → thấy ai đã
              ADJUSTMENT số dư của Y và lý do.
            </div>
            <div className="admin-guide-info">
              <strong>Ví dụ 4 (jobs):</strong> Đơn hàng AUTO không xử lý → vào Jobs → thấy job
              "processOrder" bị FAILED → click Logs → thấy lỗi "API timeout" → Retry → job chạy
              lại thành công.
            </div>
          </div>
        )}

        {activeSection === 'workflow' && (
          <div>
            <h3>Quy trình nghiệp vụ</h3>

            <h4>1. Quy trình tạo và bán dịch vụ ACCOUNT_STOCK</h4>
            <ol>
              <li>Vào <strong>Dịch vụ</strong> → <strong>Tạo mới</strong> → <strong>Sản phẩm giao tài khoản</strong>.</li>
              <li>Điền tên, slug, danh mục, giá và nội dung cần thiết.</li>
              <li>Đặt <code>status = ACTIVE</code>, <code>ctaType = BUY_NOW</code>, bật hiển thị công khai rồi lưu.</li>
              <li>Vào <strong>Kho tài khoản</strong> → chọn dịch vụ → <strong>Tạo mới</strong> → nhập từng tài khoản hoặc dán nội dung CSV.</li>
              <li>Kiểm tra: service có ít nhất 1 credential <code>AVAILABLE</code>.</li>
              <li>User mua một đơn → hệ thống giao một credential → kiểm tra trong chi tiết <strong>Đơn hàng</strong> và <strong>Tài khoản đã cấp</strong>.</li>
              <li>Khi gần hết kho, nhập thêm credential.</li>
            </ol>

            <h4>2. Quy trình xử lý đơn hàng MANUAL</h4>
            <ol>
              <li>Vào <strong>Đơn hàng</strong> → Lọc <code>PROCESSING</code>.</li>
              <li>Xem chi tiết: dịch vụ, dữ liệu user nhập, số tiền.</li>
              <li>Xác minh thông tin user cung cấp.</li>
              <li>Tiến hành xử lý (làm thủ công theo yêu cầu dịch vụ).</li>
              <li>Cập nhật trạng thái: <code>COMPLETED</code> (kèm ghi chú) hoặc <code>FAILED</code> (kèm lý do).</li>
              <li>User nhận được thông báo kết quả.</li>
            </ol>

            <h4>3. Quy trình xử lý khiếu nại / hoàn tiền</h4>
            <ol>
              <li>Tiếp nhận ticket khiếu nại từ user.</li>
              <li>Kiểm tra đơn hàng liên quan: trạng thái, dữ liệu, lịch sử.</li>
              <li>Đánh giá: lỗi hệ thống/admin hay do user?</li>
              <li>Nếu lỗi hệ thống:
                <ul>
                  <li>Đơn <code>PROCESSING</code> → hủy đơn (tự động hoàn tiền).</li>
                  <li>Đơn <code>COMPLETED</code> → hoàn tiền (REFUND).</li>
                </ul>
              </li>
              <li>Nếu lỗi user: giải thích, hướng dẫn đặt lại.</li>
              <li>Phản hồi ticket với kết quả.</li>
            </ol>

            <h4>4. Quy trình xử lý bảo hành ACCOUNT_STOCK</h4>
            <ol>
              <li>User gửi yêu cầu bảo hành (tại trang Bảo hành).</li>
              <li>Vào <strong>Bảo hành</strong> → Xem yêu cầu mới (<code>OPEN</code>).</li>
              <li>Kiểm tra credential đã giao, lý do yêu cầu.</li>
              <li>Quyết định:
                <ul>
                  <li><strong>Thay thế:</strong> chọn credential khác trong kho → xác nhận.</li>
                  <li><strong>Hoàn tiền:</strong> hoàn toàn bộ giá trị đơn về ví user.</li>
                  <li><strong>Từ chối:</strong> ghi lý do.</li>
                </ul>
              </li>
              <li>Yêu cầu kết thúc ở <code>APPROVED_REPLACE</code>, <code>APPROVED_REFUND</code> hoặc <code>REJECTED</code> tùy quyết định.</li>
            </ol>

            <h4>5. Quy trình xử lý nạp tiền thủ công</h4>
            <ol>
              <li>User báo đã chuyển khoản nhưng chưa nhận được tiền.</li>
              <li>Kiểm tra webhook SePay: Tab Webhooks → nhật ký.</li>
              <li>Nếu webhook không nhận được: kiểm tra cấu hình SePay.</li>
              <li>Nếu có giao dịch nhưng chưa xử lý: dùng nút Retry.</li>
              <li>Nếu vẫn không được: xác nhận nạp tiền thủ công trong Tab Tài chính.</li>
            </ol>

            <h4>6. Quy trình tạo dịch vụ mới (tổng quát)</h4>
            <ol>
              <li>Xác định nhu cầu, loại dịch vụ.</li>
              <li>Tạo danh mục nếu chưa có.</li>
              <li>Tạo service với đầy đủ thông tin.</li>
              <li>Đặt <code>status = ACTIVE</code>, <code>ctaType = BUY_NOW</code>.</li>
              <li>Đối với <code>ACCOUNT_STOCK</code>: nhập credential vào kho.</li>
              <li>Kiểm tra hiển thị trên giao diện user.</li>
            </ol>

            <h4>7. Quy trình xử lý user vi phạm</h4>
            <ol>
              <li>Xem xét lý do, kiểm tra lịch sử hoạt động.</li>
              <li>Quyết định: khóa tạm thời, khóa vĩnh viễn, hoặc cảnh báo.</li>
              <li>Ghi rõ lý do trong audit log.</li>
              <li>Thông báo cho user (nếu cần).</li>
            </ol>

            <div className="admin-guide-note">
              <strong>Nguyên tắc chung:</strong> Mọi quyết định quản trị đều phải có lý do rõ ràng,
              được ghi trong audit log. Ưu tiên giải quyết vấn đề của user công bằng và minh bạch.
            </div>
          </div>
        )}

        {activeSection === 'user-guide' && (
          <div>
            <h3>Hướng dẫn sử dụng cho người dùng cuối</h3>
            <p>
              Phần này mô tả cách user tương tác với hệ thống. Admin cần nắm rõ để hỗ trợ user.
            </p>

            <h4>1. Đăng ký và đăng nhập</h4>
            <ul>
              <li>Đăng ký bằng email + mật khẩu.</li>
              <li>Sau đăng ký, cần xác minh email để dùng đầy đủ tính năng.</li>
              <li>Đăng nhập bằng email + mật khẩu.</li>
              <li>Có thể bật 2FA (email hoặc TOTP) để tăng bảo mật.</li>
              <li>Quên mật khẩu: dùng tính năng "Quên mật khẩu" để đặt lại.</li>
            </ul>

            <h4>2. Nạp tiền</h4>
            <ul>
              <li>Vào <strong>Nạp tiền</strong> → nhập số tiền.</li>
              <li>Xem thông tin ngân hàng và QR code.</li>
              <li>Chuyển tiền, chờ xác nhận tự động qua webhook.</li>
              <li>Khi xác nhận, số dư ví cập nhật ngay.</li>
              <li>Nếu quá hạn, tạo ticket hỗ trợ.</li>
            </ul>

            <h4>3. Mua dịch vụ</h4>
            <ul>
              <li>Vào <strong>Dịch vụ</strong> → chọn dịch vụ.</li>
              <li>Xem chi tiết: mô tả, giá, yêu cầu, thời gian xử lý, bảo hành.</li>
              <li>Nhấn <strong>Mua ngay</strong> → điền thông tin → chọn thanh toán.</li>
              <li>
                <strong>Đối với ACCOUNT_STOCK:</strong> nếu thanh toán bằng ví, nhận credential ngay lập tức.
                Nếu chuyển khoản, credential được giữ cho checkout và chỉ giao khi deposit hoàn tất và reservation còn hợp lệ.
              </li>
            </ul>

            <h4>4. Theo dõi đơn hàng</h4>
            <ul>
              <li>Vào <strong>Đơn hàng</strong> → xem danh sách đơn.</li>
              <li>Trạng thái: <code>PROCESSING</code>, <code>COMPLETED</code>, <code>FAILED</code>, <code>CANCELLED</code>, <code>REFUNDED</code>.</li>
              <li>Click vào đơn để xem chi tiết (gồm credential đã nhận nếu là ACCOUNT_STOCK).</li>
            </ul>

            <h4>5. Bảo hành</h4>
            <ul>
              <li>Vào <strong>Bảo hành</strong> → tạo yêu cầu mới.</li>
              <li>Chọn đơn hàng, nhập lý do.</li>
              <li>Theo dõi trạng thái yêu cầu.</li>
            </ul>

            <h4>6. Hỗ trợ</h4>
            <ul>
              <li>Vào <strong>Hỗ trợ</strong> → tạo ticket.</li>
              <li>Điền tiêu đề, nội dung, chọn ưu tiên.</li>
              <li>Admin phản hồi, user xem và trả lời.</li>
            </ul>

            <h4>7. Hồ sơ & Cài đặt</h4>
            <ul>
              <li><strong>Hồ sơ:</strong> cập nhật tên, email, SĐT, ảnh đại diện.</li>
              <li><strong>Bảo mật:</strong> đổi mật khẩu, bật/tắt 2FA, quản lý phiên.</li>
              <li><strong>API Keys:</strong> tạo key để tích hợp, chọn scopes phù hợp.</li>
              <li><strong>Thông báo:</strong> xem thông báo từ hệ thống.</li>
              <li><strong>Yêu thích:</strong> đánh dấu dịch vụ yêu thích để truy cập nhanh.</li>
            </ul>

            <div className="admin-guide-info">
              <strong>Ví dụ user mua Netflix bằng ví:</strong><br />
              Vào Dịch vụ → tìm "Netflix Premium 1 Tháng" → click để xem chi tiết<br />
              - Giá: 120,000đ, số dư ví: 500,000đ → đủ tiền<br />
              - Bấm <strong>Mua ngay</strong>; chỉ điền các trường nếu dịch vụ có cấu hình yêu cầu đầu vào<br />
              - Chọn thanh toán: <strong>Ví điện tử</strong> → Xác nhận<br />
              - Hệ thống trừ 120,000đ, giao credential ngay lập tức<br />
              - User nhận thông báo đơn đã hoàn thành; thông tin đăng nhập không được gửi trực tiếp trong email thông báo<br />
              - Vào Đơn hàng → mở chi tiết đơn để xem login, mật khẩu, recovery, 2FA và hướng dẫn sử dụng<br />
              <strong>Nếu số dư không đủ:</strong> user thấy lỗi "Số dư không đủ" → phải nạp tiền trước
            </div>
            <div className="admin-guide-info">
              <strong>Ví dụ user nạp tiền 500,000đ bằng chuyển khoản:</strong><br />
              Vào Nạp tiền → nhập số tiền: <code>500000</code> (chỉ nhập số, không dấu chấm phẩy)<br />
              - Hệ thống hiển thị thông tin tài khoản: Vietcombank - 0123456789 - CÔNG TY ABC<br />
              - Hiển thị mã QR → user mở app ngân hàng quét QR hoặc nhập tay<br />
              - Nội dung chuyển khoản: <strong>NAP500000</strong> ← rất quan trọng, SePay dựa vào đây để tự động khớp<br />
              - User chuyển tiền xong → chờ 1-2 phút → số dư ví tăng lên 500,000đ<br />
              <strong>Nếu sai nội dung:</strong> SePay không tự khớp được → deposit ở trạng thái MANUAL_REVIEW → user phải tạo ticket báo admin xác nhận thủ công<br />
              <strong>Nếu chuyển thiếu tiền:</strong> giao dịch 499,000đ → không khớp → cần admin xử lý thủ công
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div>
            <h3>Bảo mật & An toàn hệ thống</h3>

            <h4>1. Bảo mật tài khoản admin</h4>
            <ul>
              <li>Mật khẩu mạnh: ≥ 12 ký tự, gồm chữ hoa, thường, số, ký tự đặc biệt.</li>
              <li>Bắt buộc bật 2FA (email hoặc TOTP).</li>
              <li>Không chia sẻ tài khoản admin.</li>
              <li>Mỗi admin có tài khoản riêng, phân quyền phù hợp.</li>
              <li>Kiểm tra session thường xuyên, thu hồi session lạ.</li>
              <li>Đổi mật khẩu định kỳ 90 ngày.</li>
            </ul>

            <h4>2. Phân quyền admin</h4>
            <ul>
              <li>Nguyên tắc <strong>least privilege</strong>: cấp quyền tối thiểu cần thiết.</li>
              <li>Tạo role riêng cho từng nhóm chức năng.</li>
              <li>Không cấp quyền ADMIN toàn bộ cho tài khoản chỉ cần một số chức năng.</li>
              <li>Thu hồi quyền của admin không còn sử dụng.</li>
            </ul>

            <h4>3. Bảo mật hệ thống</h4>
            <ul>
              <li>API đều xác thực qua Bearer token hoặc API key.</li>
              <li>Rate limiting ngăn brute force.</li>
              <li>Audit log ghi mọi thao tác quan trọng.</li>
              <li>Settings nhạy cảm được đánh dấu <code>private</code>.</li>
              <li>Kết nối database, Redis được mã hóa.</li>
              <li>File upload kiểm tra loại và kích thước.</li>
            </ul>

            <h4>4. Thực hành tốt</h4>
            <ul>
              <li>Kiểm tra audit log thường xuyên.</li>
              <li>Theo dõi health dashboard.</li>
              <li>Sao lưu cấu hình hệ thống định kỳ.</li>
              <li>Cập nhật thông tin liên hệ để nhận thông báo khẩn.</li>
              <li>Thu hồi API key không còn sử dụng.</li>
            </ul>

            <div className="admin-guide-info">
              <strong>Ví dụ: Bật 2FA cho tài khoản admin</strong><br />
              Vào Hồ sơ → tab Bảo mật → mục Xác thực 2 lớp:<br />
              - Bấm <strong>Thiết lập</strong> bên cạnh "Email OTP"<br />
              - Hệ thống gửi mã OTP vào email đăng ký<br />
              - Nhập mã OTP → xác nhận → 2FA email đã bật<br />
              - Lần sau đăng nhập: nhập mật khẩu → nhập tiếp mã OTP gửi qua email → mới vào được admin<br />
              <strong>Nếu mất email:</strong> Vào Settings → tab Settings → tìm key <code>admin_2fa_required</code> → tạm thời tắt → user đăng nhập lại → bật lại 2FA với email khác
            </div>
            <div className="admin-guide-info">
              <strong>Ví dụ: Phân quyền admin mới</strong><br />
              Tuyển nhân viên chỉ phụ trách xử lý ticket, không cần vào Tài chính hay Dịch vụ:<br />
              - Vào Settings → tab Administrators → Roles<br />
              - Tạo role mới: <strong>Ticket Support</strong><br />
              - Gán quyền: <code>ticket:read</code>, <code>ticket:write</code>, <code>user:read</code><br />
              (KHÔNG gán <code>finance:*</code>, <code>service:write</code>, <code>admin:manage</code>)<br />
              - Vào danh sách Admin → chọn user → gán role "Ticket Support"<br />
              - Nhân viên đó chỉ thấy được menu Ticket và Người dùng (read-only), không thấy Tài chính
            </div>
          </div>
        )}

        {activeSection === 'troubleshooting' && (
          <div>
            <h3>Xử lý sự cố thường gặp</h3>

            <h4>1. User không nhận được email xác minh</h4>
            <ul>
              <li>Kiểm tra email nhập có chính xác không.</li>
              <li>Kiểm tra cấu hình email server trong Settings.</li>
              <li>Yêu cầu user kiểm tra thư mục Spam.</li>
              <li>Hướng dẫn user yêu cầu gửi lại email.</li>
              <li>Admin có thể xác minh thủ công trong trang quản lý user.</li>
            </ul>

            <h4>2. User nạp tiền nhưng chưa nhận được</h4>
            <ul>
              <li>Kiểm tra webhook SePay trong Settings → Webhooks → nhật ký.</li>
              <li>Nếu webhook không hoạt động: kiểm tra cấu hình kết nối.</li>
              <li>Nếu có giao dịch nhưng chưa xử lý: dùng nút Retry.</li>
              <li>Nếu không được: xác nhận nạp tiền thủ công (Tài chính → Tools).</li>
            </ul>

            <h4>3. Đơn hàng không được xử lý tự động</h4>
            <ul>
              <li>Kiểm tra loại dịch vụ: <code>MANUAL</code> → cần admin xử lý thủ công.</li>
              <li>Kiểm tra Jobs tab có job xử lý bị lỗi không.</li>
              <li>Kiểm tra kết nối API bên thứ ba (nếu AUTO).</li>
              <li>Thử retry job nếu FAILED.</li>
            </ul>

            <h4>4. Kho tài khoản hết hàng</h4>
            <ul>
              <li>Vào <strong>Kho tài khoản</strong>, lọc service đang hết.</li>
              <li>Kiểm tra: còn credential <code>AVAILABLE</code> không?</li>
              <li>Nhập thêm credential (từng cái hoặc CSV).</li>
              <li>Khi có credential mới, service tự động chuyển <code>stockStatus = AVAILABLE</code>.</li>
            </ul>

            <h4>5. User không mua được dịch vụ</h4>
            <ul>
              <li>Kiểm tra service có <code>status = ACTIVE</code> và <code>ctaType = BUY_NOW</code> không.</li>
              <li>Kiểm tra số dư user có đủ không.</li>
              <li>Kiểm tra credential <code>AVAILABLE</code> nếu là <code>ACCOUNT_STOCK</code>.</li>
              <li>Yêu cầu user chụp màn hình lỗi.</li>
            </ul>

            <h4>6. User báo lỗi thanh toán / số dư sai</h4>
            <ul>
              <li>Kiểm tra lịch sử giao dịch ví của user.</li>
              <li>Kiểm tra đơn hàng gần đây.</li>
              <li>Kiểm tra audit log xem ai đã thao tác.</li>
              <li>Điều chỉnh số dư nếu phát hiện sai sót, kèm lý do.</li>
            </ul>

            <h4>7. Hệ thống chậm hoặc không phản hồi</h4>
            <ul>
              <li>Vào Health tab: kiểm tra database, Redis, disk, uptime.</li>
              <li>Kiểm tra dung lượng ổ đĩa.</li>
              <li>Kiểm tra số lượng job đang chạy có quá tải không.</li>
              <li>Liên hệ đội ngũ kỹ thuật nếu cần can thiệp sâu.</li>
            </ul>

            <h4>8. Lỗi webhook SePay</h4>
            <ul>
              <li>Vào Settings → Webhooks → kiểm tra trạng thái.</li>
              <li>Kiểm tra cấu hình JSON có đúng không.</li>
              <li>Xem nhật ký webhook để biết lỗi chi tiết.</li>
              <li>Thử Retry nếu có giao dịch chưa xử lý.</li>
            </ul>

            <div className="admin-guide-note">
              <strong>Quy tắc ứng phó sự cố:</strong>
              <ol>
                <li>Xác định phạm vi ảnh hưởng (bao nhiêu user?).</li>
                <li>Thu thập thông tin từ người báo cáo.</li>
                <li>Xử lý tạm thời để giảm thiểu ảnh hưởng.</li>
                <li>Tìm nguyên nhân gốc rễ và xử lý triệt để.</li>
                <li>Thông báo kết quả cho user.</li>
                <li>Ghi lại bài học kinh nghiệm.</li>
              </ol>
            </div>

            <div className="admin-guide-info">
              <strong>Ví dụ: User nạp 500,000đ nhưng chưa thấy tiền trong ví</strong><br />
              User báo: "Tôi chuyển 500,000đ qua Vietcombank lúc 14h30, đã trừ tài khoản nhưng ví chưa lên"<br />
              Vào Settings → tab Webhooks → xem nhật ký:<br />
              - Nếu thấy giao dịch 500,000đ nhưng chưa xử lý → bấm Retry → tiền vào ví sau 1-2 phút<br />
              - Nếu không thấy giao dịch → kiểm tra cấu hình JSON SePay có đúng không → nếu sai sửa lại<br />
              - Nếu webhook hoạt động nhưng không khớp: vào Tài chính → Bank Transactions → tìm giao dịch 500k từ "TRAN VAN A" → Manual credit
            </div>
            <div className="admin-guide-info">
              <strong>Ví dụ: User không mua được dịch vụ, báo lỗi "Số dư không đủ"</strong><br />
              User có 50,000đ trong ví, muốn mua Netflix 120,000đ:<br />
              - Không đủ tiền → phải nạp thêm<br />
              Nghiệp vụ khác: User có 500,000đ nhưng vẫn báo lỗi:<br />
              - Vào Tài chính → Wallet → kiểm tra số dư thực tế của user<br />
              - Kiểm tra audit log xem có ai ADJUSTMENT gần đây không<br />
              - Nếu số dư sai lệch: dùng Balance check trong tab Wallet để phát hiện
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div>
            <h3>Hồ sơ Admin</h3>
            <p>
              Quản lý thông tin cá nhân của tài khoản admin. Truy cập: click vào tên/avatar trên sidebar
              → chọn "Hồ sơ", hoặc vào <code>/admin/profile</code>.
            </p>

            <h4>Thông tin cá nhân</h4>
            <ul>
              <li><strong>Tên</strong> – Cập nhật tên hiển thị.</li>
              <li><strong>Email</strong> – Email đăng nhập, không thể thay đổi.</li>
              <li><strong>Số điện thoại</strong> – Thêm SĐT để liên hệ.</li>
              <li><strong>Ảnh đại diện</strong> – Nhập URL ảnh.</li>
            </ul>

            <h4>Bảo mật</h4>
            <ul>
              <li><strong>Đổi mật khẩu:</strong> cần mật khẩu hiện tại + mật khẩu mới + xác nhận. Tối thiểu 8 ký tự.</li>
              <li><strong>2FA:</strong> hỗ trợ email 2FA và TOTP. Nên bật ít nhất một phương thức.</li>
              <li><strong>Quản lý phiên:</strong> xem danh sách session, thu hồi session lạ.</li>
              <li><strong>Thu hồi tất cả:</strong> dùng khi nghi ngờ tài khoản bị truy cập trái phép.</li>
            </ul>

            <h4>API Keys</h4>
            <ul>
              <li><strong>Tạo key:</strong> đặt tên, chọn scopes. Key chỉ hiển thị một lần.</li>
              <li><strong>Quản lý:</strong> xem danh sách, thu hồi key không dùng.</li>
              <li><strong>Scopes:</strong> chỉ cấp quyền tối thiểu cần thiết.</li>
            </ul>

            <h4>Thông báo</h4>
            <ul>
              <li>Xem thông báo hệ thống.</li>
              <li>Đánh dấu đã đọc từng cái hoặc tất cả.</li>
              <li>Bao gồm: đơn hàng mới, ticket mới, cảnh báo hệ thống.</li>
            </ul>

            <h4>Hành vi Người dùng (User Behavior)</h4>
            <ul>
              <li>Xem tổng quan hoạt động của user dưới quyền quản lý (nếu có).</li>
              <li>Theo dõi doanh thu, đơn hàng, tương tác gần đây.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default GuideTab
