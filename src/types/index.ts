export interface Trip {
  id: string
  user_id: string
  company: string
  origin: string
  destination: string
  date: string
  distance_km: number
  gross_value: number
  advance_value: number
  advance_type: 'toll' | 'fuel' | 'cash' | 'none'
  status: 'pending' | 'completed'
  created: string
  updated: string
}

export type ExpenseCategory =
  | 'fuel'
  | 'toll'
  | 'food'
  | 'helper'
  | 'installment'
  | 'insurance'
  | 'tracker'
  | 'tax'
  | 'maintenance_parts'
  | 'maintenance_labor'
  | 'tires'
  | 'other'

export interface Expense {
  id: string
  user_id: string
  trip_id: string
  category: ExpenseCategory
  amount: number
  description: string
  date: string
  created: string
  updated: string
  expand?: {
    trip_id?: Trip
  }
}

export interface AppNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'payment' | 'system' | 'alert'
  read: boolean
  payload?: Record<string, any>
  created: string
  updated: string
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  fuel: 'Combustível',
  toll: 'Pedágio',
  food: 'Alimentação',
  helper: 'Chapa',
  installment: 'Parcela Caminhão',
  insurance: 'Seguro',
  tracker: 'Rastreador',
  tax: 'DAS-MEI',
  maintenance_parts: 'Peças',
  maintenance_labor: 'Mão de Obra',
  tires: 'Pneus',
  other: 'Outros',
}
