import { useState } from 'react'
import { useData } from '@/hooks/use-data'
import { Card, CardContent } from '@/components/ui/card'
import { formatMoney, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Building,
  Calendar,
  DollarSign,
  ChevronDown,
  Receipt,
  Pencil,
  Trash2,
} from 'lucide-react'
import { CATEGORY_LABELS, Trip } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TripForm } from '@/components/forms/TripForm'
import { deleteTrip } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

export default function Trips() {
  const { trips, expenses, refresh } = useData()
  const { toast } = useToast()
  const [openTrip, setOpenTrip] = useState<string | null>(null)
  const [editTrip, setEditTrip] = useState<Trip | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleEdit = (trip: Trip) => {
    setEditTrip(trip)
    setEditOpen(true)
  }

  const handleEditSuccess = async () => {
    setEditOpen(false)
    setEditTrip(null)
    await refresh()
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteTrip(deleteTarget.id)
      toast({ title: 'Viagem excluída!' })
      await refresh()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: err.message })
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Histórico de Viagens</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => {
          const saldo = trip.gross_value - (trip.advance_value || 0)
          const tripExpenses = expenses.filter((e) => e.trip_id === trip.id)
          const totalExpenses = tripExpenses.reduce((acc, e) => acc + e.amount, 0)
          const isOpen = openTrip === trip.id

          return (
            <Card key={trip.id} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <Badge
                    variant={trip.status === 'completed' ? 'default' : 'secondary'}
                    className={
                      trip.status === 'completed' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                    }
                  >
                    {trip.status === 'completed' ? 'Concluída' : 'Pendente'}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="w-3 h-3 mr-1" /> {formatDate(trip.date)}
                  </span>
                </div>

                <h3 className="font-bold text-lg leading-tight mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-primary shrink-0" /> {trip.origin} ➔{' '}
                  {trip.destination}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center mb-4">
                  <Building className="w-3 h-3 mr-1" /> {trip.company} • {trip.distance_km} km
                </p>

                <div className="mt-auto space-y-2 bg-muted/50 p-3 rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Bruto:</span>
                    <span className="font-medium">{formatMoney(trip.gross_value)}</span>
                  </div>
                  {trip.advance_value > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Adiantamento:</span>
                      <span className="text-destructive">-{formatMoney(trip.advance_value)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Despesas vinculadas:</span>
                    <span className="font-medium text-destructive">
                      {tripExpenses.length > 0 ? `-${formatMoney(totalExpenses)}` : 'Nenhuma'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/50 pt-2 font-bold">
                    <span>Saldo a Receber:</span>
                    <span className="text-emerald-600 flex items-center">
                      <DollarSign className="w-4 h-4" />
                      {formatMoney(saldo - totalExpenses)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(trip)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/5"
                    onClick={() => setDeleteTarget(trip)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Excluir
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full justify-between"
                  onClick={() => setOpenTrip(isOpen ? null : trip.id)}
                >
                  <span className="flex items-center text-xs">
                    <Receipt className="w-3.5 h-3.5 mr-1.5" />
                    {tripExpenses.length} despesa(s)
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </Button>

                {isOpen && (
                  <div className="mt-2 border-t border-border/50 pt-2 space-y-2">
                    {tripExpenses.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        Nenhuma despesa vinculada a esta viagem.
                      </p>
                    ) : (
                      tripExpenses.map((exp) => (
                        <div
                          key={exp.id}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-border/30 last:border-0"
                        >
                          <div className="min-w-0">
                            <p className="font-medium truncate">{CATEGORY_LABELS[exp.category]}</p>
                            <p className="text-muted-foreground">
                              {formatDate(exp.date)}
                              {exp.description && ` • ${exp.description}`}
                            </p>
                          </div>
                          <span className="font-semibold text-destructive shrink-0 ml-2">
                            {formatMoney(exp.amount)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
        {trips.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-10">
            Nenhuma viagem encontrada.
          </p>
        )}
      </div>

      {/* Modal de Edição */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditTrip(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Viagem</DialogTitle>
          </DialogHeader>
          <TripForm onSuccess={handleEditSuccess} trip={editTrip} />
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir viagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A viagem{' '}
              <span className="font-medium text-foreground">
                {deleteTarget ? `${deleteTarget.origin} ➔ ${deleteTarget.destination}` : ''}
              </span>{' '}
              será permanentemente removida. Despesas vinculadas podem ficar sem viagem associada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
