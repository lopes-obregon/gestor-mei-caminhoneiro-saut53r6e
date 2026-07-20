import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useAuth } from './use-auth'
import { getTrips, getExpenses } from '@/services/api'
import { Trip, Expense } from '@/types'
import { useRealtime } from './use-realtime'

interface DataContextType {
  trips: Trip[]
  expenses: Expense[]
  loadingData: boolean
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within a DataProvider')
  return context
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return
    if (user?.payment_status !== 'paid') return
    try {
      const [t, e] = await Promise.all([getTrips(), getExpenses()])
      setTrips(t)
      setExpenses(e)
    } catch (error) {
      console.error('Error fetching app data:', error)
    } finally {
      setLoadingData(false)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    } else {
      setTrips([])
      setExpenses([])
    }
  }, [isAuthenticated, loadData])

  useRealtime('trips', loadData, isAuthenticated)
  useRealtime('expenses', loadData, isAuthenticated)

  return (
    <DataContext.Provider value={{ trips, expenses, loadingData, refresh: loadData }}>
      {children}
    </DataContext.Provider>
  )
}
