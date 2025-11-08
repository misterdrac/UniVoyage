import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Trip } from '@/types/trip'
import { formatCurrency } from './utils'

interface BudgetOverviewCardProps {
  trip: Trip
  totalBudget: number
  totalAllocated: number
  remainingBudget: number
  averagePerDayActual: number
  plannedVsActualRatio: number
}

export function BudgetOverviewCard({
  trip,
  totalBudget,
  totalAllocated,
  remainingBudget,
  averagePerDayActual,
  plannedVsActualRatio,
}: BudgetOverviewCardProps) {
  const tripDurationMs = new Date(trip.returnDate).getTime() - new Date(trip.departureDate).getTime()
  const tripDurationDays = Math.max(Math.ceil(tripDurationMs / (1000 * 60 * 60 * 24)), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span>Budget overview</span>
          <span className="text-sm font-normal text-muted-foreground">
            {trip.destinationName} · {tripDurationDays} day{tripDurationDays !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-sm text-muted-foreground">Total budget</p>
          <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalBudget)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Allocated</p>
          <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalAllocated)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Remaining</p>
          <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(remainingBudget)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Avg daily spend</p>
          <p className="text-2xl font-semibold text-foreground">{formatCurrency(averagePerDayActual)}</p>
        </div>
        <div className="sm:col-span-2 xl:col-span-4">
          <p className="mb-1 text-sm text-muted-foreground">Actual vs planned</p>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                totalBudget !== 0 && plannedVsActualRatio > 100 ? 'bg-destructive' : 'bg-primary'
              )}
              style={{ width: `${Math.min(plannedVsActualRatio, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalBudget === 0
              ? 'Set your target budget to start tracking progress.'
              : `${plannedVsActualRatio.toFixed(0)}% of your planned budget has been spent.`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}


