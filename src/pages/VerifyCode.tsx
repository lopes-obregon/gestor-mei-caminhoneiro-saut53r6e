import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Truck, CheckCircle2, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react'

export default function VerifyCode() {
  const [searchParams] = useSearchParams()
  const emailParam = searchParams.get('email') || ''
  const [email, setEmail] = useState(emailParam || pb.authStore.record?.email || '')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const maskedEmail = useMemo(() => {
    if (!email || !email.includes('@')) return email
    const [name, domain] = email.split('@')
    if (name.length <= 2) {
      return `${name}***@${domain}`
    }
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`
  }, [email])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = code.replace(/\D/g, '').trim()
    const targetEmail = email.trim()

    if (!targetEmail) {
      toast({
        variant: 'destructive',
        title: 'E-mail obrigatório',
        description: 'Informe seu e-mail para validar o código.',
      })
      return
    }

    if (cleanCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Código inválido',
        description: 'O código de verificação deve ter 6 dígitos numéricos.',
      })
      return
    }

    setLoading(true)
    try {
      const res = await pb.send<{ success: boolean; error?: string }>('/backend/v1/verify-code', {
        method: 'POST',
        body: JSON.stringify({ email: targetEmail, code: cleanCode }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (res && res.success) {
        setSuccess(true)
        toast({
          title: 'E-mail verificado com sucesso!',
          description: 'Sua conta está confirmada. Redirecionando...',
        })
        setTimeout(() => {
          navigate('/')
        }, 1500)
      } else {
        toast({
          variant: 'destructive',
          title: 'Falha na verificação',
          description: res?.error || 'Código inválido ou expirado.',
        })
      }
    } catch (err: any) {
      const msg =
        err?.data?.error ||
        err?.response?.data?.error ||
        err?.message ||
        'Não foi possível verificar o código.'
      toast({
        variant: 'destructive',
        title: 'Erro de verificação',
        description:
          msg === 'code expired or not requested'
            ? 'O código expirou ou não foi solicitado. Clique em reenviar código.'
            : msg === 'invalid code'
              ? 'Código incorreto. Confira o número recebido no seu e-mail.'
              : msg === 'user not found'
                ? 'Usuário não encontrado com este e-mail.'
                : msg,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    const targetEmail = email.trim()
    if (!targetEmail) {
      toast({
        variant: 'destructive',
        title: 'E-mail obrigatório',
        description: 'Informe seu e-mail para receber um novo código.',
      })
      return
    }

    setResending(true)
    try {
      await pb.send('/backend/v1/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email: targetEmail }),
        headers: { 'Content-Type': 'application/json' },
      })

      toast({
        title: 'Código reenviado!',
        description: `Enviamos um novo código de 6 dígitos para ${maskedEmail || targetEmail}.`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao reenviar código',
        description: 'Tente novamente em instantes.',
      })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-2">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Verificação de E-mail</CardTitle>
          <CardDescription>
            {maskedEmail ? (
              <>
                Enviamos um código de 6 dígitos para{' '}
                <strong className="text-foreground">{maskedEmail}</strong>. Digite-o abaixo para
                confirmar sua conta.
              </>
            ) : (
              'Digite o código de 6 dígitos enviado para seu e-mail.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <div className="space-y-4 animate-fade-in text-center py-4">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                Conta Verificada!
              </h3>
              <p className="text-sm text-muted-foreground">
                Redirecionando para o painel principal...
              </p>
              <Button asChild className="w-full">
                <Link to="/">Acessar Gestor</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              {!emailParam && !pb.authStore.record?.email && (
                <div className="space-y-2">
                  <Label htmlFor="email">Seu E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">Código de 6 dígitos</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="pl-9 text-center text-lg tracking-widest font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  O código é válido por 10 minutos.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                {loading ? 'Verificando...' : 'Verificar'}
              </Button>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={resending}
                  onClick={handleResend}
                >
                  {resending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reenviar código
                    </>
                  )}
                </Button>

                <Button asChild variant="ghost" className="w-full">
                  <Link to="/login" className="flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o login
                  </Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
