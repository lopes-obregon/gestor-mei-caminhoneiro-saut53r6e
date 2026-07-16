import pb from '@/lib/pocketbase/client'
import { Trip, Expense } from '@/types'

export const getTrips = async (): Promise<Trip[]> => {
  return pb.collection('trips').getFullList<Trip>({
    sort: '-date',
  })
}

export const createTrip = async (data: Partial<Trip>): Promise<Trip> => {
  data.user_id = pb.authStore.record?.id
  return pb.collection('trips').create<Trip>(data)
}

export const updateTrip = async (id: string, data: Partial<Trip>): Promise<Trip> => {
  return pb.collection('trips').update<Trip>(id, data)
}

export const deleteTrip = async (id: string): Promise<void> => {
  await pb.collection('trips').delete(id)
}

export const getExpenses = async (): Promise<Expense[]> => {
  return pb.collection('expenses').getFullList<Expense>({
    sort: '-date',
    expand: 'trip_id',
  })
}

export const createExpense = async (data: Partial<Expense>): Promise<Expense> => {
  data.user_id = pb.authStore.record?.id
  return pb.collection('expenses').create<Expense>(data)
}

export const updateExpense = async (id: string, data: Partial<Expense>): Promise<Expense> => {
  return pb.collection('expenses').update<Expense>(id, data)
}

export const deleteExpense = async (id: string): Promise<void> => {
  await pb.collection('expenses').delete(id)
}
