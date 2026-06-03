import StatusBadge from '../../components/status/StatusBadge'

function SupportView() {
  return (
    <section className="support-layout">
      <article className="ticket-form">
        <span className="eyebrow">Ticket</span>
        <h2>Yêu cầu hỗ trợ</h2>
        <label>
          Chủ đề
          <input defaultValue="Chuyển khoản cần kiểm tra" />
        </label>
        <label>
          Nội dung
          <textarea defaultValue="Mã nạp KD8F4N2L6Q chưa cập nhật số dư." />
        </label>
        <button className="primary-button" type="button">
          Gửi ticket
        </button>
      </article>

      <article className="ticket-list">
        <div>
          <strong>TK2H7M9P1</strong>
          <StatusBadge status="PROCESSING" />
        </div>
        <p>Chuyển khoản cần kiểm tra</p>
        <span>Đang chờ finance admin đối soát</span>
      </article>
    </section>
  )
}

export default SupportView
