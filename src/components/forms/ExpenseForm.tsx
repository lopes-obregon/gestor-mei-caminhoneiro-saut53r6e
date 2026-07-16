import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createExpense } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import { useData } from '@/hooks/use-data'
import { CATEGORY_LABELS, ExpenseCategory } from '@/types'

export function ExpenseForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast()
  const { trips } = useData()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: 'fuel' as ExpenseCategory,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    trip_id: 'none',
  })

  const isVariable = ['fuel', 'toll', 'food', 'helper'].includes(formData.category)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: any = {
        category: formData.category,
        amount: Number(formData.amount),
        description: formData.description,
        date: formData.date,
      }
      if (isVariable && formData.trip_id !== 'none') {
        payload.trip_id = formData.trip_id
      }
      await createExpense(payload)
      toast({ title: 'Despesa registrada!' })
      onSuccess()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err.message })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select
          value={formData.category}
          onValueChange={(v: ExpenseCategory) =>
            setFormData({ ...formData, category: v, trip_id: 'none' })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isVariable && (
        <div className="space-y-2">
          <Label>Vincular a uma Viagem (Opcional)</Label>
          <Select
            value={formData.trip_id}
            onValueChange={(v) => setFormData({ ...formData, trip_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a viagem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {trips.slice(0, 10).map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.origin} ➔ {t.destination} ({new Date(t.date).toLocaleDateString('pt-BR')})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>Valor (R$)</Label>
          <Input
            type="number"
            step="0.01"
            required
            min="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Data</Label>
          <Input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição / Local</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ex: Posto Graal"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Salvando...' : 'Registrar Despesa'}
      </Button>
    </form>
  )
}
