import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(isoString: string, dateFormat = 'dd/MM/yyyy') {
  if (!isoString) return ''
  try {
    return format(parseISO(isoString), dateFormat, { locale: ptBR })
  } catch (e) {
    return isoString
  }
}
