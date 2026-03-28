import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sparkles, Loader2, AlertTriangle, Calculator } from 'lucide-react'
import { apiService } from '@/services/api'
import type { Trip } from '@/types/trip'

interface BudgetCategory {
  name: string
  icon: string
  estimatedDailyCost: number
  estimatedTotalCost: number
  description: string
}

interface BudgetEstimateData {
  summary: string
  categories: BudgetCategory[]
  totalEstimatedBudget: number
  tips: string[]
}

export function BudgetEstimateCard({ trip }: { trip: Trip }) {
  const [estimate, setEstimate] = useState<BudgetEstimateData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateEstimate = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      setEstimate(null)

      const response = await apiService.generateBudgetEstimate({
        destinationName: trip.destinationName,
        destinationLocation: trip.destinationLocation,
        departureDate: trip.departureDate,
        returnDate: trip.returnDate,
      })

      if (!response.success || !response.content) {
        setError(response.error || 'Failed to generate budget estimate.')
        return
      }

      const cleaned = response.content
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim()

      const parsed: BudgetEstimateData = JSON.parse(cleaned)
      setEstimate(parsed)
    } catch {
      setError('Failed to parse budget estimate. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [trip])

  if (estimate) {
    return (
      <div className={cn(
        'p-6 rounded-lg border-2 transition-all',
        'bg-linear-to-br from-violet-500/10 to-violet-500/5',
        'border-violet-500/30'
      )}>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-violet-500/10 border-violet-500/30 border">
                <Sparkles className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">AI Budget Estimate</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {estimate.summary}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={generateEstimate} disabled={isLoading}>
              Regenerate
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {estimate.categories.map((cat) => (
              <div
                key={cat.name}
                className="p-4 rounded-lg border bg-background/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm font-medium text-foreground">{cat.name}</span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  ${cat.estimatedTotalCost}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ~${cat.estimatedDailyCost}/day
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cat.description}
                </p>
              </div>
            ))}
          </div>

          <div className={cn(
            'p-4 rounded-lg border-2',
            'bg-linear-to-r from-violet-500/10 to-violet-500/5',
            'border-violet-500/30'
          )}>
            <p className="text-sm font-medium text-muted-foreground">Estimated Total</p>
            <p className="text-2xl font-bold text-foreground">
              ${estimate.totalEstimatedBudget}
            </p>
          </div>

          {estimate.tips.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tips</p>
              <ul className="space-y-1">
                {estimate.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-violet-500 mt-0.5 shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Powered by Gemini. Estimates are approximate and exclude flights.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'p-6 rounded-lg border-2 border-dashed transition-all',
      'border-muted-foreground/20'
    )}>
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="p-3 rounded-lg bg-violet-500/10">
          <Calculator className="h-6 w-6 text-violet-500" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">
            Not sure how much you'll need?
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Let AI estimate your expected spendings based on your destination, trip duration, and time of year.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        <Button
          onClick={generateEstimate}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Calculate Expected Spendings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
