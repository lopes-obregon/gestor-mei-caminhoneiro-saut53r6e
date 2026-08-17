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
    // PocketBase armazena datas como strings ISO (ex: "2026-08-13 10:00:00.000Z").
    // Garante que a data seja interpretada como horário local sem deslocamento de fuso,
    // exibindo exatamente a data cadastrada no banco.
    let normalized = isoString
    if (typeof normalized === 'string') {
      // Se vier apenas "YYYY-MM-DD", adiciona o tempo para evitar ajuste de fuso
      if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        normalized = normalized + 'T00:00:00'
      } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(normalized)) {
        // Converte "YYYY-MM-DD HH:mm:ss[.sss][Z]" para ISO com 'T'
        normalized = normalized.replace(' ', 'T')
      }
    }
    return format(parseISO(normalized), dateFormat, { locale: ptBR })
  } catch (e) {
    return isoString
  }
}
