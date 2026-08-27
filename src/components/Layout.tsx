import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import {
  Home,
  Truck,
  Receipt,
  FileText,
  Plus,
  LogOut,
  Bell,
  CheckCheck,
  Clock,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TripForm } from './forms/TripForm'
import { ExpenseForm } from './forms/ExpenseForm'
import { useState } from 'react'

function formatNotificationDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMin < 1) return 'Agora mesmo'
    if (diffMin < 60) return `Há ${diffMin} min`
    if (diffHours < 24) return `Há ${diffHours} h`
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `Há ${diffDays} dias`
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  } catch {
    return dateStr
  }
}

function NotificationsMenu() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      // Mark visible unread notifications as read
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
      if (unreadIds.length > 0) {
        markAsRead(unreadIds)
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground h-9 w-9 rounded-full"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white ring-2 ring-background animate-in zoom-in-50">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 shadow-lg border bg-card"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Notificações</h3>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
              >
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Marcar lidas
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[380px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Nenhuma notificação</p>
              <p className="text-xs opacity-75 mt-0.5">Você receberá atualizações e avisos aqui.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {notifications.map((n) => {
                const isPayment = n.type === 'payment'
                const isAlert = n.type === 'alert'

                return (
                  <div
                    key={n.id}
                    className={`p-4 transition-colors hover:bg-muted/50 ${
                      !n.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isPayment ? (
                          <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                        ) : isAlert ? (
                          <div className="p-1.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                            <Clock className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="h-2 w-2 rounded-full bg-rose-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed break-words">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/75 pt-0.5">
                          {formatNotificationDate(n.created)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

function MobileNotificationButton() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
      if (unreadIds.length > 0) {
        markAsRead(unreadIds)
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground relative"
          aria-label="Notificações"
        >
          <div className="relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Avisos</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={12}
        className="w-[90vw] max-w-sm p-0 shadow-xl border bg-card mb-2"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Notificações</h3>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
              >
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Marcar lidas
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-7 w-7 mx-auto mb-1.5 opacity-30" />
              <p className="text-sm font-medium">Nenhuma notificação</p>
              <p className="text-xs opacity-75 mt-0.5">Você receberá atualizações e avisos aqui.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {notifications.map((n) => {
                const isPayment = n.type === 'payment'
                const isAlert = n.type === 'alert'

                return (
                  <div
                    key={n.id}
                    className={`p-3.5 transition-colors hover:bg-muted/50 ${
                      !n.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {isPayment ? (
                          <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </div>
                        ) : isAlert ? (
                          <div className="p-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <div className="p-1 rounded-full bg-primary/10 text-primary">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed break-words">
                          {n.message}
                        </p>
                        <p className="text-[9px] text-muted-foreground/75 pt-0.5">
                          {formatNotificationDate(n.created)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

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

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" />

  // Todo usuário já nasce com payment_status = "paid" (hook de criação + migration).
  // A tela de acesso restrito só aparece para quem NÃO está com pagamento ativo.
  const hasActivePayment = user?.payment_status === 'paid' || user?.payment_status === 'active'

  if (!hasActivePayment) {
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
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-8 shrink-0">
          <h2 className="text-lg font-semibold md:hidden">Gestor Caminhoneiro</h2>
          <div className="hidden md:block text-lg font-semibold">Painel de Controle</div>
          <div className="flex items-center gap-2 md:gap-3">
            <NotificationsMenu />
            <QuickAdd />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-card flex items-center justify-around z-40 pb-safe">
        <NavLinks />
        <MobileNotificationButton />
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
