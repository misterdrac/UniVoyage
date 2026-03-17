import { DollarSign, Backpack, Sofa, Crown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MAX_TOTAL_BUDGET } from '@/lib/budgeting'
import { cn } from '@/lib/utils'

interface BudgetStepProps {
  totalBudget: string
  onChange: (budget: string) => void
}

const TRAVEL_STYLES = [
  {
    id: 'backpacker',
    label: 'Backpacker',
    description: 'Hostels, street food, public transit',
    amount: 300,
    icon: Backpack,
  },
  {
    id: 'comfort',
    label: 'Comfort',
    description: 'Hotels, dining out, some extras',
    amount: 1000,
    icon: Sofa,
  },
  {
    id: 'luxury',
    label: 'Luxury',
    description: 'Premium stays, fine dining, VIP',
    amount: 3000,
    icon: Crown,
  },
] as const


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
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          What's your budget?
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Pick a travel style or enter a custom amount. You can always adjust this later.
        </p>
      </div>

      <div className="w-full max-w-md space-y-5">
        {/* Travel style cards */}
        <div className="grid grid-cols-3 gap-3">
          {TRAVEL_STYLES.map((style) => {
            const isActive = parsedBudget === style.amount
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onChange(style.amount.toString())}
                className={cn(
                  'cursor-pointer group relative flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all duration-200',
                  isActive
                    ? 'border-primary bg-primary/10 shadow-sm shadow-primary/20'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-accent',
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
                )}>
                  <style.icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <span className={cn(
                    'block text-sm font-semibold',
                    isActive ? 'text-primary' : 'text-foreground',
                  )}>
                    {style.label}
                  </span>
                  <span className="block text-[11px] leading-tight text-muted-foreground mt-0.5">
                    {style.description}
                  </span>
                </div>
                <span className={cn(
                  'text-xs font-bold mt-1',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}>
                  ${style.amount.toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or enter custom amount</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Custom input */}
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
        </div>

      </div>
    </div>
  )
}
