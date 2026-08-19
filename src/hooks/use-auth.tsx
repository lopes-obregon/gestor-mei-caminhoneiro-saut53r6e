import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { validateDocument } from '@/lib/document'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  signUp: (
    name: string,
    email: string,
    password: string,
    document: string,
    phone?: string,
  ) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  requestVerification: (email: string) => Promise<{ error: any }>
  requestPasswordReset: (email: string) => Promise<{ error: any }>
  loading: boolean
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? record : null)
      setIsAuthenticated(pb.authStore.isValid)
    })
    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch(() => pb.authStore.clear())
        .finally(() => setLoading(false))
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setLoading(false)
    }
    return () => {
      unsubscribe()
    }
  }, [])

  const generateExternalId = () => {
    // Gera um identificador único: "usr_" + 8 caracteres alfanuméricos
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let id = ''
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `usr_${id}`
  }

  const signUp = async (
    name: string,
    email: string,
    password: string,
    document: string,
    phone?: string,
  ) => {
    try {
      if (!validateDocument(document)) {
        return { error: { message: 'CPF ou CNPJ inválido.' } }
      }

      const external_id = generateExternalId()
      await pb.collection('users').create({
        name,
        email,
        password,
        passwordConfirm: password,
        external_id,
        document,
        phone: phone || undefined,
      })

      // authenticated user may be created with verified=false; the user can still
      // log in within the first 30 days.
      await pb.collection('users').authWithPassword(email, password)

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      const record = authData?.record

      // Allow login even with verified=false, but block if the account is older
      // than 30 days without e-mail verification.
      if (record && !record.verified) {
        const created = record.created ? new Date(record.created).getTime() : 0
        const ageMs = Date.now() - created
        if (ageMs > THIRTY_DAYS_MS) {
          pb.authStore.clear()
          return {
            error: {
              message:
                'Sua conta não foi verificada em até 30 dias. Verifique seu e-mail ou entre em contato com o suporte.',
              code: 'UNVERIFIED_EXPIRED',
            },
          }
        }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const requestVerification = async (email: string) => {
    try {
      await pb.collection('users').requestVerification(email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const requestPasswordReset = async (email: string) => {
    try {
      await pb.collection('users').requestPasswordReset(email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        signUp,
        signIn,
        signOut,
        requestVerification,
        requestPasswordReset,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
