import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../../api/admin.api'
import { downloadBlobFile, downloadTextFile } from '../settings.utils'

export function useAuditSettings({
  onSetNotice,
  setSubmitting,
  setViewError,
  token,
}) {
  const { t } = useTranslation()
  const [auditLogs, setAuditLogs] = useState([])
  const [selectedAudit, setSelectedAudit] = useState(null)
  const [auditExportFormat, setAuditExportFormat] = useState('xlsx')
  const [auditFilter, setAuditFilter] = useState({
    action: '',
    adminId: '',
    query: '',
    targetId: '',
    targetType: '',
  })

  const loadAuditLogs = async (event) => {
    event?.preventDefault()
    setSubmitting(true)
    setViewError('')
    try {
      const params = {
        action: auditFilter.action.trim(),
        actorUserId: auditFilter.adminId ? Number(auditFilter.adminId) : undefined,
        query: auditFilter.query.trim(),
        targetId: auditFilter.targetId ? Number(auditFilter.targetId) : undefined,
        targetType: auditFilter.targetType.trim(),
      }
      const data = await adminApi.getAuditLogs(params, token)
      setAuditLogs(data)
      setSelectedAudit(data[0] || null)
      onSetNotice(t('admin.settings.success.auditLoaded', { count: data.length }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.auditLoadFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const loadAuditList = async (actionOverride) => {
    setSubmitting(true)
    setViewError('')
    try {
      const action = typeof actionOverride === 'string' ? actionOverride : auditFilter.action.trim()
      const data = await adminApi.listAuditLogs({ action }, token)
      setAuditLogs(data)
      setSelectedAudit(data[0] || null)
      onSetNotice(t('admin.settings.success.auditLoaded', { count: data.length }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.auditLoadFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const loadAdminActions = async () => {
    if (!auditFilter.adminId) {
      setViewError(t('admin.settings.error.adminActionIdRequired'))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const data = await adminApi.getAdminActions(Number(auditFilter.adminId), {}, token)
      setAuditLogs(data)
      setSelectedAudit(data[0] || null)
      onSetNotice(t('admin.settings.success.auditLoaded', { count: data.length }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.adminActionsLoadFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const loadAuditDetail = async (auditId) => {
    setSubmitting(true)
    setViewError('')
    try {
      setSelectedAudit(await adminApi.getAuditLogDetail(auditId, token))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.auditDetailFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const exportAudit = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      const data = await adminApi.exportAuditLogs(token, auditExportFormat)
      if (auditExportFormat === 'xlsx') {
        downloadBlobFile('audit-logs.xlsx', data)
      } else {
        downloadTextFile('audit-logs.csv', data)
      }
      onSetNotice(t('admin.settings.success.exportDone', { format: auditExportFormat, type: 'audit-logs' }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.exportFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return {
    auditExportFormat,
    auditFilter,
    auditLogs,
    exportAudit,
    loadAdminActions,
    loadAuditDetail,
    loadAuditList,
    loadAuditLogs,
    selectedAudit,
    setAuditExportFormat,
    setAuditFilter,
    setAuditLogs,
    setSelectedAudit,
  }
}
