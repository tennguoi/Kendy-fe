import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../../api/admin.api'

export function useAdminNotifications({
  loadSettings,
  onSetNotice,
  setSubmitting,
  setViewError,
  token,
}) {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [notificationSetting, setNotificationSetting] = useState(null)

  const updateNotificationSetting = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.updateNotificationSettings({ value: notificationSetting?.value || '{}' }, token)
      await loadSettings()
      onSetNotice(t('admin.settings.success.notificationSaved'))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.notificationSaveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const markAllNotificationsRead = async () => {
    const unreadIds = notifications.filter((item) => !item.readAt).map((item) => item.id)
    if (unreadIds.length === 0) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.bulkReadNotifications({ ids: unreadIds }, token)
      setNotifications(saved)
      onSetNotice(t('admin.settings.success.notificationsRead', { count: unreadIds.length }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.notificationFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const markNotificationRead = async (notificationId) => {
    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.markNotificationRead(notificationId, token)
      setNotifications((items) => items.map((item) => (item.id === saved.id ? saved : item)))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.notificationFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return {
    markAllNotificationsRead,
    markNotificationRead,
    notificationSetting,
    notifications,
    setNotificationSetting,
    setNotifications,
    updateNotificationSetting,
  }
}
