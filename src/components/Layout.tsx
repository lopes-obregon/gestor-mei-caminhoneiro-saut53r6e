import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { Home, Truck, Receipt, FileText, Plus, LogOut, AlertTriangle, X } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TripForm } from './forms/TripForm'
import { ExpenseForm } from './forms/ExpenseForm'
import { useState } from 'react'

function NavLinks() {
  const loc = useLocation()
  const links = [
    { to: '/', label: 'Início', icon: Home },
    { to: '/trips', label: 'Viagens', icon: Truck },
    { to: '/expenses', label: 'Despesas', icon: Receipt },
    { to: '/reports', label: 'Relatórios', icon: FileText },
  ]

  return (
    <>
      {links.map((l) => {
        const active = loc.pathname === l.to
        return (
          <Link
            key={l.to}
            to={l.to}
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg transition-colors ${active ? 'text-primary md:bg-primary/10 font-medium' : 'text-muted-foreground hover:text-foreground md:hover:bg-muted'}`}
          >
            <l.icon className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-[10px] md:text-sm">{l.label}</span>
          </Link>
        )
      })}
    </>
  )
}

function QuickAdd() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [type, setType] = useState<'trip' | 'expense'>('trip')

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="rounded-full h-12 w-12 shadow-lg animate-float md:hidden fixed bottom-20 right-4 z-50"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="mb-2">
          <DropdownMenuItem
            onClick={() => {
              setType('trip')
              setSheetOpen(true)
            }}
            className="gap-2"
          >
            <Truck className="h-4 w-4 text-primary" /> Nova Viagem
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setType('expense')
              setSheetOpen(true)
            }}
            className="gap-2"
          >
            <Receipt className="h-4 w-4 text-destructive" /> Nova Despesa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden md:flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setType('expense')
            setSheetOpen(true)
          }}
        >
          <Receipt className="h-4 w-4 mr-2" /> Despesa
        </Button>
        <Button
          onClick={() => {
            setType('trip')
            setSheetOpen(true)
          }}
        >
          <Truck className="h-4 w-4 mr-2" /> Viagem
        </Button>
      </div>

      <SheetContent
        side="bottom"
        className="md:side-right h-[90vh] md:h-full md:w-[400px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{type === 'trip' ? 'Registrar Viagem' : 'Registrar Despesa'}</SheetTitle>
        </SheetHeader>
        {type === 'trip' ? (
          <TripForm onSuccess={() => setSheetOpen(false)} />
        ) : (
          <ExpenseForm onSuccess={() => setSheetOpen(false)} />
        )}
      </SheetContent>
    </Sheet>
  )
}

export default function Layout() {
  const { isAuthenticated, loading, signOut, user } = useAuth()
  const [bannerDismissed, setBannerDismissed] = useState(false)

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" />

  // Checks 30-day grace period from account creation date.
  // Access is restricted ONLY if user account is older than 30 days AND payment_status is not active/paid.
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
  const createdMs = user?.created ? new Date(user.created).getTime() : Date.now()
  const isOlderThan30Days = Date.now() - createdMs > THIRTY_DAYS_MS
  const hasActivePayment = user?.payment_status === 'paid' || user?.payment_status === 'active'

  // TODO: substituir por variáveis de ambiente
  const contactEmail = 'contato@vlsolucoesia.com.br'
  const contactWhatsapp = '(67) 99999-9999'
  const whatsappDigits = '5567999999999'

  const daysLeft = Math.ceil((createdMs + THIRTY_DAYS_MS - Date.now()) / (24 * 60 * 60 * 1000))
  const showExpiryBanner = daysLeft <= 5 && daysLeft > 0 && !hasActivePayment && !bannerDismissed

  if (isOlderThan30Days && !hasActivePayment) {
    return <Navigate to="/restricted-access" />
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card h-full">
        <div className="p-6">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Truck className="h-6 w-6" /> Gestor Caminhoneiro
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavLinks />
        </nav>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {showExpiryBanner && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-4 md:px-8 py-3 flex items-start gap-3 shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-amber-800 dark:text-amber-200">
              <p>
                Seu período gratuito de 30 dias termina em{' '}
                <strong>
                  {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
                </strong>
                . Entre em contato para manter o acesso:
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-medium underline hover:no-underline"
                >
                  {contactEmail}
                </a>
                <span className="text-amber-400">•</span>
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline hover:no-underline"
                >
                  {contactWhatsapp}
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 shrink-0"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-8 shrink-0">
          <h2 className="text-lg font-semibold md:hidden">Gestor Caminhoneiro</h2>
          <div className="hidden md:block text-lg font-semibold">Painel de Controle</div>
          <QuickAdd />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-card flex items-center justify-around z-40 pb-safe">
        <NavLinks />
        <button
          onClick={signOut}
          className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px]">Sair</span>
        </button>
      </nav>
    </div>
  )
}
