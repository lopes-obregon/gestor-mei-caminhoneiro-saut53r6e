import { useData } from '@/hooks/use-data'
import { Card, CardContent } from '@/components/ui/card'
import { formatMoney, formatDate } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/types'
import { Wrench, Fuel, Utensils, Shield, FileText, BadgeDollarSign, Truck } from 'lucide-react'

export default function Expenses() {
  const { expenses } = useData()

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
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-background rounded-full border shadow-sm">
                    {getIcon(exp.category)}
                  </div>
                  <div>
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
                      {exp.expand?.trip_id && (
                        <span className="ml-2 text-primary font-medium">Vinculado a viagem</span>
                      )}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-muted-foreground mt-1 md:hidden">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-destructive">{formatMoney(exp.amount)}</p>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma despesa registrada.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
