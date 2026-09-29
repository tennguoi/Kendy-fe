import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../../api/admin.api'

export function useSepaySettings({
  loadSettings,
  onSetNotice,
  setSubmitting,
  setViewError,
  token,
}) {
  const { t } = useTranslation()
  const [sepayStatus, setSepayStatus] = useState(null)
  const [sepayLogs, setSepayLogs] = useState([])
  const [sepayConfigText, setSepayConfigText] = useState('{}')
  const [retryForm, setRetryForm] = useState({ bankTransactionId: '', depositCode: '', reason: '' })

  const saveSepayConfig = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.updateSepayConfig({ config: JSON.parse(sepayConfigText) }, token)
      await loadSettings()
      onSetNotice(t('admin.settings.success.webhookSaved'))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.webhookSaveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const retryWebhook = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.retrySepayWebhook(
        {
          bankTransactionId: Number(retryForm.bankTransactionId),
          depositCode: retryForm.depositCode.trim() || undefined,
          reason: retryForm.reason.trim(),
        },
        token,
      )
      setRetryForm({ bankTransactionId: '', depositCode: '', reason: '' })
      await loadSettings()
      onSetNotice(t('admin.settings.success.webhookRetried'))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.webhookRetryFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return {
    retryForm,
    retryWebhook,
    saveSepayConfig,
    sepayConfigText,
    sepayLogs,
    sepayStatus,
    setRetryForm,
    setSepayConfigText,
    setSepayLogs,
    setSepayStatus,
  }
}
