import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Wallet, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

interface TotalBudgetCardProps {
  totalBudget: number
  updateTotalBudget: (amount: number) => void
  totals: {
    actualTotal: number
  }
  remainingBudget: number
}

export function TotalBudgetCard({
  totalBudget,
  updateTotalBudget,
  totals,
  remainingBudget,
}: TotalBudgetCardProps) {
  const [inputValue, setInputValue] = useState(totalBudget.toString())
  const [isFocused, setIsFocused] = useState(false)

  // Sync input value when totalBudget changes externally (only when not focused)
  useEffect(() => {
    if (!isFocused) {
      setInputValue(totalBudget.toString())
    }
  }, [totalBudget, isFocused])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Allow empty input while typing
    if (value === '') {
      setInputValue('')
      return
    }

    // Only allow numbers
    if (!/^\d+$/.test(value)) {
      return
    }

    const numValue = Number(value)
    
    // Limit to 10k
    if (numValue > 10000) {
      setInputValue('10000')
      updateTotalBudget(10000)
      return
    }

    setInputValue(value)
    updateTotalBudget(numValue)
  }

  const handleInputBlur = () => {
    setIsFocused(false)
    // Ensure input shows current budget value on blur
    if (inputValue === '' || isNaN(Number(inputValue))) {
      setInputValue(totalBudget.toString())
    } else {
      // Ensure it matches the actual budget (in case user typed invalid value)
      setInputValue(totalBudget.toString())
    }
  }

  const handleInputFocus = () => {
    setIsFocused(true)
  }

  return (
    <div className={cn(
      'p-6 rounded-lg border-2 transition-all',
      'bg-linear-to-br from-primary/10 to-primary/5',
      'border-primary/30'
    )}>
      <div className="space-y-6">
        {/* Header with Icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg bg-primary/10 border-primary/30 border')}>
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <Label htmlFor="total-budget" className="text-lg font-semibold text-foreground">
                Total Budget
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set your overall trip budget
              </p>
            </div>
          </div>
        </div>

        {/* Budget Input and Slider */}
        <div className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="total-budget-input" className="text-sm font-medium text-muted-foreground">
              Budget Amount
            </Label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  $
                </span>
                <Input
                  id="total-budget-input"
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="0"
                  className="pl-8 text-lg font-semibold h-12"
                  maxLength={6}
                />
              </div>
              <div className="text-xs text-muted-foreground shrink-0">
                Max: {formatCurrency(10000)}
              </div>
            </div>
          </div>
          <input
            type="range"
            id="total-budget"
            min="0"
            max="10000"
            step="50"
            value={totalBudget}
            onChange={(e) => updateTotalBudget(Number(e.target.value) || 0)}
            className={cn(
              'w-full h-3 rounded-lg appearance-none cursor-pointer',
              'bg-muted',
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-lg',
              '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-lg'
            )}
            style={{
              background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${(totalBudget / 10000) * 100}%, rgb(229 231 235) ${(totalBudget / 10000) * 100}%, rgb(229 231 235) 100%)`
            }}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>$10,000</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={cn(
            'p-4 rounded-lg border',
            'bg-blue-500/10 border-blue-500/30'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground font-medium">Spent</span>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(totals.actualTotal)}
            </p>
            {totalBudget > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {((totals.actualTotal / totalBudget) * 100).toFixed(0)}% of budget
              </p>
            )}
          </div>

          <div className={cn(
            'p-4 rounded-lg border',
            remainingBudget < 0 
              ? 'bg-destructive/10 border-destructive/30'
              : 'bg-green-500/10 border-green-500/30'
          )}>
            <div className="flex items-center gap-2 mb-2">
              {remainingBudget < 0 ? (
                <TrendingDown className="h-4 w-4 text-destructive" />
              ) : (
                <TrendingUp className="h-4 w-4 text-green-600" />
              )}
              <span className="text-xs text-muted-foreground font-medium">Remaining</span>
            </div>
            <p className={cn(
              'text-lg font-bold',
              remainingBudget < 0 ? 'text-destructive' : 'text-green-600'
            )}>
              {formatCurrency(remainingBudget)}
            </p>
            {totalBudget > 0 && remainingBudget >= 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {((remainingBudget / totalBudget) * 100).toFixed(0)}% available
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {totalBudget > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Budget Usage</span>
              <span>{((totals.actualTotal / totalBudget) * 100).toFixed(0)}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  remainingBudget < 0 
                    ? 'bg-destructive' 
                    : 'bg-linear-to-r from-primary to-primary/80'
                )}
                style={{
                  width: `${Math.min((totals.actualTotal / totalBudget) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

