import { useAuth } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LockKeyhole, LogOut, Truck } from 'lucide-react'

export default function RestrictedAccess() {
  const { signOut, user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" />
  if (user?.payment_status === 'paid') return <Navigate to="/" />

  const statusLabel = user?.payment_status === 'overdue' ? 'Atrasado' : 'Pendente'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl border-destructive/10">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-destructive/10 w-16 h-16 flex items-center justify-center rounded-full mb-2">
            <LockKeyhole className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">Acesso Suspenso</CardTitle>
          <CardDescription className="text-base">
            Seu status de pagamento está atualmente como{' '}
            <span className="font-semibold text-destructive">{statusLabel}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
            <Truck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Regularize sua situação para recuperar o acesso ao gerenciamento de viagens e
              despesas.
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
