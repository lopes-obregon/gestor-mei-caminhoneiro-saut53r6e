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
import { createTrip } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

export function TripForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    company: '',
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    distance_km: '',
    gross_value: '',
    advance_value: '0',
    advance_type: 'none',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createTrip({
        ...formData,
        distance_km: Number(formData.distance_km),
        gross_value: Number(formData.gross_value),
        advance_value: Number(formData.advance_value),
        status: 'pending',
      } as any)
      toast({ title: 'Viagem registrada com sucesso!' })
      onSuccess()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err.message })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label>Empresa / Cliente</Label>
          <Input
            required
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Transportadora X"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Origem</Label>
            <Input
              required
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Destino</Label>
            <Input
              required
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
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
          <div className="space-y-2">
            <Label>Distância (KM)</Label>
            <Input
              type="number"
              required
              min="1"
              value={formData.distance_km}
              onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Valor do Frete Bruto (R$)</Label>
          <Input
            type="number"
            step="0.01"
            required
            value={formData.gross_value}
            onChange={(e) => setFormData({ ...formData, gross_value: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
          <div className="space-y-2">
            <Label>Adiantamento (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.advance_value}
              onChange={(e) => setFormData({ ...formData, advance_value: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo Adiantamento</Label>
            <Select
              value={formData.advance_type}
              onValueChange={(v) => setFormData({ ...formData, advance_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="fuel">Vale Diesel</SelectItem>
                <SelectItem value="toll">Vale Pedágio</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Salvando...' : 'Registrar Viagem'}
      </Button>
    </form>
  )
}
