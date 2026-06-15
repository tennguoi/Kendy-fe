import { useState } from 'react'

const sections = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'users', label: 'Người dùng' },
  { id: 'services', label: 'Dịch vụ & Bảng giá' },
  { id: 'orders', label: 'Đơn hàng' },
  { id: 'finance', label: 'Tài chính' },
  { id: 'tickets', label: 'Ticket & Hỗ trợ' },
  { id: 'user-guide', label: 'Hướng dẫn người dùng' },
  { id: 'workflow', label: 'Quy trình nghiệp vụ' },
  { id: 'settings-guide', label: 'Cài đặt hệ thống' },
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
              Trang tổng quan (Dashboard) là màn hình trung tâm hiển thị các chỉ số vận hành cốt lõi của toàn bộ hệ thống.
              Đây là nơi admin có thể nắm bắt nhanh tình hình kinh doanh và phát hiện các bất thường cần xử lý.
            </p>

            <h4>Các chỉ số chính</h4>
            <ul>
              <li><strong>Tổng số user</strong> &ndash; Tổng số tài khoản đã đăng ký trên hệ thống, không phân biệt trạng thái.</li>
              <li><strong>User đang hoạt động</strong> &ndash; Tài khoản có trạng thái ACTIVE, có thể đăng nhập và sử dụng dịch vụ.</li>
              <li><strong>User bị khóa</strong> &ndash; Tài khoản bị LOCKED do vi phạm hoặc yêu cầu bảo mật.</li>
              <li><strong>Đơn hàng hôm nay</strong> &ndash; Tổng số đơn hàng được tạo trong ngày hiện tại.</li>
              <li><strong>Doanh thu hôm nay</strong> &ndash; Tổng giá trị các đơn hàng thành công trong ngày.</li>
              <li><strong>Ticket chưa xử lý</strong> &ndash; Ticket đang ở trạng thái OPEN hoặc IN_PROGRESS, cần admin phản hồi.</li>
            </ul>

            <h4>Thao tác</h4>
            <ul>
              <li>Click vào từng thẻ chỉ số để điều hướng nhanh đến trang quản lý tương ứng.</li>
              <li>Sử dụng nút <strong>Tải lại</strong> để làm mới dữ liệu.</li>
              <li>Theo dõi các chỉ số theo chu kỳ để phát hiện xu hướng tăng trưởng hoặc suy giảm.</li>
            </ul>

            <h4>Lưu ý</h4>
            <p>
              Dữ liệu dashboard được tính toán real-time dựa trên cơ sở dữ liệu. Nếu có sự chênh lệch, hãy kiểm tra
              lại bộ lọc thời gian hoặc làm mới trang. Các chỉ số tài chính luôn được tính bằng VND.
            </p>
          </div>
        )}

        {activeSection === 'users' && (
          <div>
            <h3>Quản lý người dùng</h3>
            <p>
              Trang quản lý người dùng cho phép admin xem, tìm kiếm, lọc và thực hiện các thao tác quản trị
              trên tất cả tài khoản trong hệ thống. Đây là công cụ quan trọng để kiểm soát người dùng và
              đảm bảo an toàn cho hệ thống.
            </p>

            <h4>Danh sách người dùng</h4>
            <ul>
              <li>Hiển thị danh sách user kèm ảnh đại diện, tên, email, vai trò, số dư, trạng thái.</li>
              <li>Click vào một user để xem chi tiết ở panel bên phải.</li>
              <li>Thanh tìm kiếm hỗ trợ tìm theo tên, email, số điện thoại hoặc ID.</li>
              <li>Bộ lọc trạng thái: ACTIVE, LOCKED, PENDING_VERIFY, DISABLED.</li>
            </ul>

            <h4>Thao tác trên từng user</h4>
            <ul>
              <li><strong>Khóa / Mở khóa</strong> &ndash; Thay đổi trạng thái tài khoản. User bị khóa sẽ không thể đăng nhập hoặc sử dụng dịch vụ. Cần ghi rõ lý do để lưu vết audit.</li>
              <li><strong>Công cụ quản trị</strong> &ndash; Click vào icon MoreHorizontal để mở menu, chọn "Công cụ" để truy cập các chức năng nâng cao.</li>
              <li><strong>Điều chỉnh số dư</strong> &ndash; Cộng hoặc trừ số dư wallet, bắt buộc nhập lý do. Giao dịch sẽ được ghi nhận trong lịch sử wallet với loại ADJUSTMENT.</li>
              <li><strong>Thay đổi vai trò</strong> &ndash; Chuyển đổi giữa USER và ADMIN. Cần nhập lý do và xác nhận. Cảnh báo: trao quyền ADMIN cho user không đáng tin cậy có thể gây rủi ro bảo mật.</li>
              <li><strong>Thu hồi phiên</strong> &ndash; Xem danh sách session đăng nhập của user và thu hồi session cụ thể nếu phát hiện bất thường.</li>
            </ul>

            <h4>Thao tác hàng loạt</h4>
            <ul>
              <li>Nhập danh sách ID user (cách nhau bằng dấu phẩy) để thao tác cùng lúc.</li>
              <li>Hỗ trợ khóa/mở khóa hàng loạt. Mỗi thao tác đều được ghi vào audit log.</li>
            </ul>

            <h4>Chi tiết user</h4>
            <p>
              Panel chi tiết hiển thị đầy đủ thông tin và các tab dữ liệu liên quan:
            </p>
            <ul>
              <li><strong>Thông tin</strong> &ndash; Email, điện thoại, vai trò, số dư, trạng thái 2FA, ngày tạo, OAuth provider.</li>
              <li><strong>Đơn hàng</strong> &ndash; Danh sách đơn hàng của user, bao gồm mã đơn, dịch vụ, số tiền, trạng thái, thời gian.</li>
              <li><strong>Giao dịch ví</strong> &ndash; Lịch sử biến động số dư (nạp, mua, refund, điều chỉnh).</li>
              <li><strong>Phiên đăng nhập</strong> &ndash; Các session đang hoạt động, thời gian tạo, IP, thiết bị.</li>
              <li><strong>Ticket</strong> &ndash; Các ticket hỗ trợ của user, trạng thái, nội dung.</li>
            </ul>

            <h4>Ảnh đại diện</h4>
            <p>
              Ảnh đại diện được lấy từ tài khoản Google/GitHub khi user đăng nhập qua OAuth,
              hoặc do user tự cập nhật trong trang cài đặt hồ sơ. Nếu không có ảnh, hệ thống hiển thị
              chữ cái đầu tiên của tên user.
            </p>
          </div>
        )}

        {activeSection === 'services' && (
          <div>
            <h3>Quản lý Dịch vụ & Bảng giá</h3>

            <h4>Dịch vụ là gì?</h4>
            <p>
              Dịch vụ (Service) là đơn vị sản phẩm cốt lõi của hệ thống &ndash; thứ mà user có thể mua và thanh toán.
              Mỗi dịch vụ đại diện cho một loại hình cung cấp cụ thể, ví dụ: "Tăng follow Facebook", "Buff like Instagram",
              "Gửi SMS", "Đăng bài tự động".
            </p>
            <p>
              Dịch vụ là đầu vào cho toàn bộ quy trình kinh doanh: admin tạo dịch vụ → user xem → user mua → tạo đơn hàng → xử lý.
              Không có dịch vụ đồng nghĩa với không có đơn hàng và không có giao dịch tài chính.
            </p>

            <div className="admin-guide-info">
              <strong>Nguyên tắc quan trọng:</strong> Mỗi dịch vụ phải có <code>ctaType = BUY_NOW</code> và <code>status = ACTIVE</code>
              để user có thể mua được. Nếu dịch vụ chỉ để tham khảo, hãy dùng <code>CONTACT</code> hoặc <code>CONSULT</code>.
            </div>

            <h4>Các thuộc tính của Dịch vụ</h4>

            <h5>1. Thông tin cơ bản</h5>
            <ul>
              <li><strong>Tên dịch vụ</strong> &ndash; Tên hiển thị cho user, nên đặt ngắn gọn, rõ ràng.</li>
              <li><strong>Slug</strong> &ndash; Định danh URL, tự động sinh từ tên, có thể chỉnh sửa.</li>
              <li><strong>Mô tả ngắn</strong> &ndash; Mô tả tóm tắt hiển thị trong danh sách dịch vụ.</li>
              <li><strong>Mô tả chi tiết</strong> &ndash; Nội dung HTML đầy đủ, có thể bao gồm hình ảnh và định dạng.</li>
              <li><strong>Danh mục</strong> &ndash; Nhóm dịch vụ, giúp user dễ dàng tìm kiếm theo danh mục.</li>
            </ul>

            <h5>2. Phân loại theo loại hình</h5>
            <ul>
              <li><strong>MANUAL</strong> &ndash; Admin xử lý thủ công từng đơn. Phù hợp với dịch vụ cần can thiệp của con người.</li>
              <li><strong>AUTO</strong> &ndash; Hệ thống tự động xử lý qua API tích hợp. Phù hợp với dịch vụ tự động hóa.</li>
              <li><strong>SUBSCRIPTION</strong> &ndash; Dịch vụ định kỳ (hàng tháng), phù hợp với gói gia hạn.</li>
              <li><strong>API_CREDIT</strong> &ndash; Dịch vụ dùng API bên thứ ba, tính phí theo credit sử dụng.</li>
            </ul>

            <h5>3. Cấu hình giá</h5>
            <ul>
              <li><strong>price</strong> &ndash; Giá bán cho user. Đây là số tiền user phải trả khi mua dịch vụ.</li>
              <li><strong>costPrice</strong> &ndash; Giá vốn nội bộ, chỉ admin thấy. Dùng để tính lợi nhuận: lợi nhuận = price − costPrice.</li>
              <li><strong>priceText</strong> &ndash; Văn bản giá tùy chỉnh (ví dụ: "Liên hệ", "500k - 2tr") dùng cho dịch vụ dạng CONTACT/CONSULT.</li>
              <li><strong>pricingBadge</strong> &ndash; Nhãn khuyến mãi (ví dụ: "Hot", "Sale 20%", "Best seller").</li>
            </ul>

            <h5>4. Trạng thái và hiển thị</h5>
            <ul>
              <li><strong>status</strong> &ndash; Trạng thái dịch vụ:
                <ul>
                  <li><code>DRAFT</code> &ndash; Bản nháp, chưa công khai. Chỉ admin thấy.</li>
                  <li><code>ACTIVE</code> &ndash; Đang bán. User có thể thấy và mua (nếu ctaType = BUY_NOW).</li>
                  <li><code>INACTIVE</code> &ndash; Ngừng bán. User không thấy hoặc không mua được.</li>
                  <li><code>MAINTENANCE</code> &ndash; Bảo trì. Hiển thị thông báo bảo trì cho user.</li>
                </ul>
              </li>
              <li><strong>stockStatus</strong> &ndash; Tình trạng hàng: AVAILABLE (còn), OUT_OF_STOCK (hết hàng), CONSULTING_ONLY (chỉ tư vấn).</li>
              <li><strong>ctaType</strong> &ndash; Hành vi nút mua:
                <ul>
                  <li><code>BUY_NOW</code> &ndash; Cho phép mua trực tiếp (chỉ loại này mới tạo được đơn hàng).</li>
                  <li><code>CONTACT</code> &ndash; Yêu cầu liên hệ admin để được báo giá.</li>
                  <li><code>CONSULT</code> &ndash; Yêu cầu tư vấn trước khi mua.</li>
                </ul>
              </li>
              <li><strong>publicVisible</strong> &ndash; Có hiển thị ra ngoài danh sách công khai hay không.</li>
              <li><strong>featured</strong> &ndash; Đánh dấu nổi bật, hiển thị ở vị trí ưu tiên.</li>
            </ul>

            <h5>5. Thông tin bổ sung</h5>
            <ul>
              <li><strong>inputSchema</strong> &ndash; Cấu trúc JSON khai báo user cần nhập những trường gì khi mua (ví dụ: link profile, số điện thoại). Hệ thống tự động validate dữ liệu nhập vào theo schema này.</li>
              <li><strong>requirements</strong> &ndash; Yêu cầu từ user (ví dụ: "Tài khoản phải công khai", "Cần có tối thiểu 100 bài đăng").</li>
              <li><strong>benefits</strong> &ndash; Mô tả lợi ích user nhận được khi mua dịch vụ.</li>
              <li><strong>usageNotes</strong> &ndash; Hướng dẫn sử dụng dịch vụ sau khi mua.</li>
              <li><strong>processingTime</strong> &ndash; Thời gian xử lý dự kiến (ví dụ: "1-2 ngày", "Trong vòng 24h").</li>
              <li><strong>warrantyPolicy</strong> &ndash; Chính sách bảo hành và cam kết.</li>
              <li><strong>iconUrl</strong> &ndash; URL icon đại diện cho dịch vụ.</li>
              <li><strong>sortOrder</strong> &ndash; Thứ tự sắp xếp trong danh sách (số càng nhỏ càng lên trước).</li>
            </ul>

            <h4>Danh mục (Category)</h4>
            <p>
              Danh mục dùng để nhóm các dịch vụ cùng loại (ví dụ: "Facebook", "Instagram", "TikTok", "SMS").
              Mỗi danh mục có thể có danh mục con để tạo cấu trúc cây phân cấp.
            </p>
            <ul>
              <li><strong>Tạo danh mục</strong> &ndash; Nhập tên, slug (tự động sinh), mô tả, chọn danh mục cha nếu có, thiết lập thứ tự.</li>
              <li><strong>Sửa danh mục</strong> &ndash; Thay đổi thông tin, di chuyển sang cha khác.</li>
              <li><strong>Xóa danh mục</strong> &ndash; Chỉ xóa được khi không còn dịch vụ nào thuộc danh mục đó. Nếu có danh mục con, cần xử lý trước.</li>
            </ul>

            <h4>Quản lý Dịch vụ (Admin)</h4>
            <ul>
              <li><strong>Thêm dịch vụ</strong> &ndash; Điền đầy đủ thông tin, thiết lập status = ACTIVE và ctaType = BUY_NOW để user có thể mua. Kiểm tra kỹ inputSchema trước khi lưu.</li>
              <li><strong>Sửa dịch vụ</strong> &ndash; Thay đổi bất kỳ thông tin nào. Lưu ý: thay đổi giá chỉ ảnh hưởng đến đơn hàng mới.</li>
              <li><strong>Chuyển trạng thái</strong> &ndash; Dùng ACTIVE ↔ INACTIVE để bật/tắt bán. Dùng MAINTENANCE khi cần bảo trì.</li>
              <li><strong>Xóa dịch vụ</strong> &ndash; Chỉ nên xóa nếu dịch vụ chưa có đơn hàng nào. Nếu đã có đơn, hãy chuyển sang INACTIVE thay vì xóa.</li>
            </ul>

            <div className="admin-guide-note">
              <strong>Lưu ý quan trọng:</strong> Nếu bạn thay đổi giá dịch vụ sau khi có đơn hàng, các đơn hàng cũ
              <strong> không</strong> bị ảnh hưởng vì giá đã được sao chép vào đơn hàng tại thời điểm mua.
              Tuyệt đối không xóa dịch vụ đã có đơn hàng &ndash; hãy dùng trạng thái INACTIVE để ẩn dịch vụ.
            </div>

            <h4>Bảng giá</h4>
            <p>
              Hệ thống sử dụng cơ chế giá cố định cho mỗi dịch vụ:
            </p>
            <ul>
              <li>Mỗi dịch vụ có một giá bán duy nhất trong trường <code>price</code>.</li>
              <li>Giá này được hiển thị cho user và dùng để tính tiền khi tạo đơn hàng.</li>
              <li><code>costPrice</code> là giá vốn nội bộ (chỉ admin thấy) để tính lợi nhuận.</li>
              <li>Có thể thêm <code>pricingBadge</code> để hiển thị nhãn khuyến mãi.</li>
            </ul>
          </div>
        )}

        {activeSection === 'orders' && (
          <div>
            <h3>Quản lý đơn hàng</h3>

            <h4>Đơn hàng là gì?</h4>
            <p>
              Đơn hàng (Order) là bản ghi giao dịch phát sinh khi user mua một dịch vụ trên hệ thống.
              Mỗi đơn hàng ghi nhận: ai mua, mua dịch vụ gì, số tiền bao nhiêu, trạng thái xử lý ra sao.
              Đơn hàng là trung tâm kết nối giữa dịch vụ (sản phẩm), người dùng (khách hàng) và tài chính (số dư ví).
            </p>

            <h4>Cấu trúc một đơn hàng</h4>
            <ul>
              <li><strong>Mã đơn</strong> &ndash; Mã duy nhất, tự động sinh theo định dạng <code>OD...</code> (10 ký tự).</li>
              <li><strong>Người mua</strong> &ndash; User đã đặt hàng (liên kết đến bảng users).</li>
              <li><strong>Dịch vụ</strong> &ndash; Dịch vụ được mua (liên kết đến bảng services).</li>
              <li><strong>Số tiền</strong> &ndash; Giá trị thanh toán, lấy từ ServiceItem.price tại thời điểm mua.</li>
              <li><strong>Dữ liệu đầu vào</strong> &ndash; Thông tin user nhập theo inputSchema của dịch vụ (dạng JSON).</li>
              <li><strong>Trạng thái</strong> &ndash; Trạng thái xử lý hiện tại.</li>
              <li><strong>Giao dịch ví</strong> &ndash; Liên kết đến WalletTransaction (ghi nợ từ ví).</li>
              <li><strong>Thời gian</strong> &ndash; Ngày tạo, ngày cập nhật, ngày hoàn thành.</li>
            </ul>

            <h4>Các trạng thái đơn hàng</h4>
            <ul>
              <li><strong>PROCESSING</strong> ("Đang xử lý") &ndash; Trạng thái mặc định khi đơn hàng vừa được tạo. Admin hoặc hệ thống đang xử lý.</li>
              <li><strong>COMPLETED</strong> ("Hoàn thành") &ndash; Đã xử lý xong, bàn giao kết quả cho user.</li>
              <li><strong>FAILED</strong> ("Thất bại") &ndash; Không thể hoàn thành (lỗi nhà cung cấp, sai thông tin).</li>
              <li><strong>CANCELLED</strong> ("Đã hủy") &ndash; Bị hủy bởi user hoặc admin. Tiền sẽ được hoàn lại vào ví.</li>
              <li><strong>REFUNDED</strong> ("Đã hoàn tiền") &ndash; Đã hoàn tiền cho đơn sau khi hoàn thành hoặc thất bại.</li>
            </ul>

            <h4>Luồng tạo đơn hàng</h4>
            <ol>
              <li><strong>User chọn dịch vụ</strong> &ndash; User xem danh sách, chọn dịch vụ có ctaType = BUY_NOW và status = ACTIVE.</li>
              <li><strong>User điền thông tin</strong> &ndash; Nhập dữ liệu theo inputSchema của dịch vụ.</li>
              <li><strong>User chọn thanh toán</strong> &ndash; Có 2 phương thức:
                <ul>
                  <li><strong>Ví điện tử (Wallet)</strong> &ndash; Thanh toán ngay bằng số dư.</li>
                  <li><strong>Chuyển khoản ngân hàng</strong> &ndash; Hệ thống tạo yêu cầu nạp tiền, hiển thị thông tin tài khoản và QR. Khi Sepay webhook báo có, hệ thống tự động nạp tiền và tạo đơn.</li>
                </ul>
              </li>
              <li><strong>Hệ thống xử lý thanh toán</strong> &ndash; Kiểm tra số dư, trừ tiền qua WalletLedgerService, ghi WalletTransaction loại PURCHASE, tạo OrderRecord với trạng thái PROCESSING.</li>
              <li><strong>Xử lý đơn hàng</strong> &ndash; Admin xem đơn, cập nhật trạng thái. Nếu hủy, hệ thống tự động hoàn tiền qua WalletLedgerService.credit() với loại REFUND.</li>
            </ol>

            <h4>Admin thao tác trên đơn hàng</h4>
            <ul>
              <li><strong>Xem danh sách</strong> &ndash; Hiển thị mã đơn, user, dịch vụ, số tiền, trạng thái, ngày tạo.</li>
              <li><strong>Bộ lọc</strong> &ndash; Lọc theo trạng thái, khoảng thời gian, tìm kiếm theo mã đơn hoặc email user.</li>
              <li><strong>Xem chi tiết</strong> &ndash; Click vào đơn để xem thông tin đầy đủ và lịch sử thay đổi trạng thái.</li>
              <li><strong>Xác nhận hoàn thành</strong> &ndash; Đánh dấu đã xử lý xong, kèm ghi chú và kết quả.</li>
              <li><strong>Đánh thất bại</strong> &ndash; Đánh dấu không thể xử lý, ghi rõ lý do.</li>
              <li><strong>Hủy đơn</strong> &ndash; Hủy và hoàn tiền vào ví user.</li>
              <li><strong>Hoàn tiền</strong> &ndash; Hoàn tiền cho đơn đã hoàn thành hoặc thất bại.</li>
              <li><strong>Gia hạn xử lý</strong> &ndash; Kéo dài thời gian xử lý, ghi rõ lý do.</li>
            </ul>

            <div className="admin-guide-note">
              <strong>Lưu ý:</strong> Khi hủy đơn hàng, hệ thống tự động hoàn tiền vào ví user. Hãy kiểm tra số dư
              ví trước và sau khi hủy để đảm bảo tính chính xác. Việc hủy đơn cần có lý do rõ ràng.
            </div>
          </div>
        )}

        {activeSection === 'finance' && (
          <div>
            <h3>Quản lý tài chính</h3>
            <p>
              Trang tài chính tổng hợp tất cả hoạt động liên quan đến tiền tệ trong hệ thống, bao gồm nạp tiền,
              giao dịch ví, quản lý ngân hàng và các công cụ tài chính.
            </p>

            <h4>Nạp tiền (Deposit)</h4>
            <p>Theo dõi và quản lý tất cả yêu cầu nạp tiền từ người dùng:</p>
            <ul>
              <li>Danh sách các yêu cầu nạp tiền kèm trạng thái: PENDING, COMPLETED, FAILED.</li>
              <li>Xác nhận nạp tiền thủ công nếu giao dịch ngân hàng không tự động xử lý được.</li>
              <li>Xem chi tiết giao dịch: user, số tiền, phương thức, mã giao dịch ngân hàng, thời gian.</li>
              <li>Bộ lọc tìm kiếm theo trạng thái, khoảng thời gian, user.</li>
            </ul>

            <h4>Ví điện tử (Wallet)</h4>
            <p>Quản lý số dư và lịch sử biến động của tất cả user:</p>
            <ul>
              <li><strong>PURCHASE</strong> &ndash; Trừ tiền khi mua dịch vụ.</li>
              <li><strong>DEPOSIT</strong> &ndash; Nạp tiền vào ví.</li>
              <li><strong>REFUND</strong> &ndash; Hoàn tiền từ đơn hàng bị hủy.</li>
              <li><strong>ADJUSTMENT</strong> &ndash; Điều chỉnh số dư bởi admin (cộng hoặc trừ).</li>
            </ul>

            <h4>Ngân hàng (Bank)</h4>
            <p>Quản lý thông tin tài khoản ngân hàng nhận tiền từ user:</p>
            <ul>
              <li>Cập nhật thông tin tài khoản: tên ngân hàng, số tài khoản, chủ tài khoản.</li>
              <li>Theo dõi giao dịch ngân hàng đến để đối soát tự động qua webhook Sepay.</li>
              <li>Kiểm tra trạng thái kết nối webhook và lịch sử webhook đã nhận.</li>
            </ul>

            <h4>Công cụ tài chính</h4>
            <ul>
              <li><strong>Điều chỉnh số dư</strong> &ndash; Cộng hoặc trừ trực tiếp vào ví user, cần nhập lý do.</li>
              <li><strong>Nạp tiền thủ công</strong> &ndash; Tạo giao dịch nạp tiền cho user khi cần.</li>
              <li><strong>Hoàn tiền</strong> &ndash; Hoàn tiền cho đơn hàng đã hoàn thành hoặc thất bại.</li>
            </ul>

            <div className="admin-guide-note">
              <strong>Lưu ý:</strong> Mọi thao tác điều chỉnh tài chính đều được ghi vào audit log.
              Luôn kiểm tra kỹ số tiền và lý do trước khi xác nhận. Các giao dịch tài chính không thể tự ý xóa bỏ.
            </div>
          </div>
        )}

        {activeSection === 'tickets' && (
          <div>
            <h3>Quản lý Ticket hỗ trợ</h3>
            <p>
              Ticket là kênh hỗ trợ chính thức để người dùng gửi yêu cầu, thắc mắc hoặc báo cáo vấn đề.
              Admin có trách nhiệm xem, trả lời và quản lý ticket kịp thời.
            </p>

            <h4>Danh sách Ticket</h4>
            <ul>
              <li>Hiển thị tiêu đề, user gửi, trạng thái, mức độ ưu tiên, ngày tạo.</li>
              <li>Trạng thái: OPEN, IN_PROGRESS, RESOLVED, CLOSED.</li>
              <li>Click vào ticket để xem chi tiết nội dung hội thoại.</li>
              <li>Sắp xếp theo thời gian để ưu tiên xử lý ticket mới nhất.</li>
            </ul>

            <h4>Quy trình xử lý ticket</h4>
            <ol>
              <li><strong>Tiếp nhận</strong> &ndash; Xem nội dung ticket, đánh giá mức độ nghiêm trọng.</li>
              <li><strong>Phân loại</strong> &ndash; Gán ưu tiên: LOW, MEDIUM, HIGH, URGENT.</li>
              <li><strong>Xử lý</strong> &ndash; Chuyển trạng thái sang IN_PROGRESS, tiến hành giải quyết.</li>
              <li><strong>Phản hồi</strong> &ndash; Trả lời user với thông tin chi tiết và hướng giải quyết.</li>
              <li><strong>Đóng ticket</strong> &ndash; Chuyển sang RESOLVED khi đã giải quyết xong, CLOSED khi kết thúc.</li>
            </ol>

            <h4>Thao tác</h4>
            <ul>
              <li><strong>Trả lời</strong> &ndash; Gửi phản hồi tới user. Nên trả lời chi tiết, rõ ràng.</li>
              <li><strong>Đổi trạng thái</strong> &ndash; Chuyển trạng thái khi đang xử lý hoặc đã giải quyết.</li>
              <li><strong>Đổi ưu tiên</strong> &ndash; Điều chỉnh mức ưu tiên theo tình hình thực tế.</li>
            </ul>

            <div className="admin-guide-note">
              <strong>Lưu ý:</strong> Ticket URGENT cần được phản hồi trong vòng 1 giờ. Ticket HIGH trong vòng 4 giờ.
              Không để ticket ở trạng thái OPEN quá 24 giờ mà không có phản hồi.
            </div>
          </div>
        )}

        {activeSection === 'user-guide' && (
          <div>
            <h3>Hướng dẫn sử dụng cho người dùng cuối</h3>
            <p>
              Phần này mô tả chi tiết cách người dùng cuối (end-user) tương tác với hệ thống, từ đăng ký tài khoản
              đến mua dịch vụ và theo dõi đơn hàng. Admin cần nắm rõ để có thể hỗ trợ user khi cần.
            </p>

            <h4>1. Đăng ký và đăng nhập</h4>
            <ul>
              <li>User có thể đăng ký bằng email + mật khẩu hoặc qua OAuth (Google, GitHub).</li>
              <li>Sau khi đăng ký, user cần xác minh email trước khi sử dụng đầy đủ tính năng.</li>
              <li>Đăng nhập hỗ trợ email + mật khẩu hoặc OAuth.</li>
              <li>User có thể bật 2FA (email hoặc TOTP) để tăng cường bảo mật.</li>
            </ul>

            <h4>2. Nạp tiền vào ví</h4>
            <ul>
              <li>User vào mục <strong>Nạp tiền</strong> trên sidebar.</li>
              <li>Nhập số tiền muốn nạp (tối thiểu và tối đa tùy theo cấu hình hệ thống).</li>
              <li>Hệ thống hiển thị thông tin tài khoản ngân hàng và mã QR chuyển khoản.</li>
              <li>User chuyển tiền và chờ hệ thống xác nhận tự động qua webhook Sepay.</li>
              <li>Khi tiền được xác nhận, số dư ví sẽ được cập nhật ngay lập tức.</li>
              <li>Nếu quá thời gian chờ, user có thể liên hệ admin qua ticket để được hỗ trợ.</li>
            </ul>

            <h4>3. Mua dịch vụ</h4>
            <ul>
              <li>User vào mục <strong>Dịch vụ</strong> để xem danh sách các dịch vụ đang bán.</li>
              <li>Có thể lọc theo danh mục, tìm kiếm theo tên dịch vụ.</li>
              <li>Click vào dịch vụ để xem chi tiết: mô tả, giá, yêu cầu, thời gian xử lý, chính sách bảo hành.</li>
              <li>Nhấn nút <strong>Mua ngay</strong> để bắt đầu quy trình đặt hàng.</li>
              <li>Điền các thông tin theo yêu cầu của dịch vụ (link, số điện thoại, ghi chú...).</li>
              <li>Chọn phương thức thanh toán: ví điện tử hoặc chuyển khoản.</li>
              <li>Xác nhận đơn hàng. Hệ thống sẽ tạo đơn và chuyển sang trạng thái PROCESSING.</li>
            </ul>

            <h4>4. Theo dõi đơn hàng</h4>
            <ul>
              <li>User vào mục <strong>Đơn hàng</strong> để xem tất cả đơn đã đặt.</li>
              <li>Xem trạng thái hiện tại: PROCESSING, COMPLETED, FAILED, CANCELLED, REFUNDED.</li>
              <li>Click vào đơn hàng để xem chi tiết: dịch vụ, số tiền, dữ liệu nhập, lịch sử trạng thái.</li>
              <li>Nếu đơn đang PROCESSING quá lâu, user có thể tạo ticket để hỏi admin.</li>
            </ul>

            <h4>5. Quản lý tài khoản</h4>
            <ul>
              <li><strong>Hồ sơ</strong> &ndash; Cập nhật tên, email, số điện thoại, ảnh đại diện.</li>
              <li><strong>Bảo mật</strong> &ndash; Đổi mật khẩu, bật/tắt 2FA, quản lý phiên đăng nhập.</li>
              <li><strong>API Keys</strong> &ndash; Tạo và quản lý API key để tích hợp với hệ thống bên ngoài.</li>
              <li><strong>Thông báo</strong> &ndash; Xem thông báo từ hệ thống và admin.</li>
            </ul>

            <h4>6. Hỗ trợ</h4>
            <ul>
              <li>User vào mục <strong>Hỗ trợ</strong> để tạo ticket mới.</li>
              <li>Điền tiêu đề, nội dung, chọn mức ưu tiên.</li>
              <li>Admin sẽ phản hồi trong thời gian sớm nhất.</li>
              <li>User có thể xem lịch sử ticket và phản hồi lại admin.</li>
            </ul>
          </div>
        )}

        {activeSection === 'workflow' && (
          <div>
            <h3>Quy trình nghiệp vụ</h3>
            <p>
              Phần này mô tả các quy trình nghiệp vụ chuẩn mà admin cần tuân thủ để đảm bảo vận hành hệ thống
              nhất quán, chuyên nghiệp và an toàn.
            </p>

            <h4>1. Quy trình xử lý đơn hàng mới</h4>
            <ol>
              <li>Kiểm tra đơn hàng mới trong danh sách (trạng thái PROCESSING).</li>
              <li>Xem chi tiết: dịch vụ, dữ liệu user nhập, số tiền đã thanh toán.</li>
              <li>Xác minh thông tin user cung cấp có hợp lệ không.</li>
              <li>Tiến hành xử lý theo loại dịch vụ (MANUAL: làm thủ công; AUTO: kiểm tra kết quả API).</li>
              <li>Cập nhật trạng thái:
                <ul>
                  <li><strong>COMPLETED</strong> &ndash; Nếu xử lý thành công, kèm ghi chú kết quả.</li>
                  <li><strong>FAILED</strong> &ndash; Nếu không thể xử lý, ghi rõ lý do.</li>
                </ul>
              </li>
              <li>Thông báo kết quả cho user qua hệ thống notification.</li>
            </ol>

            <h4>2. Quy trình xử lý khiếu nại / hoàn tiền</h4>
            <ol>
              <li>Tiếp nhận ticket khiếu nại từ user.</li>
              <li>Kiểm tra đơn hàng liên quan: trạng thái, dữ liệu, lịch sử xử lý.</li>
              <li>Đánh giá: có lỗi từ phía hệ thống/admin hay do user cung cấp sai thông tin.</li>
              <li>Nếu lỗi thuộc về hệ thống:
                <ul>
                  <li>Hủy đơn hàng (nếu đang PROCESSING).</li>
                  <li>Hoặc hoàn tiền (REFUND) nếu đơn đã hoàn thành.</li>
                  <li>Ghi chú chi tiết lý do.</li>
                </ul>
              </li>
              <li>Nếu lỗi thuộc về user: giải thích và hướng dẫn user đặt lại đơn mới.</li>
              <li>Phản hồi ticket với kết quả xử lý.</li>
            </ol>

            <h4>3. Quy trình tạo dịch vụ mới</h4>
            <ol>
              <li>Xác định nhu cầu thị trường và loại dịch vụ cần tạo.</li>
              <li>Tạo danh mục (nếu chưa có) phù hợp với dịch vụ.</li>
              <li>Tạo dịch vụ mới với đầy đủ thông tin:
                <ul>
                  <li>Tên, mô tả, giá bán, giá vốn.</li>
                  <li>inputSchema: xác định rõ user cần nhập trường gì.</li>
                  <li>processingTime: thời gian xử lý dự kiến.</li>
                  <li>warrantyPolicy: chính sách bảo hành.</li>
                </ul>
              </li>
              <li>Đặt status = ACTIVE, ctaType = BUY_NOW.</li>
              <li>Kiểm tra hiển thị trên giao diện user trước khi công khai.</li>
            </ol>

            <h4>4. Quy trình xử lý user báo cáo / bị khóa</h4>
            <ol>
              <li>Xem xét lý do user bị báo cáo hoặc cần khóa.</li>
              <li>Kiểm tra lịch sử hoạt động, đơn hàng, ticket của user.</li>
              <li>Quyết định:
                <ul>
                  <li><strong>Khóa tạm thời</strong> &ndash; Nếu cần điều tra thêm.</li>
                  <li><strong>Khóa vĩnh viễn</strong> &ndash; Nếu vi phạm nghiêm trọng.</li>
                  <li><strong>Cảnh báo</strong> &ndash; Nếu vi phạm lần đầu.</li>
                </ul>
              </li>
              <li>Ghi rõ lý do trong hệ thống để lưu audit.</li>
              <li>Thông báo cho user về quyết định (nếu cần).</li>
            </ol>

            <div className="admin-guide-note">
              <strong>Nguyên tắc chung:</strong> Mọi quyết định quản trị đều phải có lý do rõ ràng, được ghi lại
              trong audit log. Luôn ưu tiên giải quyết vấn đề của user một cách công bằng và minh bạch.
            </div>
          </div>
        )}

        {activeSection === 'settings-guide' && (
          <div>
            <h3>Cài đặt hệ thống</h3>
            <p>
              Trang cài đặt hệ thống bao gồm nhiều tab chức năng để cấu hình và vận hành hệ thống.
              Dưới đây là hướng dẫn chi tiết từng tab.
            </p>

            <h4>Settings</h4>
            <p>Quản lý các biến cấu hình hệ thống dạng key-value:</p>
            <ul>
              <li><strong>Danh sách settings</strong> &ndash; Xem tất cả key, giá trị, trạng thái public/private.</li>
              <li><strong>Thêm / Sửa</strong> &ndash; Thay đổi giá trị setting, đánh dấu public (hiển thị cho user) hoặc private (chỉ admin).</li>
              <li><strong>Tìm kiếm</strong> &ndash; Lọc theo tên key để tìm nhanh.</li>
              <li><strong>Lịch sử</strong> &ndash; Xem ai đã thay đổi setting nào, giá trị cũ và mới.</li>
              <li><strong>Backup / Restore</strong> &ndash; Sao lưu toàn bộ settings ra file JSON và khôi phục khi cần.</li>
              <li><strong>2FA bắt buộc</strong> &ndash; Bật/tắt yêu cầu xác thực hai yếu tố cho tất cả admin.</li>
            </ul>

            <h4>Webhook</h4>
            <p>Cấu hình webhook Sepay để tự động xử lý nạp tiền qua ngân hàng:</p>
            <ul>
              <li><strong>Cấu hình</strong> &ndash; Nhập thông số kết nối Sepay (JSON).</li>
              <li><strong>Trạng thái</strong> &ndash; Kiểm tra kết nối webhook có hoạt động không.</li>
              <li><strong>Nhật ký</strong> &ndash; Xem lịch sử webhook đã nhận, kết quả xử lý.</li>
              <li><strong>Retry</strong> &ndash; Gửi lại webhook cho giao dịch cụ thể nếu xử lý thất bại.</li>
            </ul>

            <h4>Notifications</h4>
            <p>Quản lý thông báo hệ thống và cấu hình nhận thông báo:</p>
            <ul>
              <li><strong>Danh sách</strong> &ndash; Xem thông báo, đánh dấu đã đọc.</li>
              <li><strong>Cấu hình</strong> &ndash; Thiết lập kênh nhận thông báo.</li>
            </ul>

            <h4>Admins &amp; Phân quyền</h4>
            <p>Quản lý tài khoản admin, vai trò và quyền hạn:</p>
            <ul>
              <li><strong>Danh sách Admin</strong> &ndash; Xem tất cả tài khoản có quyền admin.</li>
              <li><strong>Vai trò (Role)</strong> &ndash; Tạo, sửa, xóa vai trò, gán quyền cho từng vai trò.</li>
              <li><strong>Phân quyền</strong> &ndash; Gán quyền cụ thể (permissions) cho admin hoặc vai trò.</li>
              <li><strong>2FA Admin</strong> &ndash; Thiết lập, bật/tắt, reset 2FA cho admin.</li>
              <li><strong>Session Admin</strong> &ndash; Xem và thu hồi phiên đăng nhập của admin.</li>
              <li><strong>Khóa/Mở Admin</strong> &ndash; Khóa tài khoản admin khi cần.</li>
            </ul>

            <h4>Audit (Nhật ký hoạt động)</h4>
            <p>Xem lịch sử thao tác của tất cả admin trong hệ thống:</p>
            <ul>
              <li><strong>Danh sách</strong> &ndash; Hiển thị hành động: ai làm, làm gì, lúc nào.</li>
              <li><strong>Lọc</strong> &ndash; Tìm theo hành động, admin, target ID, target type.</li>
              <li><strong>Chi tiết</strong> &ndash; Xem thông tin đầy đủ của một audit log.</li>
              <li><strong>Export</strong> &ndash; Xuất nhật ký ra file XLSX hoặc CSV.</li>
            </ul>

            <h4>Files (Quản lý tệp)</h4>
            <p>Upload, tải xuống và xóa tệp tin trên hệ thống:</p>
            <ul>
              <li><strong>Upload</strong> &ndash; Chọn tệp từ máy tính để tải lên server.</li>
              <li><strong>Tải xuống</strong> &ndash; Nhập file ID và tải tệp về máy.</li>
              <li><strong>Xóa</strong> &ndash; Xóa tệp không còn sử dụng.</li>
              <li><strong>Preview</strong> &ndash; Xem trước nội dung tệp nếu được hỗ trợ.</li>
            </ul>

            <h4>Jobs (Tác vụ nền)</h4>
            <p>Quản lý các tác vụ chạy ngầm trong hệ thống:</p>
            <ul>
              <li><strong>Danh sách</strong> &ndash; Xem tất cả job, trạng thái (ACTIVE, FAILED, COMPLETED).</li>
              <li><strong>Thử lại</strong> &ndash; Chạy lại job bị lỗi.</li>
              <li><strong>Hủy</strong> &ndash; Dừng job đang chạy.</li>
              <li><strong>Logs</strong> &ndash; Xem nhật ký chi tiết của từng job.</li>
            </ul>

            <h4>Health (Kiểm tra hệ thống)</h4>
            <p>Kiểm tra tình trạng hoạt động của các thành phần:</p>
            <ul>
              <li><strong>Database</strong> &ndash; Trạng thái kết nối PostgreSQL.</li>
              <li><strong>Redis</strong> &ndash; Trạng thái kết nối Redis.</li>
              <li><strong>Disk</strong> &ndash; Dung lượng ổ đĩa còn trống.</li>
              <li><strong>Uptime</strong> &ndash; Thời gian hệ thống đã chạy liên tục.</li>
            </ul>
          </div>
        )}

        {activeSection === 'security' && (
          <div>
            <h3>Bảo mật & An toàn hệ thống</h3>
            <p>
              Bảo mật là ưu tiên hàng đầu trong vận hành hệ thống. Phần này hướng dẫn các biện pháp bảo mật
              cần thiết cho admin và người dùng.
            </p>

            <h4>1. Bảo mật tài khoản admin</h4>
            <ul>
              <li>Sử dụng mật khẩu mạnh (tối thiểu 12 ký tự, bao gồm chữ hoa, chữ thường, số, ký tự đặc biệt).</li>
              <li>Bắt buộc bật 2FA (email hoặc TOTP) cho tất cả tài khoản admin.</li>
              <li>Không chia sẻ tài khoản admin giữa nhiều người.</li>
              <li>Mỗi admin nên có tài khoản riêng với phân quyền phù hợp.</li>
              <li>Thường xuyên kiểm tra danh sách session đăng nhập và thu hồi session không rõ nguồn gốc.</li>
              <li>Đổi mật khẩu định kỳ 90 ngày một lần.</li>
            </ul>

            <h4>2. Phân quyền admin</h4>
            <ul>
              <li>Áp dụng nguyên tắc <strong>least privilege</strong> &ndash; chỉ cấp quyền tối thiểu cần thiết cho công việc.</li>
              <li>Tạo các role riêng biệt cho từng nhóm chức năng (quản lý user, quản lý tài chính, quản lý dịch vụ...).</li>
              <li>Không cấp quyền ADMIN toàn bộ cho tài khoản chỉ cần một số chức năng cụ thể.</li>
              <li>Xem xét và thu hồi quyền của admin không còn sử dụng.</li>
            </ul>

            <h4>3. Bảo mật người dùng</h4>
            <ul>
              <li>User được yêu cầu xác minh email trước khi sử dụng dịch vụ.</li>
              <li>Hỗ trợ 2FA cho user muốn tăng cường bảo mật.</li>
              <li>API key có scopes giới hạn, user chỉ được tạo key với quyền mình cần.</li>
              <li>Session đăng nhập có thời hạn và tự động hết hạn.</li>
              <li>Phát hiện và khóa tài khoản có dấu hiệu bất thường.</li>
            </ul>

            <h4>4. Bảo mật hệ thống</h4>
            <ul>
              <li>Tất cả API đều được xác thực qua Bearer token hoặc API key.</li>
              <li>Rate limiting được áp dụng để ngăn chặn tấn công brute force.</li>
              <li>Audit log ghi lại mọi thao tác quan trọng của admin.</li>
              <li>Settings nhạy cảm được đánh dấu private, không hiển thị cho user.</li>
              <li>Kết nối đến database và Redis được mã hóa.</li>
              <li>File upload được kiểm tra loại và kích thước.</li>
            </ul>

            <h4>5. Thực hành tốt</h4>
            <ul>
              <li>Kiểm tra audit log thường xuyên để phát hiện hoạt động bất thường.</li>
              <li>Theo dõi health dashboard để đảm bảo các service hoạt động ổn định.</li>
              <li>Sao lưu cấu hình hệ thống định kỳ (settings backup).</li>
              <li>Cập nhật thông tin liên hệ để nhận thông báo khẩn từ hệ thống.</li>
              <li>Kiểm tra và thu hồi API key không còn sử dụng.</li>
            </ul>
          </div>
        )}

        {activeSection === 'troubleshooting' && (
          <div>
            <h3>Xử lý sự cố thường gặp</h3>
            <p>
              Tổng hợp các sự cố thường gặp và cách xử lý dành cho admin.
            </p>

            <h4>1. User không nhận được email xác minh</h4>
            <ul>
              <li>Kiểm tra email user nhập có chính xác không.</li>
              <li>Kiểm tra cấu hình email server trong settings hệ thống.</li>
              <li>Yêu cầu user kiểm tra thư mục Spam/Junk.</li>
              <li>Hướng dẫn user yêu cầu gửi lại email xác minh.</li>
              <li>Nếu vẫn không được, admin có thể xác minh thủ công trong trang quản lý user.</li>
            </ul>

            <h4>2. User nạp tiền nhưng chưa nhận được</h4>
            <ul>
              <li>Kiểm tra trạng thái webhook Sepay trong tab Webhook của Settings.</li>
              <li>Kiểm tra nhật ký webhook xem có nhận được giao dịch không.</li>
              <li>Nếu webhook không hoạt động, kiểm tra cấu hình kết nối Sepay.</li>
              <li>Nếu có giao dịch nhưng chưa xử lý, dùng chức năng Retry để gửi lại.</li>
              <li>Nếu vẫn không được, xác nhận nạp tiền thủ công trong trang quản lý tài chính.</li>
            </ul>

            <h4>3. Đơn hàng không được xử lý tự động</h4>
            <ul>
              <li>Kiểm tra loại dịch vụ: nếu là MANUAL thì cần admin xử lý thủ công.</li>
              <li>Kiểm tra jobs tab xem có job xử lý đơn hàng bị lỗi không.</li>
              <li>Kiểm tra kết nối API bên thứ ba nếu dịch vụ loại AUTO.</li>
              <li>Thử retry job nếu job bị FAILED.</li>
            </ul>

            <h4>4. Hệ thống chậm hoặc không phản hồi</h4>
            <ul>
              <li>Kiểm tra Health tab: database, Redis, disk, uptime.</li>
              <li>Kiểm tra dung lượng ổ đĩa còn trống.</li>
              <li>Kiểm tra kết nối database có ổn định không.</li>
              <li>Kiểm tra Redis có hoạt động không.</li>
              <li>Xem xét số lượng job đang chạy có quá tải không.</li>
              <li>Liên hệ đội ngũ kỹ thuật nếu cần can thiệp sâu.</li>
            </ul>

            <h4>5. Lỗi thanh toán / số dư không chính xác</h4>
            <ul>
              <li>Kiểm tra lịch sử giao dịch ví (Wallet) của user.</li>
              <li>Kiểm tra các đơn hàng gần đây của user.</li>
              <li>Kiểm tra audit log để xem ai đã thao tác trên tài khoản này.</li>
              <li>Điều chỉnh số dư nếu phát hiện sai sót, kèm lý do chi tiết.</li>
            </ul>

            <h4>6. User báo lỗi khi mua dịch vụ</h4>
            <ul>
              <li>Kiểm tra dịch vụ có status = ACTIVE và ctaType = BUY_NOW không.</li>
              <li>Kiểm tra inputSchema có đúng định dạng không.</li>
              <li>Kiểm tra số dư user có đủ không.</li>
              <li>Yêu cầu user chụp màn hình lỗi để xác định nguyên nhân.</li>
              <li>Tạo ticket để theo dõi nếu cần xử lý phức tạp.</li>
            </ul>

            <div className="admin-guide-note">
              <strong>Quy tắc ứng phó sự cố:</strong>
              <ol>
                <li>Xác định phạm vi ảnh hưởng (bao nhiêu user bị ảnh hưởng).</li>
                <li>Thu thập thông tin chi tiết từ người báo cáo.</li>
                <li>Xử lý tạm thời để giảm thiểu ảnh hưởng.</li>
                <li>Tìm nguyên nhân gốc rễ và xử lý triệt để.</li>
                <li>Thông báo kết quả cho người dùng.</li>
                <li>Ghi lại bài học kinh nghiệm để tránh tái diễn.</li>
              </ol>
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div>
            <h3>Hồ sơ Admin</h3>
            <p>
              Trang hồ sơ admin cho phép bạn quản lý thông tin cá nhân của tài khoản admin hiện tại.
              Truy cập từ sidebar menu → click vào tên/avatar → chọn "Hồ sơ".
            </p>

            <h4>Thông tin cá nhân</h4>
            <ul>
              <li><strong>Tên</strong> &ndash; Cập nhật tên hiển thị. Nên dùng tên thật để đồng nghiệp dễ nhận biết.</li>
              <li><strong>Email</strong> &ndash; Email đăng nhập, không thể thay đổi.</li>
              <li><strong>Số điện thoại</strong> &ndash; Thêm số điện thoại để liên hệ khi cần.</li>
              <li><strong>Ảnh đại diện</strong> &ndash; Nhập URL ảnh đại diện, hiển thị ở sidebar và topbar.</li>
            </ul>

            <h4>Bảo mật</h4>
            <ul>
              <li><strong>Đổi mật khẩu</strong> &ndash; Cần nhập mật khẩu hiện tại, mật khẩu mới và xác nhận. Mật khẩu mới tối thiểu 8 ký tự.</li>
              <li><strong>2FA</strong> &ndash; Hỗ trợ email 2FA và TOTP. Nên bật ít nhất một phương thức.</li>
              <li><strong>Quản lý phiên</strong> &ndash; Xem danh sách session, thu hồi session không mong muốn.</li>
              <li><strong>Thu hồi tất cả phiên</strong> &ndash; Dùng khi nghi ngờ tài khoản bị truy cập trái phép.</li>
            </ul>

            <h4>API Keys</h4>
            <ul>
              <li><strong>Tạo key</strong> &ndash; Đặt tên, chọn scopes phù hợp. Key chỉ hiển thị một lần sau khi tạo.</li>
              <li><strong>Quản lý</strong> &ndash; Xem danh sách key, thu hồi key không dùng đến.</li>
              <li><strong>Scopes</strong> &ndash; Chỉ cấp quyền tối thiểu cần thiết cho mục đích sử dụng.</li>
            </ul>

            <h4>Thông báo</h4>
            <ul>
              <li>Xem thông báo hệ thống gửi đến tài khoản của bạn.</li>
              <li>Đánh dấu đã đọc từng thông báo hoặc tất cả cùng lúc.</li>
              <li>Thông báo bao gồm: đơn hàng mới, ticket mới, cảnh báo hệ thống.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default GuideTab