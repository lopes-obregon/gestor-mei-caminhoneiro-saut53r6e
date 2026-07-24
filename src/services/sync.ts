import pb from '@/lib/pocketbase/client'

export interface SyncUser {
  name?: string
  email?: string
  payment_status?: string
  external_id?: string
}

export interface CheckSyncResult {
  synced: boolean
  user: SyncUser | null
}

export const checkUserSync = async (email: string): Promise<CheckSyncResult> => {
  return pb.send('/backend/v1/check-user-sync', {
    method: 'POST',
    body: JSON.stringify({ email }),
    headers: { 'Content-Type': 'application/json' },
  })
}
