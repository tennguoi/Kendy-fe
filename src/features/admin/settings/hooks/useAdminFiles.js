import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../../api/admin.api'
import { downloadBlobFile } from '../settings.utils'

export function useAdminFiles({
  onSetNotice,
  setSubmitting,
  setViewError,
  token,
}) {
  const { t } = useTranslation()
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [fileIdInput, setFileIdInput] = useState('')
  const [fileToUpload, setFileToUpload] = useState(null)

  const uploadAdminFile = async (event) => {
    event.preventDefault()
    if (!fileToUpload) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.uploadAdminFile(fileToUpload, token)
      setUploadedFiles((items) => [saved, ...items.filter((item) => item.id !== saved.id)])
      setFileIdInput(String(saved.id))
      setFileToUpload(null)
      onSetNotice(t('admin.settings.success.fileUploaded', { name: saved.fileName }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.fileUploadFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const downloadAdminFile = async (mode, fileId = fileIdInput) => {
    const normalizedId = Number(fileId)
    if (!normalizedId) {
      setViewError(t('admin.settings.error.fileIdRequired'))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const data =
        mode === 'preview'
          ? await adminApi.previewAdminFile(normalizedId, token)
          : await adminApi.downloadAdminFile(normalizedId, token)
      downloadBlobFile(`admin-file-${normalizedId}${mode === 'preview' ? '-preview' : ''}`, data)
      onSetNotice(t('admin.settings.success.fileDownloaded', { id: normalizedId }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.fileDownloadFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const deleteAdminFile = async (fileId = fileIdInput) => {
    const normalizedId = Number(fileId)
    if (!normalizedId) {
      setViewError(t('admin.settings.error.fileIdRequired'))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.deleteAdminFile(normalizedId, token)
      setUploadedFiles((items) => items.filter((item) => item.id !== normalizedId))
      if (fileIdInput === String(normalizedId)) {
        setFileIdInput('')
      }
      onSetNotice(t('admin.settings.success.fileDeleted', { id: normalizedId }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.fileDeleteFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return {
    deleteAdminFile,
    downloadAdminFile,
    fileIdInput,
    fileToUpload,
    setFileIdInput,
    setFileToUpload,
    setUploadedFiles,
    uploadAdminFile,
    uploadedFiles,
  }
}
