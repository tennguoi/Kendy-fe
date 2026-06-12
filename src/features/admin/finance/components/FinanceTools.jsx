import { BarChart3, CreditCard, Save, Wallet } from 'lucide-react'

const financeToolTabs = [
  { id: 'bank', label: 'Bank', icon: CreditCard },
  { id: 'deposits', label: 'Nạp', icon: Save },
  { id: 'wallet', label: 'Ví', icon: Wallet },
]

function FinanceTools({
  activeToolTab,
  bankActionForm,
  bankBulkForm,
  depositActionForm,
  onActiveToolTabChange,
  selectedBank,
  selectedDeposit,
  setBankActionForm,
  setBankBulkForm,
  setDepositActionForm,
}) {
  return (
    <div className="finance-tools-panel">
      <div className="finance-tool-tabs" role="tablist" aria-label="Công cụ tài chính">
        {financeToolTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              type="button"
              className={activeToolTab === tab.id ? 'active' : ''}
              key={tab.id}
              role="tab"
              aria-selected={activeToolTab === tab.id}
              onClick={() => onActiveToolTabChange(tab.id)}
            >
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {activeToolTab === 'bank' && (
        <div className="finance-tool-body">
          <section className="finance-tool-section">
            <div className="finance-tool-head">
              <CreditCard size={18} strokeWidth={2} aria-hidden="true" />
              <div>
                <strong>Bank transaction</strong>
                <span>{selectedBank ? `#${selectedBank.id}` : 'Chọn giao dịch bank để xử lý'}</span>
              </div>
            </div>
            <form className="admin-form compact" onSubmit={(event) => event.preventDefault()}>
              <label>
                <span>Mã nạp</span>
                <input value={bankActionForm.depositCode} onChange={(event) => setBankActionForm((current) => ({ ...current, depositCode: event.target.value }))} />
              </label>
              <label>
                <span>User ID manual credit</span>
                <input value={bankActionForm.userId} onChange={(event) => setBankActionForm((current) => ({ ...current, userId: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" />
              </label>
              <label>
                <span>Lý do</span>
                <textarea value={bankActionForm.reason} onChange={(event) => setBankActionForm((current) => ({ ...current, reason: event.target.value }))} rows="3" required />
              </label>
            </form>
          </section>

          <section className="finance-tool-section">
            <div className="finance-tool-head">
              <Save size={18} strokeWidth={2} aria-hidden="true" />
              <div>
                <strong>Bulk manual credit</strong>
                <span>Xử lý nhiều bank transaction cùng lúc</span>
              </div>
            </div>
            <form className="admin-form compact" id="finance-bank-bulk-form">
              <label>
                <span>Bank transaction IDs</span>
                <textarea value={bankBulkForm.ids} onChange={(event) => setBankBulkForm((current) => ({ ...current, ids: event.target.value }))} rows="2" placeholder="VD: 101, 102, 103" />
              </label>
              <label>
                <span>User ID</span>
                <input value={bankBulkForm.userId} onChange={(event) => setBankBulkForm((current) => ({ ...current, userId: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" />
              </label>
              <label>
                <span>Mã nạp</span>
                <input value={bankBulkForm.depositCode} onChange={(event) => setBankBulkForm((current) => ({ ...current, depositCode: event.target.value }))} />
              </label>
              <label>
                <span>Lý do</span>
                <textarea value={bankBulkForm.reason} onChange={(event) => setBankBulkForm((current) => ({ ...current, reason: event.target.value }))} rows="2" />
              </label>
              <button type="button" className="admin-icon-button finance-inline-button" onClick={() => setBankBulkForm((current) => ({ ...current, ids: selectedBank ? String(selectedBank.id) : current.ids }))}>
                Dùng giao dịch đang chọn
              </button>
            </form>
          </section>
        </div>
      )}

      {activeToolTab === 'deposits' && (
        <section className="finance-tool-section">
          <div className="finance-tool-head">
            <Save size={18} strokeWidth={2} aria-hidden="true" />
            <div>
              <strong>Yêu cầu nạp</strong>
              <span>{selectedDeposit ? selectedDeposit.depositCode : 'Chọn yêu cầu nạp để xử lý'}</span>
            </div>
          </div>
          <form className="admin-form compact" onSubmit={(event) => event.preventDefault()}>
            <label>
              <span>Số phút gia hạn</span>
              <input value={depositActionForm.minutes} onChange={(event) => setDepositActionForm((current) => ({ ...current, minutes: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" />
            </label>
            <label>
              <span>Lý do</span>
              <textarea value={depositActionForm.reason} onChange={(event) => setDepositActionForm((current) => ({ ...current, reason: event.target.value }))} rows="3" required />
            </label>
          </form>
        </section>
      )}

      {activeToolTab === 'wallet' && (
        <section className="finance-tool-section">
          <div className="finance-tool-head">
            <BarChart3 size={18} strokeWidth={2} aria-hidden="true" />
            <div>
              <strong>Đối soát ví</strong>
              <span>Dùng các nút trên header để chạy check, preview hoặc tải report.</span>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default FinanceTools
