import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Truck, CheckCircle2, AlertCircle, RefreshCw, MailWarning, Loader2 } from 'lucide-react'

type Status = 'verifying' | 'success' | 'error' | 'missing'

/**
 * Página de confirmação de e-mail.
 *
 * O PocketBase envia links no formato `{APP_URL}/_/#/auth/confirm-verification/{token}`.
 * Em um SPA com BrowserRouter (sem hash), capturamos o token de:
 *  - `useParams().token` (rota `/auth/confirm-verification/:token`), ou
 *  - fallback do `window.location.hash` quando o link PB vem no formato `_/#/...`.
 */
export default function Verification() {
  const { requestVerification } = useAuth()
  const { toast } = useToast()
  const [status, setStatus] = useState<Status>('verifying')
  const [errorMessage, setErrorMessage] = useState('')
  const [resending, setResending] = useState(false)
  const [email, setEmail] = useState('')

  // Extrai o token de onde estiver (route param ou hash do PB).
  const token = useMemo(() => {
    // 1) Rota normal (BrowserRouter): /auth/confirm-verification/TOKEN
    const pathParts = window.location.pathname.split('/')
    const tokenIdx = pathParts.indexOf('confirm-verification') + 1
    if (tokenIdx > 0 && pathParts[tokenIdx]) {
      return decodeURIComponent(pathParts[tokenIdx])
    }
    // 2) Hash do PocketBase: /_/#/auth/confirm-verification/TOKEN
    const hash = window.location.hash || ''
    const match = hash.match(/confirm-verification\/([^?#]+)/)
    if (match && match[1]) return decodeURIComponent(match[1])
    return ''
  }, [])

  useEffect(() => {
    let cancelled = false

    const confirm = async () => {
      if (!token) {
        if (!cancelled) setStatus('missing')
        return
      }
      try {
        await pb.collection('users').confirmVerification(token)
        if (!cancelled) setStatus('success')
      } catch (err: any) {
        if (cancelled) return
        const msg = err?.response?.message || err?.message || 'Token inválido ou expirado.'
        setErrorMessage(msg)
        setStatus('error')
      }
    }

    confirm()
    return () => {
      cancelled = true
    }
  }, [token])

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    const { error } = await requestVerification(email.trim())
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao reenviar',
        description: error.message || 'Não foi possível reenviar o e-mail de verificação.',
      })
    } else {
      toast({
        title: 'E-mail enviado',
        description: 'Verifique sua caixa de entrada (e o spam) para confirmar seu e-mail.',
      })
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-2">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Verificação de e-mail</CardTitle>
          <CardDescription>Confirmando seu cadastro no Gestor Caminhoneiro</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'verifying' && (
            <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm">Confirando seu e-mail...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 className="w-14 h-14 text-green-600" />
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                  E-mail verificado com sucesso!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sua conta foi confirmada. Agora você pode entrar e começar a gerenciar seus
                  fretes.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link to="/login">Ir para o login</Link>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <AlertCircle className="w-14 h-14 text-destructive" />
                <h3 className="text-lg font-semibold text-destructive">
                  Não foi possível verificar
                </h3>
                <p className="text-sm text-muted-foreground">
                  {errorMessage} Provavelmente o link expirou. Reenvie o e-mail de verificação
                  abaixo para receber um novo link.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resend-email">Seu e-mail</Label>
                <div className="relative">
                  <MailWarning className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="resend-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-9"
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleResend} disabled={resending || !email}>
                {resending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Reenviar verificação'
                )}
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link to="/login">Voltar para o login</Link>
              </Button>
            </div>
          )}

          {status === 'missing' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <AlertCircle className="w-14 h-14 text-amber-500" />
                <h3 className="text-lg font-semibold">Token ausente</h3>
                <p className="text-sm text-muted-foreground">
                  Nenhum token de verificação foi encontrado na URL. Use o link enviado para o seu
                  e-mail.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link to="/login">Ir para o login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
