import { LogOut } from 'lucide-react'
import { money } from '../../utils/currency'

function Topbar({ title, displayBalance, onLogout }) {
  return (
    <header className="topbar">
      <div>
        <p>Platform dịch vụ số</p>
        <h1>{title}</h1>
      </div>
      <div className="top-actions">
        <label className="search">
          <span>Tìm</span>
          <input type="search" placeholder="Đơn, dịch vụ, giao dịch" />
        </label>
        <button type="button" className="balance-button">
          {money.format(displayBalance)}
        </button>
        <button type="button" className="logout-button" onClick={onLogout} title="Đăng xuất">
          <LogOut size={18} strokeWidth={2} aria-hidden="true" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  )
}

export default Topbar
