import { BarChart3, CreditCard, Save, Wallet } from 'lucide-react'
import BaseInput from '../../../../components/ui/BaseInput'
import BaseTextarea from '../../../../components/ui/BaseTextarea'

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
  runBulkBankCredit,
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
              <BaseInput
                label="Mã nạp"
                value={bankActionForm.depositCode}
                onChange={(value) => setBankActionForm((current) => ({ ...current, depositCode: value }))}
              />
              <BaseInput
                label="User ID manual credit"
                value={bankActionForm.userId}
                onChange={(value) => setBankActionForm((current) => ({ ...current, userId: value.replace(/\D/g, '') }))}
                inputMode="numeric"
              />
              <BaseTextarea
                label="Lý do"
                value={bankActionForm.reason}
                onChange={(value) => setBankActionForm((current) => ({ ...current, reason: value }))}
                rows="3"
                required
              />
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
            <form className="admin-form compact" id="finance-bank-bulk-form" onSubmit={runBulkBankCredit}>
              <BaseTextarea
                label="Bank transaction IDs"
                value={bankBulkForm.ids}
                onChange={(value) => setBankBulkForm((current) => ({ ...current, ids: value }))}
                rows="2"
                placeholder="VD: 101, 102, 103"
              />
              <BaseInput
                label="User ID"
                value={bankBulkForm.userId}
                onChange={(value) => setBankBulkForm((current) => ({ ...current, userId: value.replace(/\D/g, '') }))}
                inputMode="numeric"
              />
              <BaseInput
                label="Mã nạp"
                value={bankBulkForm.depositCode}
                onChange={(value) => setBankBulkForm((current) => ({ ...current, depositCode: value }))}
              />
              <BaseTextarea
                label="Lý do"
                value={bankBulkForm.reason}
                onChange={(value) => setBankBulkForm((current) => ({ ...current, reason: value }))}
                rows="2"
              />
              <button type="button" className="admin-icon-button finance-inline-button" onClick={() => setBankBulkForm((current) => ({ ...current, ids: selectedBank ? String(selectedBank.id) : current.ids }))}>
                Dùng giao dịch đang chọn
              </button>
              <button type="submit" className="admin-primary-button finance-inline-button">
                Chạy bulk credit
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
            <BaseInput
              label="Số phút gia hạn"
              value={depositActionForm.minutes}
              onChange={(value) => setDepositActionForm((current) => ({ ...current, minutes: value.replace(/\D/g, '') }))}
              inputMode="numeric"
            />
            <BaseTextarea
              label="Lý do"
              value={depositActionForm.reason}
              onChange={(value) => setDepositActionForm((current) => ({ ...current, reason: value }))}
              rows="3"
              required
            />
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