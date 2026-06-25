import { useCallback, useEffect, useState } from 'react'
import { userApi } from '../../../api/user.api'
import { createWebSocket } from '../../../lib/socket'
import { normalizeList, notificationRoute } from '../../../utils/appHelpers'

export function useNotifications({
  accessToken,
  authInit,
  currentUser,
  navigate,
  notify,
  onRealtimeNotification,
}) {
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const resetNotifications = useCallback(() => {
    setNotifications([])
    setNotificationsLoading(false)
    setUnreadNotifications(0)
  }, [])

  const loadNotifications = useCallback(async () => {
    if (!accessToken) {
      return
    }

    setNotificationsLoading(true)
    try {
      const [items, count] = await Promise.all([
        userApi.getNotifications(accessToken),
        userApi.getUnreadNotificationCount(accessToken),
      ])
      setNotifications(normalizeList(items))
      setUnreadNotifications(Number(count?.unread || 0))
    } catch (err) {
      notify(err, 'error', 'Không tải được thông báo.')
    } finally {
      setNotificationsLoading(false)
    }
  }, [accessToken, notify])

  const handleMarkNotificationRead = useCallback(async (notification) => {
    if (!accessToken || !notification?.id) {
      return
    }

    const route = notificationRoute(notification.actionUrl)
    if (route) {
      navigate(route)
    }

    if (notification.readAt) {
      return
    }

    try {
      const saved = await userApi.markNotificationRead(notification.id, accessToken)
      setNotifications((items) => normalizeList(items).map((item) => (item.id === saved.id ? saved : item)))
      setUnreadNotifications((count) => Math.max(0, count - 1))
    } catch (err) {
      notify(err, 'error', 'Không cập nhật được thông báo.')
    }
  }, [accessToken, navigate, notify])

  useEffect(() => {
    if (!accessToken || !authInit || !currentUser) {
      return undefined
    }

    const disconnect = createWebSocket({
      path: '/ws/notifications',
      token: accessToken,
      onMessage: (payload) => {
        if (payload.type === 'admin.notification.created' && payload.notification) {
          const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN'
          if (isAdmin) {
            notify(
              payload.notification.message || payload.notification.title || 'Có thông báo admin mới.',
              'info',
              payload.notification.title || 'Thông báo admin',
            )
          }
          return
        }

        if (payload.type !== 'notification.created') {
          return
        }

        if (Number.isFinite(Number(payload.unreadCount))) {
          setUnreadNotifications(Number(payload.unreadCount))
        } else {
          setUnreadNotifications((count) => count + 1)
        }

        if (payload.notification) {
          setNotifications((items) => [
            payload.notification,
            ...normalizeList(items).filter((item) => item.id !== payload.notification.id),
          ].slice(0, 20))
          notify(
            payload.notification.message || payload.notification.title || 'Bạn có thông báo mới.',
            'info',
            payload.notification.title || 'Thông báo mới',
            payload.notification.actionUrl,
          )
          onRealtimeNotification?.(payload.notification)
        }
      }
    })

    return () => {
      disconnect()
    }
  }, [accessToken, authInit, currentUser, notify, onRealtimeNotification])

  return {
    handleMarkNotificationRead,
    loadNotifications,
    notifications,
    notificationsLoading,
    resetNotifications,
    setUnreadNotifications,
    unreadNotifications,
  }
}
