import { useTranslation } from 'react-i18next'

function BankStack({ success, pending, failed }) {
  const { t } = useTranslation()
  const total = Math.max(1, success + pending + failed)
  return (
    <div className="ov-bank-stack">
      <div className="ov-bank-stack-bar">
        <span className="success" style={{ width: `${(success / total) * 100}%` }} />
        <span className="pending" style={{ width: `${(pending / total) * 100}%` }} />
        <span className="failed" style={{ width: `${(failed / total) * 100}%` }} />
      </div>
      <div className="ov-bank-legend">
        <b className="success">{t('admin.overview.bankMonitoring.success')} {success}</b>
        <b className="pending">{t('admin.overview.bankMonitoring.pending')} {pending}</b>
        <b className="failed">{t('admin.overview.bankMonitoring.failed')} {failed}</b>
      </div>
    </div>
  )
}

export default BankStack
