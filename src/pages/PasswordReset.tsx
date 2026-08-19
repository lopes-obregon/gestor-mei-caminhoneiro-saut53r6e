import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Truck, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react'

type Status = 'form' | 'submitting' | 'success' | 'error' | 'missing'

/**
 * Página de redefinição de senha.
 *
 * O PocketBase envia links no formato `{APP_URL}/_/#/auth/confirm-password-reset/{token}`.
 * Capturamos o token da rota `/auth/confirm-password-reset/:token` ou, no fallback,
 * do `window.location.hash` (formato `_/#/...`).
 */
export default function PasswordReset() {
  const [status, setStatus] = useState<Status>('form')
  const [errorMessage, setErrorMessage] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Extrai o token de onde estiver (rota normal ou hash do PocketBase).
  const token = useMemo(() => {
    const pathParts = window.location.pathname.split('/')
    const tokenIdx = pathParts.indexOf('confirm-password-reset') + 1
    if (tokenIdx > 0 && pathParts[tokenIdx]) {
      return decodeURIComponent(pathParts[tokenIdx])
    }
    const hash = window.location.hash || ''
    const match = hash.match(/confirm-password-reset\/([^?#]+)/)
    if (match && match[1]) return decodeURIComponent(match[1])
    return ''
  }, [])

  useEffect(() => {
    if (!token) setStatus('missing')
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (!password) {
      setPasswordError('Informe a nova senha.')
      return
    }
    if (password.length < 8) {
      setPasswordError('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (password !== passwordConfirm) {
      setPasswordError('As senhas não conferem.')
      return
    }

    setStatus('submitting')
    try {
      await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm)
      setStatus('success')
    } catch (err: any) {
      const msg = err?.response?.message || err?.message || 'Token inválido ou expirado.'
      setErrorMessage(msg)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-2">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Redefinir senha</CardTitle>
          <CardDescription>Defina uma nova senha para acessar sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(status === 'form' || status === 'submitting') && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={8}
                    className="pl-9"
                    disabled={status === 'submitting'}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-confirm">Confirmar nova senha</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password-confirm"
                    type="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    minLength={8}
                    className="pl-9"
                    disabled={status === 'submitting'}
                  />
                </div>
              </div>
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              <Button type="submit" className="w-full" disabled={status === 'submitting'}>
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  'Redefinir senha'
                )}
              </Button>
            </form>
          )}

          {status === 'success' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 className="w-14 h-14 text-green-600" />
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                  Senha redefinida com sucesso!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sua nova senha foi definida. Agora você pode entrar na sua conta.
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
                  Não foi possível redefinir
                </h3>
                <p className="text-sm text-muted-foreground">
                  {errorMessage} Provavelmente o link expirou. Solicite um novo link de redefinição
                  de senha.
                </p>
              </div>
              <Button asChild className="w-full">
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
                  Nenhum token de redefinição foi encontrado na URL. Use o link enviado para o seu
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
