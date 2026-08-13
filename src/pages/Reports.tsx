import { useData } from '@/hooks/use-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatMoney } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#1E3A8A', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#64748B']

export default function Reports() {
  const { trips, expenses } = useData()
  const currentYear = new Date().getFullYear()

  // DASN-SIMEI Assistant Calculations
  const yearTrips = trips.filter((t) => new Date(t.date).getFullYear() === currentYear)
  const totalRevenue = yearTrips.reduce((acc, t) => acc + t.gross_value, 0)

  // Chart Data preparation
  const yearExpenses = expenses.filter((e) => new Date(e.date).getFullYear() === currentYear)
  const expensesByCategory = yearExpenses.reduce(
    (acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(expensesByCategory)
    .map(([cat, amount]) => ({
      name: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS],
      value: amount,
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Relatórios e Impostos</h1>

      <Card className="border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
          <CardTitle className="text-primary">Assistente DASN-SIMEI ({currentYear})</CardTitle>
          <CardDescription>
            Resumo anual para a sua declaração do Imposto de Renda e MEI
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Faturamento Bruto Total
              </p>
              <p className="text-2xl font-bold">{formatMoney(totalRevenue)}</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-lg">
              <p className="text-sm font-medium text-emerald-700 mb-1">Rendimento Isento (92%)</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatMoney(totalRevenue * 0.92)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Composição de Custos Anuais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatMoney(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Sem dados de despesas para exibir
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
