import { useState, useEffect, useCallback, useRef } from 'react'
import { AppNotification } from '@/types'
import { getNotifications, markNotificationsAsRead } from '@/services/notifications'
import { useAuth } from './use-auth'
import { useRealtime } from './use-realtime'

export function useNotifications() {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      if (isMountedRef.current) {
        setNotifications([])
        setLoading(false)
      }
      return
    }

    try {
      const list = await getNotifications()
      if (isMountedRef.current) {
        setNotifications(list)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [isAuthenticated, user?.id])

  // Initial load
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Polling every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user?.id, fetchNotifications])

  // Realtime subscription for instant updates
  useRealtime(
    'notifications',
    () => {
      fetchNotifications()
    },
    isAuthenticated && !!user?.id,
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = useCallback(
    async (ids: string[]) => {
      if (!ids || ids.length === 0) return

      // Optimistic update
      setNotifications((prev) =>
        prev.map((item) => (ids.includes(item.id) ? { ...item, read: true } : item)),
      )

      try {
        await markNotificationsAsRead(ids)
      } catch (error) {
        console.error('Failed to mark notifications as read:', error)
        // Refetch on error to restore true state
        fetchNotifications()
      }
    },
    [fetchNotifications],
  )

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds)
    }
  }, [notifications, markAsRead])

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
