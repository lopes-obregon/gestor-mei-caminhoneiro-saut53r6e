import pb from '@/lib/pocketbase/client'
import { AppNotification } from '@/types'

export const getNotifications = async (): Promise<AppNotification[]> => {
  return pb.collection('notifications').getFullList<AppNotification>({
    sort: '-created',
  })
}

export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  if (!userId) return 0
  const result = await pb.collection('notifications').getList(1, 1, {
    filter: `user_id = "${userId}" && read = false`,
  })
  return result.totalItems
}

export const markNotificationsAsRead = async (ids: string[]): Promise<void> => {
  if (!ids || ids.length === 0) return
  await Promise.allSettled(
    ids.map((id) =>
      pb.collection('notifications').update(id, {
        read: true,
      }),
    ),
  )
}
