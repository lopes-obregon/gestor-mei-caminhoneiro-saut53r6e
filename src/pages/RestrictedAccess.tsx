import { useAuth } from '@/hooks/use-auth'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LockKeyhole, LogOut, Truck, Mail, MessageCircle } from 'lucide-react'

export default function RestrictedAccess() {
  const { signOut, user, isAuthenticated } = useAuth()

  const contactEmail = 'vlsolucoesia@gmail.com'
  const contactWhatsapp = '(67) 981538470'
  const whatsappDigits = '5567981538470'

  const statusLabel =
    user?.payment_status === 'overdue'
      ? 'Atrasado'
      : user?.payment_status === 'pending'
        ? 'Pendente'
        : 'Inativo'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl border-destructive/10">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-destructive/10 w-16 h-16 flex items-center justify-center rounded-full mb-2">
            <LockKeyhole className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">Acesso Suspenso</CardTitle>
          <CardDescription className="text-base">
            {user?.payment_status ? (
              <>
                Seu status de pagamento está atualmente como{' '}
                <span className="font-semibold text-destructive">{statusLabel}</span>.
              </>
            ) : (
              'É necessário regularizar sua assinatura para acessar o sistema.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
            <Truck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Para liberar seu acesso ao gerenciamento de viagens e despesas, entre em contato
              conosco através dos canais abaixo:
            </p>
          </div>

          <div className="space-y-3">
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noreferrer"
              className="w-full block"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <MessageCircle className="h-4 w-4" />
                Falar pelo WhatsApp ({contactWhatsapp})
              </Button>
            </a>

            <a href={`mailto:${contactEmail}`} className="w-full block">
              <Button variant="outline" className="w-full gap-2">
                <Mail className="h-4 w-4" />
                Enviar E-mail ({contactEmail})
              </Button>
            </a>
          </div>

          {isAuthenticated ? (
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sair da conta
            </Button>
          ) : (
            <Link to="/login" className="w-full block">
              <Button variant="ghost" className="w-full text-muted-foreground">
                <LogOut className="h-4 w-4 mr-2" /> Voltar para o Login
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
