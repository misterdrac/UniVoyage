import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { CategoryTotals, TripBudgetExpense, BudgetCategoryValue } from '@/hooks/useTripBudget'
import type { CategoryConfig } from './constants'
import { AngleDial } from './AngleDial'
import { budgetToDegrees, formatCurrency } from './utils'

interface BudgetCategoryCardProps {
  summary: CategoryTotals
  config: CategoryConfig
  totalBudget: number
  allocationDraft: string
  onAllocationInputChange: (category: BudgetCategoryValue, value: string) => void
  onAllocationSliderChange: (category: BudgetCategoryValue, degrees: number) => void
  latestExpense?: TripBudgetExpense
}

export function BudgetCategoryCard({
  summary,
  config,
  totalBudget,
  allocationDraft,
  onAllocationInputChange,
  onAllocationSliderChange,
  latestExpense,
}: BudgetCategoryCardProps) {
  const { allocation, actual, variance } = summary
  const ratio = allocation ? Math.min((actual / allocation) * 100, 100) : 0
  const sliderValue = budgetToDegrees(allocation, totalBudget)
  const disabled = totalBudget === 0
  let latestExpenseMeta: { amount: number; description?: string; date?: string } | null = null

  if (latestExpense) {
    latestExpenseMeta = {
      amount: latestExpense.amount,
      description: latestExpense.description,
      date: latestExpense.date ? format(new Date(latestExpense.date), 'MMM d') : undefined,
    }
  }

  return (
    <Card key={summary.category} className="border-border/70">
      <CardContent className="flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:gap-6">
        <div className="mx-auto lg:mx-0">
          <AngleDial
            value={sliderValue}
            onValueChange={(value) => onAllocationSliderChange(summary.category, value)}
            size={168}
            thickness={18}
            gradientFrom={config.progressFrom}
            gradientTo={config.progressTo}
            disabled={disabled}
          >
            <div className={cn('rounded-full p-3 text-xl', config.mutedClass, config.accentClass)}>
              <config.icon className="h-6 w-6" />
            </div>
            <div className="text-xl font-semibold text-foreground">{formatCurrency(allocation)}</div>
            <p className="text-xs text-muted-foreground">allocated</p>
          </AngleDial>
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{summary.label}</p>
            <p className="text-xs text-muted-foreground">
              {variance === 0
                ? 'Perfectly on track'
                : variance > 0
                  ? `${formatCurrency(variance)} remaining`
                  : `Over by ${formatCurrency(Math.abs(variance))}`}
            </p>
            {disabled ? <p className="text-[11px] text-muted-foreground">Set a total budget to enable this category.</p> : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div>
              <Label htmlFor={`${summary.category}-allocation`} className="text-xs text-muted-foreground">
                Allocation amount
              </Label>
              <Input
                id={`${summary.category}-allocation`}
                type="number"
                min="0"
                max={totalBudget}
                step="10"
                value={allocationDraft}
                onChange={(event) => onAllocationInputChange(summary.category, event.target.value)}
                className="mt-1"
                disabled={disabled}
              />
            </div>
            <div className="rounded-md bg-muted px-3 py-2 text-center">
              <p className={cn('text-xs uppercase tracking-wide', config.accentClass)}>share</p>
              <p className="text-sm font-semibold text-foreground">
                {totalBudget > 0
                  ? (allocation / totalBudget || 0).toLocaleString(undefined, {
                      style: 'percent',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  : '—'}
              </p>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-all', variance < 0 ? 'bg-destructive' : 'bg-primary')}
              style={{ width: `${ratio}%` }}
            />
          </div>
          <div>
            {latestExpenseMeta ? (
              <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{formatCurrency(latestExpenseMeta.amount)}</span>
                {latestExpenseMeta.description ? ` · ${latestExpenseMeta.description}` : ''}
                {latestExpenseMeta.date ? ` · ${latestExpenseMeta.date}` : ''}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No expenses logged yet.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


