import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Truck, KeyRound, ShieldCheck, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const emailParam = searchParams.get('email') || ''
  const [email, setEmail] = useState(emailParam)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetEmail = email.trim()
    const cleanCode = code.replace(/\D/g, '').trim()

    if (!targetEmail) {
      toast({
        variant: 'destructive',
        title: 'E-mail obrigatório',
        description: 'Informe seu e-mail.',
      })
      return
    }

    if (cleanCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Código inválido',
        description: 'O código de verificação deve ter 6 dígitos.',
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Senha muito curta',
        description: 'A nova senha deve ter no mínimo 8 caracteres.',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Senhas não conferem',
        description: 'A confirmação de senha não coincide com a nova senha.',
      })
      return
    }

    setLoading(true)
    try {
      const res = await pb.send<{ success: boolean; error?: string }>(
        '/backend/v1/reset-password',
        {
          method: 'POST',
          body: JSON.stringify({
            email: targetEmail,
            code: cleanCode,
            new_password: newPassword,
          }),
          headers: { 'Content-Type': 'application/json' },
        },
      )

      if (res && res.success) {
        setSuccess(true)
        toast({
          title: 'Senha alterada com sucesso!',
          description: 'Sua senha foi redefinida. Faça login com a nova senha.',
        })
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro na redefinição',
          description: res?.error || 'Não foi possível alterar a senha.',
        })
      }
    } catch (err: any) {
      const msg =
        err?.data?.error ||
        err?.response?.data?.error ||
        err?.message ||
        'Não foi possível redefinir a senha.'

      toast({
        variant: 'destructive',
        title: 'Erro ao redefinir senha',
        description:
          msg === 'code expired or not requested'
            ? 'O código expirou ou é inválido. Solicite um novo código.'
            : msg === 'invalid code'
              ? 'Código incorreto. Confira o número recebido no seu e-mail.'
              : msg === 'user not found'
                ? 'Usuário não encontrado.'
                : msg,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-2">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Redefinir Senha</CardTitle>
          <CardDescription>
            Digite o código de 6 dígitos recebido e escolha sua nova senha.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <div className="space-y-4 animate-fade-in text-center py-4">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                Senha redefinida com sucesso!
              </h3>
              <p className="text-sm text-muted-foreground">
                Redirecionando para a tela de login...
              </p>
              <Button asChild className="w-full">
                <Link to="/login">Ir para o login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!emailParam && (
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-9"
                    />
                  </div>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || code.length !== 6 || newPassword.length < 8}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  'Redefinir Senha'
                )}
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <Link to="/login" className="flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o login
                </Link>
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
