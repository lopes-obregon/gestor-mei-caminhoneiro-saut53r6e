/**
 * Utilitários de CPF e CNPJ (novo formato alfanumérico).
 *
 * - CPF: 11 dígitos numéricos, formatado como `000.000.000-00`.
 * - CNPJ alfanumérico (novo formato da Receita): 12 caracteres alfanuméricos
 *   + 2 dígitos verificadores = 14 posições, formatado como
 *   `A1.B2C.3D4/E5F6-01` (mesma máscara visual do CNPJ numérico).
 */

export type DocumentType = 'cpf' | 'cnpj' | 'unknown'

/** Remove toda formatação, mantendo apenas [A-Za-z0-9], em maiúsculas. */
export const stripDocument = (value: string): string =>
  (value || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase()

/**
 * Detecta automaticamente se o valor é CPF ou CNPJ com base na quantidade
 * de caracteres alfanuméricos e na presença de letras.
 *
 * - Contém letra OU mais de 11 caracteres alfanuméricos → CNPJ.
 * - Caso contrário → CPF.
 */
export const detectDocumentType = (value: string): DocumentType => {
  const raw = stripDocument(value)
  if (!raw) return 'unknown'
  const hasLetter = /[A-Za-z]/.test(value || '')
  if (hasLetter || raw.length > 11) return 'cnpj'
  return 'cpf'
}

/** Formata parcialmente um CPF (aceita entradas incompletas). */
const formatCPF = (digits: string): string => {
  const d = digits.slice(0, 11)
  if (d.length > 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`
  return d
}

/** Formata parcialmente um CNPJ alfanumérico (aceita entradas incompletas). */
const formatCNPJ = (raw: string): string => {
  const d = raw.slice(0, 14)
  if (d.length > 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
  if (d.length > 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  if (d.length > 5) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length > 2) return `${d.slice(0, 2)}.${d.slice(2)}`
  return d
}

/**
 * Formata automaticamente CPF ou CNPJ enquanto o usuário digita.
 * Se o usuário digitar o CNPJ sem o traço, ele é adicionado automaticamente
 * ao atingir 13+ caracteres.
 */
export const formatDocument = (value: string): string => {
  const raw = stripDocument(value)
  if (!raw) return ''
  return detectDocumentType(value) === 'cnpj' ? formatCNPJ(raw) : formatCPF(raw)
}

/**
 * Valida um CPF usando o algoritmo oficial de dígitos verificadores
 * (módulo 11) da Receita Federal.
 */
export const validateCPF = (cpf: string): boolean => {
  const digits = (cpf || '').replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false // todos iguais

  const calcCheck = (slice: string, startWeight: number): number => {
    let sum = 0
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i], 10) * (startWeight - i)
    }
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }

  const d1 = calcCheck(digits.slice(0, 9), 10)
  const d2 = calcCheck(digits.slice(0, 9) + String(d1), 11)
  return d1 === parseInt(digits[9], 10) && d2 === parseInt(digits[10], 10)
}

/**
 * Valida um CNPJ no novo formato alfanumérico (`A1B2C3D4E5F6-01`).
 *
 * Regras:
 * - Remove formatação → 14 posições no total.
 * - Os 12 primeiros caracteres devem ser alfanuméricos.
 * - Os 2 últimos caracteres (dígitos verificadores) devem ser numéricos.
 */
export const validateCNPJAlfa = (cnpj: string): boolean => {
  const raw = stripDocument(cnpj)
  if (raw.length !== 14) return false
  // 12 primeiros alfanuméricos
  if (!/^[A-Z0-9]{12}$/.test(raw.slice(0, 12))) return false
  // 2 últimos numéricos (dígitos verificadores)
  if (!/^\d{2}$/.test(raw.slice(12, 14))) return false
  return true
}

/** Valida CPF ou CNPJ alfanumérico detectando o tipo automaticamente. */
export const validateDocument = (value: string): boolean => {
  const type = detectDocumentType(value)
  if (type === 'cpf') return validateCPF(value)
  if (type === 'cnpj') return validateCNPJAlfa(value)
  return false
}
