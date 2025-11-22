import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AngleDial } from './AngleDial'
import { MAX_TOTAL_BUDGET, TOTAL_BUDGET_ICON } from './constants'
import { budgetToDegrees, degreesToBudget, formatCurrency } from './utils'

interface BudgetTotalCardProps {
  totalBudget: number
  totalAllocated: number
  remainingBudget: number
  onTotalBudgetChange: (value: number) => void
  onReset: () => void
}

export function BudgetTotalCard({
  totalBudget,
  totalAllocated,
  remainingBudget,
  onTotalBudgetChange,
  onReset,
}: BudgetTotalCardProps) {
  const SliderIcon = TOTAL_BUDGET_ICON

  const handleSliderChange = (degrees: number) => {
    onTotalBudgetChange(degreesToBudget(degrees))
  }

  const handleInputChange = (value: string) => {
    const numericValue = Math.min(Math.max(Number(value) || 0, 0), MAX_TOTAL_BUDGET)
    onTotalBudgetChange(numericValue)
  }

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Total budget</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-center">
        <div className="mx-auto lg:mx-0">
          <AngleDial
            value={budgetToDegrees(totalBudget)}
            onValueChange={handleSliderChange}
            size={176}
            thickness={16}
            gradientFrom="#3b82f6"
            gradientTo="#9333ea"
          >
            <div className="rounded-full bg-sky-500/15 p-3 text-sky-500">
              <SliderIcon className="h-6 w-6" />
            </div>
            <div className="text-2xl font-semibold text-foreground">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">up to $10,000</p>
          </AngleDial>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="total-budget" className="text-xs text-muted-foreground">
              Set total budget (USD)
            </Label>
            <Input
              id="total-budget"
              type="number"
              min="0"
              max={MAX_TOTAL_BUDGET}
              step="50"
              value={totalBudget}
              onChange={(event) => handleInputChange(event.target.value)}
              className="mt-1"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="border-dashed border-2 border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="py-4">
                <p className="text-xs text-emerald-600">Remaining to allocate</p>
                <p className="text-lg font-semibold text-emerald-600">{formatCurrency(remainingBudget)}</p>
              </CardContent>
            </Card>
            <Card className="border-dashed border-2 border-sky-500/30 bg-sky-500/5">
              <CardContent className="py-4">
                <p className="text-xs text-sky-500">Currently allocated</p>
                <p className="text-lg font-semibold text-sky-500">{formatCurrency(totalAllocated)}</p>
              </CardContent>
            </Card>
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={onReset}>
            Reset all
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

