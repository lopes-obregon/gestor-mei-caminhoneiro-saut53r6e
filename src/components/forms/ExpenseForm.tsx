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
import { DocumentScanner } from '@/components/forms/DocumentScanner'

export function ExpenseForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast()
  const { trips } = useData()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: 'fuel' as ExpenseCategory,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    trip_id: '',
  })

  const handleExtracted = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      amount: data.amount != null ? String(data.amount) : prev.amount,
      date: data.date || prev.date,
      category: data.category || prev.category,
      description: data.description || prev.description,
    }))
    toast({ title: 'Dados preenchidos a partir do documento!' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Impede o salvamento de despesas órfãs (sem viagem vinculada).
    if (!formData.trip_id) {
      toast({
        variant: 'destructive',
        title: 'Viagem obrigatória',
        description: 'Selecione a viagem à qual esta despesa está vinculada.',
      })
      return
    }

    setLoading(true)
    try {
      const payload = {
        category: formData.category,
        amount: Number(formData.amount),
        description: formData.description,
        date: formData.date,
        trip_id: formData.trip_id,
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
      <DocumentScanner type="expense" onExtracted={handleExtracted} />

      <div className="space-y-2">
        <Label>
          Viagem <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.trip_id}
          onValueChange={(v) => setFormData({ ...formData, trip_id: v })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a viagem" />
          </SelectTrigger>
          <SelectContent>
            {trips.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.origin} ➔ {t.destination} ({new Date(t.date).toLocaleDateString('pt-BR')})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {trips.length === 0 && (
          <p className="text-xs text-destructive">
            Nenhuma viagem cadastrada. Registre uma viagem antes de lançar despesas.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select
          value={formData.category}
          onValueChange={(v: ExpenseCategory) => setFormData({ ...formData, category: v })}
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
