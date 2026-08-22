import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Truck, Mail, ArrowLeft, Loader2 } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetEmail = email.trim()
    if (!targetEmail) {
      toast({
        variant: 'destructive',
        title: 'E-mail obrigatório',
        description: 'Informe seu e-mail cadastrado.',
      })
      return
    }

    setLoading(true)
    try {
      const data = await pb.send('/backend/v1/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email: targetEmail }),
        headers: { 'Content-Type': 'application/json' },
      })

      // E-mail não cadastrado: orienta o usuário a se cadastrar e mantém na página
      if (data?.not_found === true) {
        toast({
          variant: 'destructive',
          title: 'E-mail não cadastrado',
          description: 'Esta conta não está cadastrada no sistema. Realize seu cadastro primeiro.',
        })
        return
      }

      toast({
        title: 'Solicitação enviada',
        description: 'Se o e-mail existir, um código foi enviado.',
      })

      // Redireciona para /auth/reset-password?email=...
      navigate(`/auth/reset-password?email=${encodeURIComponent(targetEmail)}`)
    } catch (err: any) {
      // Mesmo em caso de erro da rede, informar de maneira amigável ou manter o fluxo
      toast({
        title: 'Solicitação enviada',
        description: 'Se o e-mail existir, um código foi enviado.',
      })
      navigate(`/auth/reset-password?email=${encodeURIComponent(targetEmail)}`)
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
          <CardTitle className="text-2xl font-bold text-primary">Esqueci minha senha</CardTitle>
          <CardDescription>
            Informe seu e-mail cadastrado para enviarmos um código de recuperação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-9"
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar código'
              )}
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <Link to="/login" className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
