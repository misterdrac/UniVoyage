import { DollarSign } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MAX_TOTAL_BUDGET } from '@/lib/budgeting'

interface BudgetStepProps {
  totalBudget: string
  onChange: (budget: string) => void
}

const BUDGET_PRESETS = [100, 250, 500, 1000, 2500, 5000]

export function BudgetStep({ totalBudget, onChange }: BudgetStepProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    const parts = raw.split('.')
    const sanitized = parts.length > 2
      ? parts[0] + '.' + parts.slice(1).join('')
      : raw

    if (sanitized === '' || sanitized === '.') {
      onChange('')
      return
    }

    const num = parseFloat(sanitized)
    if (!isNaN(num) && num <= MAX_TOTAL_BUDGET) {
      onChange(sanitized)
    }
  }

  const parsedBudget = parseFloat(totalBudget) || 0
  const isOverMax = parsedBudget > MAX_TOTAL_BUDGET

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          What's your budget?
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Set an overall budget for your trip. You can always adjust this later and break it down into categories.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <Label htmlFor="totalBudget" className="text-sm text-muted-foreground">
            Total Budget
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="totalBudget"
              type="text"
              inputMode="decimal"
              value={totalBudget}
              onChange={handleInputChange}
              placeholder="0.00"
              className="pl-10 h-14 text-2xl font-semibold tracking-tight no-spinners"
              autoComplete="off"
            />
          </div>
          {isOverMax && (
            <p className="text-xs text-destructive">
              Maximum budget is ${MAX_TOTAL_BUDGET.toLocaleString()}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Max ${MAX_TOTAL_BUDGET.toLocaleString()} &middot; You can edit this anytime on the trip page
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Quick select
          </span>
          <div className="grid grid-cols-3 gap-2">
            {BUDGET_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset.toString())}
                className={`
                  cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition-all
                  ${parsedBudget === preset
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent'
                  }
                `}
              >
                ${preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
