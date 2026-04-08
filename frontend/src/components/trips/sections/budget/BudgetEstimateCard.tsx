import { useState, useCallback, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { Sparkles, Loader2, AlertTriangle, Calculator, ChevronDown } from 'lucide-react'
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

const STORAGE_PREFIX = 'budget-estimate-'

const CATEGORY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  accommodation:    { bg: 'bg-blue-500/10',   border: 'border-blue-500/40',   text: 'text-blue-600' },
  'food & dining':  { bg: 'bg-orange-500/10', border: 'border-orange-500/40', text: 'text-orange-600' },
  'activities & attractions': { bg: 'bg-green-500/10', border: 'border-green-500/40', text: 'text-green-600' },
  'local transportation':     { bg: 'bg-purple-500/10', border: 'border-purple-500/40', text: 'text-purple-600' },
}

const DEFAULT_STYLE = { bg: 'bg-muted/50', border: 'border-border', text: 'text-muted-foreground' }

function getCategoryStyle(name: string) {
  const key = name.toLowerCase()
  return CATEGORY_STYLES[key] || DEFAULT_STYLE
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

export function BudgetEstimateCard({ trip }: { trip: Trip }) {
  const [estimate, setEstimate] = useState<BudgetEstimateData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const storageKey = useMemo(() => `${STORAGE_PREFIX}${trip.id}`, [trip.id])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const cached = localStorage.getItem(storageKey)
    if (!cached) return
    try {
      const parsed: BudgetEstimateData = JSON.parse(cached)
      setEstimate(parsed)
    } catch {
      console.error('Failed to load cached budget estimate')
    }
  }, [storageKey])

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

      try {
        localStorage.setItem(storageKey, JSON.stringify(parsed))
      } catch {
        console.error('Failed to cache budget estimate')
      }
    } catch {
      setError('Failed to parse budget estimate. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [trip, storageKey])

  if (isLoading) {
    return (
      <div className="px-5 py-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Calculating needed budget&hellip;
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Estimating costs for {trip.destinationName}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (estimate) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="rounded-lg border bg-card overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full px-5 py-4 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="p-2 rounded-lg bg-secondary">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>

              <div className="flex-1 text-left min-w-0">
                <p className="text-sm text-muted-foreground">
                  Estimated budget needed for this trip is{' '}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(estimate.totalEstimatedBudget)}
                  </span>
                </p>
                {!isOpen && (
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                    Expand to see budget breakdown
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <span>{isOpen ? 'Hide' : 'Details'}</span>
                <ChevronDown className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )} />
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="animate-collapsible-down data-[state=closed]:animate-collapsible-up">
            <div className="px-5 pb-6 space-y-4">
              <div className="h-px bg-border" />

              <p className="text-sm text-muted-foreground leading-relaxed">
                {estimate.summary}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {estimate.categories.map((cat) => {
                  const style = getCategoryStyle(cat.name)
                  return (
                    <div
                      key={cat.name}
                      className={cn('p-4 rounded-xl border', style.bg, style.border)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span className={cn('text-xs font-medium', style.text)}>{cat.name}</span>
                      </div>
                      <p className={cn('text-lg font-bold', style.text)}>
                        {formatCurrency(cat.estimatedTotalCost)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">
                        {formatCurrency(cat.estimatedDailyCost)}/day &middot; {cat.description}
                      </p>
                    </div>
                  )
                })}
              </div>

              {estimate.tips.length > 0 && (
                <div className="p-4 rounded-xl border bg-secondary/50">
                  <p className="text-xs font-medium text-foreground mb-2.5">Money-saving tips</p>
                  <div className="space-y-2">
                    {estimate.tips.map((tip, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5 shrink-0">&bull;</span>
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5 pt-1">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                  Gemini
                </Badge>
                <span className="text-[10px] text-muted-foreground/60">
                  Estimates are approximate &middot; Flights excluded
                </span>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    )
  }

  return (
    <div className="px-5 py-4 rounded-lg border border-dashed bg-card">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-secondary">
          <Calculator className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            Not sure how much you&apos;ll need?
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Estimate costs based on your destination and dates
          </p>
        </div>

        <Button
          onClick={generateEstimate}
          disabled={isLoading}
          size="sm"
          variant="secondary"
          className="gap-1.5 shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Calculate
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive mt-3 ml-11">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
