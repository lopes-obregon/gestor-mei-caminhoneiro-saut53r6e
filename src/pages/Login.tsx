import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { checkUserSync } from '@/services/sync'
import { cn } from '@/lib/utils'
import { Truck, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Login() {
  const { signIn, signUp, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginFailed, setLoginFailed] = useState(false)
  const [checkingSync, setCheckingSync] = useState(false)
  const [syncResult, setSyncResult] = useState('')
  const [syncError, setSyncError] = useState(false)

  if (isAuthenticated) return <Navigate to="/" />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginFailed(false)
    setSyncResult('')
    const action = isLogin ? signIn : signUp
    const { error } = await action(email, password)

    if (error) {
      setLoginFailed(true)
      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: error.message || 'Verifique suas credenciais e tente novamente.',
      })
    }
    setLoading(false)
  }

  const handleCheckSync = async () => {
    setCheckingSync(true)
    setSyncResult('')
    setSyncError(false)
    try {
      const result = await checkUserSync(email)
      if (result.synced && result.user) {
        const userName = result.user.name || ''
        const userStatus = result.user.payment_status || ''
        setSyncResult(`Usuário sincronizado: ${userName} – ${userStatus}`)
      } else {
        setSyncResult('Usuário não encontrado no sistema externo. Contate o suporte.')
        setSyncError(true)
      }
    } catch {
      setSyncResult('Erro ao conectar com o sistema. Tente novamente mais tarde.')
      setSyncError(true)
    }
    setCheckingSync(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-2">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Gestor MEI Caminhoneiro</CardTitle>
          <CardDescription>Acesse sua conta para gerenciar seus fretes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          {loginFailed && isLogin && (
            <div className="mt-4 space-y-3 animate-fade-in-up">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                <span>Falha na autenticação. Deseja verificar a sincronização?</span>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={checkingSync || !email}
                onClick={handleCheckSync}
              >
                {checkingSync ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar Sincronização'
                )}
              </Button>
              {syncResult && (
                <div
                  className={cn(
                    'flex items-start gap-2 text-sm p-3 rounded-lg animate-fade-in',
                    syncError ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
                  )}
                >
                  {syncError ? (
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  )}
                  <span>{syncResult}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => {
                setIsLogin(!isLogin)
                setLoginFailed(false)
                setSyncResult('')
              }}
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
