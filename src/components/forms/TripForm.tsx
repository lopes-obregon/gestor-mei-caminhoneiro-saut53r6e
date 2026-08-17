import { useState, useEffect } from 'react'
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
import { createTrip, updateTrip } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import { Trip } from '@/types'
import { DocumentScanner } from '@/components/forms/DocumentScanner'
import { CityAutocomplete } from '@/components/forms/CityAutocomplete'

interface TripFormProps {
  onSuccess: () => void
  trip?: Trip | null
}

export function TripForm({ onSuccess, trip }: TripFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const isEditing = !!trip
  const [formData, setFormData] = useState({
    company: '',
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    distance_km: '',
    gross_value: '',
    advance_value: '0',
    advance_type: 'none',
    status: 'pending' as 'pending' | 'completed',
  })

  // Preenche o formulário quando estiver editando
  useEffect(() => {
    if (trip) {
      setFormData({
        company: trip.company ?? '',
        origin: trip.origin ?? '',
        destination: trip.destination ?? '',
        date: trip.date ? trip.date.split('T')[0] : new Date().toISOString().split('T')[0],
        distance_km: trip.distance_km != null ? String(trip.distance_km) : '',
        gross_value: trip.gross_value != null ? String(trip.gross_value) : '',
        advance_value: trip.advance_value != null ? String(trip.advance_value) : '0',
        advance_type: trip.advance_type ?? 'none',
        status: trip.status ?? 'pending',
      })
    }
  }, [trip])

  const handleExtracted = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      company: data.company || prev.company,
      origin: data.origin || prev.origin,
      destination: data.destination || prev.destination,
      date: data.date || prev.date,
      distance_km: data.distance_km != null ? String(data.distance_km) : prev.distance_km,
      gross_value: data.gross_value != null ? String(data.gross_value) : prev.gross_value,
      advance_value: data.advance_value != null ? String(data.advance_value) : prev.advance_value,
      advance_type: data.advance_type || prev.advance_type,
    }))
    toast({ title: 'Dados preenchidos a partir do documento!' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...formData,
        distance_km: Number(formData.distance_km),
        gross_value: Number(formData.gross_value),
        advance_value: Number(formData.advance_value),
      } as any
      if (isEditing && trip) {
        await updateTrip(trip.id, payload)
        toast({ title: 'Viagem atualizada com sucesso!' })
      } else {
        await createTrip(payload)
        toast({ title: 'Viagem registrada com sucesso!' })
      }
      onSuccess()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err.message })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <DocumentScanner type="trip" onExtracted={handleExtracted} />
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
          <CityAutocomplete
            label="Origem"
            required
            value={formData.origin}
            onChange={(v) => setFormData({ ...formData, origin: v })}
          />
          <CityAutocomplete
            label="Destino"
            required
            value={formData.destination}
            onChange={(v) => setFormData({ ...formData, destination: v })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v: 'pending' | 'completed') => setFormData({ ...formData, status: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Registrar Viagem'}
      </Button>
    </form>
  )
}
