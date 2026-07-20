import { useAuth } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LockKeyhole, LogOut } from 'lucide-react'

export default function PaymentRequired() {
  const { signOut, user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" />
  if (user?.payment_status === 'paid') return <Navigate to="/" />

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl border-destructive/10">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-destructive/10 w-16 h-16 flex items-center justify-center rounded-full mb-2">
            <LockKeyhole className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">Acesso Restrito</CardTitle>
          <CardDescription className="text-base">
            Sua conta não está ativa. Por favor, regularize seu pagamento para acessar o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
