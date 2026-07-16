import { useData } from '@/hooks/use-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatMoney, formatDate } from '@/lib/utils'
import { AlertCircle, Wallet, TrendingUp, TrendingDown, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const MEI_LIMIT_2026 = 251600

export default function Index() {
  const { trips, expenses, loadingData } = useData()

  if (loadingData)
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-muted rounded-xl"></div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    )

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  // Calc YTD Revenue
  const yearTrips = trips.filter((t) => new Date(t.date).getFullYear() === currentYear)
  const totalRevenueYTD = yearTrips.reduce((acc, t) => acc + t.gross_value, 0)
  const limitPercentage = Math.min((totalRevenueYTD / MEI_LIMIT_2026) * 100, 100)

  // Monthly metrics
  const monthTrips = yearTrips.filter((t) => new Date(t.date).getMonth() === currentMonth)
  const monthExpenses = expenses.filter(
    (e) =>
      new Date(e.date).getMonth() === currentMonth &&
      new Date(e.date).getFullYear() === currentYear,
  )

  const monthRevenue = monthTrips.reduce((acc, t) => acc + t.gross_value, 0)
  const monthCost = monthExpenses.reduce((acc, e) => acc + e.amount, 0)
  const monthProfit = monthRevenue - monthCost

  // Avg Cost per KM (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentTrips = trips.filter((t) => new Date(t.date) >= thirtyDaysAgo)
  const totalKm = recentTrips.reduce((acc, t) => acc + t.distance_km, 0)
  const recentExpenses = expenses.filter(
    (e) =>
      new Date(e.date) >= thirtyDaysAgo && ['fuel', 'toll', 'food', 'helper'].includes(e.category),
  )
  const totalRecentVars = recentExpenses.reduce((acc, e) => acc + e.amount, 0)

  const avgCostPerKm = totalKm > 0 ? totalRecentVars / totalKm : 0

  // Check DAS-MEI
  const paidDasThisMonth = monthExpenses.some((e) => e.category === 'tax')

  return (
    <div className="space-y-6 animate-slide-up">
      {!paidDasThisMonth && (
        <Alert
          variant="destructive"
          className="bg-destructive/10 border-destructive/20 text-destructive"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription>
            O DAS-MEI deste mês ainda não foi registrado. Não esqueça de pagá-lo e adicioná-lo em
            Despesas.
          </AlertDescription>
        </Alert>
      )}

      {/* Thermometer */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
            <span>Limite Anual MEI ({currentYear})</span>
            <span className={limitPercentage > 80 ? 'text-destructive font-bold' : 'text-primary'}>
              {limitPercentage.toFixed(1)}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress
            value={limitPercentage}
            className="h-3 bg-muted"
            indicatorClassName={
              limitPercentage > 80
                ? 'bg-destructive'
                : limitPercentage > 60
                  ? 'bg-secondary'
                  : 'bg-emerald-500'
            }
          />
          <div className="flex justify-between mt-2 text-sm">
            <span className="font-semibold">{formatMoney(totalRevenueYTD)}</span>
            <span className="text-muted-foreground">Máx: {formatMoney(MEI_LIMIT_2026)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento Mês</p>
                <h3 className="text-2xl font-bold mt-1 text-primary">
                  {formatMoney(monthRevenue)}
                </h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Wallet />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lucro Estimado (Mês)</p>
                <h3
                  className={`text-2xl font-bold mt-1 ${monthProfit >= 0 ? 'text-emerald-500' : 'text-destructive'}`}
                >
                  {formatMoney(monthProfit)}
                </h3>
              </div>
              <div
                className={`p-3 rounded-full ${monthProfit >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}
              >
                {monthProfit >= 0 ? <TrendingUp /> : <TrendingDown />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Médio / KM (30d)</p>
                <h3 className="text-2xl font-bold mt-1">{formatMoney(avgCostPerKm)}</h3>
              </div>
              <div className="p-3 bg-muted rounded-full">
                <MapPin className="text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Últimas Viagens</h3>
          <Link to="/trips" className="text-sm text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="grid gap-3">
          {trips.slice(0, 3).map((trip) => (
            <Card key={trip.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex justify-between items-center p-4">
                  <div>
                    <p className="font-semibold">
                      {trip.origin} ➔ {trip.destination}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {trip.company} • {formatDate(trip.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{formatMoney(trip.gross_value)}</p>
                    <span className="inline-block px-2 py-1 bg-muted text-[10px] rounded-full uppercase font-medium">
                      {trip.status === 'completed' ? 'Concluída' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {trips.length === 0 && (
            <p className="text-muted-foreground text-center py-4">Nenhuma viagem registrada.</p>
          )}
        </div>
      </div>
    </div>
  )
}
