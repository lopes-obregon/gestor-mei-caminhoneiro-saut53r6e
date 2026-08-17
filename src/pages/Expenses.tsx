import { useState } from 'react'
import { useData } from '@/hooks/use-data'
import { Card, CardContent } from '@/components/ui/card'
import { formatMoney, formatDate } from '@/lib/utils'
import { CATEGORY_LABELS, Expense } from '@/types'
import {
  Wrench,
  Fuel,
  Utensils,
  Shield,
  FileText,
  BadgeDollarSign,
  Truck,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { ExpenseForm } from '@/components/forms/ExpenseForm'
import { deleteExpense } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

export default function Expenses() {
  const { expenses, refresh } = useData()
  const { toast } = useToast()
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'fuel':
        return <Fuel className="w-5 h-5 text-orange-500" />
      case 'food':
        return <Utensils className="w-5 h-5 text-yellow-500" />
      case 'maintenance_parts':
      case 'maintenance_labor':
      case 'tires':
        return <Wrench className="w-5 h-5 text-blue-500" />
      case 'insurance':
        return <Shield className="w-5 h-5 text-indigo-500" />
      case 'tax':
        return <FileText className="w-5 h-5 text-emerald-500" />
      case 'toll':
        return <BadgeDollarSign className="w-5 h-5 text-slate-500" />
      default:
        return <Truck className="w-5 h-5 text-gray-400" />
    }
  }

  const handleEdit = (exp: Expense) => {
    setEditExpense(exp)
    setEditOpen(true)
  }

  const handleEditSuccess = async () => {
    setEditOpen(false)
    setEditExpense(null)
    await refresh()
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteExpense(deleteTarget.id)
      toast({ title: 'Despesa excluída!' })
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
        <h1 className="text-2xl font-bold">Gerenciamento de Despesas</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2 bg-background rounded-full border shadow-sm shrink-0">
                    {getIcon(exp.category)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm md:text-base">
                      {CATEGORY_LABELS[exp.category]}
                      {exp.description && (
                        <span className="text-muted-foreground font-normal ml-2 hidden md:inline">
                          - {exp.description}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(exp.date)}
                      {exp.expand?.trip_id ? (
                        <span className="ml-2 text-primary font-medium">
                          {exp.expand.trip_id.origin} ➔ {exp.expand.trip_id.destination}
                        </span>
                      ) : exp.trip_id ? (
                        <span className="ml-2 text-primary font-medium">Vinculado a viagem</span>
                      ) : null}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-muted-foreground mt-1 md:hidden">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-destructive">{formatMoney(exp.amount)}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(exp)}
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(exp)}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma despesa registrada.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditExpense(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Despesa</DialogTitle>
          </DialogHeader>
          <ExpenseForm onSuccess={handleEditSuccess} expense={editExpense} />
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
            <AlertDialogTitle>Excluir despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A despesa{' '}
              <span className="font-medium text-foreground">
                {deleteTarget ? CATEGORY_LABELS[deleteTarget.category] : ''}
              </span>{' '}
              ({deleteTarget ? formatMoney(deleteTarget.amount) : ''}) será permanentemente
              removida.
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
