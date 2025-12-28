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
      updateTotalBudget(0)
      return
    }

    // Allow numbers with optional decimal point and digits (e.g., "123.45", "123.", "123")
    if (!/^\d*\.?\d*$/.test(value)) {
      return
    }

    // Don't allow multiple decimal points
    if ((value.match(/\./g) || []).length > 1) {
      return
    }

    // Don't allow leading zeros (except "0" itself or "0." or "0.xx")
    // This prevents things like "0123" but allows "0", "0.5", "0.12"
    if (value.length > 1 && value[0] === '0' && value[1] !== '.') {
      // If it starts with 0 and second char is not decimal, reject it
      // But allow if it's just "0"
      return
    }

    // Limit decimal places to 2
    const decimalIndex = value.indexOf('.')
    if (decimalIndex !== -1) {
      const decimalPart = value.substring(decimalIndex + 1)
      if (decimalPart.length > 2) {
        return
      }
    }

    const numValue = parseFloat(value)
    
    // If it's a valid number, validate range
    if (!isNaN(numValue)) {
      // Don't allow negative values
      if (numValue < 0) {
        setInputValue('0')
        updateTotalBudget(0)
        return
      }
      
      // Limit to 10k
      if (numValue > 10000) {
        setInputValue('10000')
        updateTotalBudget(10000)
        return
      }

      // Update budget with the numeric value
      updateTotalBudget(numValue)
    }

    // Always update input value to allow typing (even if it ends with a decimal point)
    setInputValue(value)
  }

  const handleInputBlur = () => {
    setIsFocused(false)
    // On blur, ensure input shows a valid number
    if (inputValue === '' || inputValue === '.' || isNaN(Number(inputValue))) {
      setInputValue('0')
      updateTotalBudget(0)
    } else {
      // Format to 2 decimal places if it's a decimal, otherwise show as integer
      const numValue = parseFloat(inputValue)
      if (!isNaN(numValue)) {
        const formatted = numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(2)
        setInputValue(formatted)
        updateTotalBudget(numValue)
      } else {
        setInputValue('0')
        updateTotalBudget(0)
      }
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
                  inputMode="decimal"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="0"
                  className="pl-8 text-lg font-semibold h-12"
                  maxLength={8}
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
              background: `linear-gradient(to right, var(--place-category-landmark-border) 0%, var(--place-category-landmark-border) ${(totalBudget / 10000) * 100}%, var(--border) ${(totalBudget / 10000) * 100}%, var(--border) 100%)`
            }}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>$10,000</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: 'color-mix(in oklch, var(--spent) 10%, transparent)',
              borderColor: 'color-mix(in oklch, var(--spent) 30%, transparent)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp 
                className="h-4 w-4" 
                style={{ color: 'var(--spent)' }}
              />
              <span className="text-xs text-muted-foreground font-medium">Spent</span>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--spent)' }}>
              {formatCurrency(totals.actualTotal)}
            </p>
            {totalBudget > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {((totals.actualTotal / totalBudget) * 100).toFixed(0)}% of budget
              </p>
            )}
          </div>

          <div 
            className={cn(
              'p-4 rounded-lg border',
              remainingBudget < 0 && 'bg-destructive/10 border-destructive/30'
            )}
            style={remainingBudget >= 0 ? {
              backgroundColor: 'color-mix(in oklch, var(--success) 10%, transparent)',
              borderColor: 'color-mix(in oklch, var(--success) 30%, transparent)',
            } : undefined}
          >
            <div className="flex items-center gap-2 mb-2">
              {remainingBudget < 0 ? (
                <TrendingDown className="h-4 w-4 text-destructive" />
              ) : (
                <TrendingUp 
                  className="h-4 w-4" 
                  style={{ color: 'var(--success)' }}
                />
              )}
              <span className="text-xs text-muted-foreground font-medium">Remaining</span>
            </div>
            <p 
              className={cn(
                'text-lg font-bold',
                remainingBudget < 0 && 'text-destructive'
              )}
              style={remainingBudget >= 0 ? { color: 'var(--success)' } : undefined}
            >
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

