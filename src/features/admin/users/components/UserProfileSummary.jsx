import { AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'

function UserProfileSummary({ detail, selectedUser }) {
  return (
    <>
      <div className="admin-panel-head">
        <h3>{selectedUser ? selectedUser.name || selectedUser.email : 'Chọn user'}</h3>
        {selectedUser && <AdminStatusBadge status={selectedUser.status} />}
      </div>

      <dl className="admin-detail-list">
        <div><dt>Email</dt><dd>{selectedUser.email}</dd></div>
        <div><dt>Điện thoại</dt><dd>{selectedUser.phone || 'Chưa có'}</dd></div>
        <div><dt>Vai trò</dt><dd>{selectedUser.role}</dd></div>
        <div><dt>Số dư</dt><dd>{formatAdminMoney(selectedUser.balance)}</dd></div>
        <div><dt>2FA</dt><dd>{selectedUser.twoFactorEnabled ? 'Đã bật' : 'Chưa bật'}</dd></div>
        <div><dt>Ngày tạo</dt><dd>{formatAdminDate(selectedUser.createdAt)}</dd></div>
      </dl>

      {detail && (
        <div className="admin-report-grid compact-report">
          <div><span>Đơn</span><strong>{detail.orderCount}</strong></div>
          <div><span>Nạp</span><strong>{formatAdminMoney(detail.completedDepositAmount)}</strong></div>
          <div><span>Mua</span><strong>{formatAdminMoney(detail.purchaseAmount)}</strong></div>
          <div><span>Refund</span><strong>{formatAdminMoney(detail.refundAmount)}</strong></div>
        </div>
      )}
    </>
  )
}

export default UserProfileSummary
