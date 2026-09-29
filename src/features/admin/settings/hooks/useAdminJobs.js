import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../../api/admin.api'

export function useAdminJobs({
  loadSettings,
  onSetNotice,
  setSubmitting,
  setViewError,
  token,
}) {
  const { t } = useTranslation()
  const [jobs, setJobs] = useState([])

  const runJobAction = async (jobId, action) => {
    setSubmitting(true)
    setViewError('')
    try {
      if (action === 'retry') {
        await adminApi.retryJob(jobId, token)
      } else {
        await adminApi.cancelJob(jobId, token)
      }
      await loadSettings()
      onSetNotice(t('admin.settings.success.jobUpdated', { id: jobId }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.jobActionFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const refreshJobStatus = async (jobId) => {
    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.getJobStatus(jobId, token)
      setJobs((items) => items.map((item) => (item.id === saved.id ? saved : item)))
      onSetNotice(t('admin.settings.success.jobUpdated', { id: jobId }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.jobStatusFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const loadJobLogs = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      setJobs(await adminApi.getJobLogs(token))
      onSetNotice(t('admin.settings.success.jobLogsLoaded'))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.jobLogsFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return {
    jobs,
    loadJobLogs,
    refreshJobStatus,
    runJobAction,
    setJobs,
  }
}
