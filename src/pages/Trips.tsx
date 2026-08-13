import { useState } from 'react'
import { useData } from '@/hooks/use-data'
import { Card, CardContent } from '@/components/ui/card'
import { formatMoney, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Building, Calendar, DollarSign, ChevronDown, Receipt } from 'lucide-react'
import { CATEGORY_LABELS } from '@/types'

export default function Trips() {
  const { trips, expenses } = useData()
  const [openTrip, setOpenTrip] = useState<string | null>(null)

  const totalTripExpenses = (tripId: string) =>
    expenses.filter((e) => e.trip_id === tripId).reduce((acc, e) => acc + e.amount, 0)

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
    </div>
  )
}
