import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowRightLeft, CircleDollarSign, AlertTriangle, Coins, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import type { Trip } from '@/types/trip'
import { useTripCurrency } from '@/hooks/useTripCurrency'
import { cn } from '@/lib/utils'

/** Step for ledger-style up/down controls (larger than typical 0.01 spinner step). */
const AMOUNT_STEP = 5

function currencySymbolForCode(code: string): string {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(0)
    return parts.find((p) => p.type === 'currency')?.value ?? code
  } catch {
    return code
  }
}

interface TripCurrencySectionProps {
  trip: Trip
}

export function TripCurrencySection({ trip }: TripCurrencySectionProps) {
  const { data, isLoading, error, refetch } = useTripCurrency(trip.id)
  const [baseAmountStr, setBaseAmountStr] = useState('')
  const [localAmountStr, setLocalAmountStr] = useState('')

  const rate = data?.exchangeRate
  const baseCode = data?.baseCurrencyCode ?? ''
  const destCode = data?.destinationCurrencyCode ?? ''
  const sameCurrency = Boolean(baseCode && destCode && baseCode === destCode)

  useEffect(() => {
    setBaseAmountStr('')
    setLocalAmountStr('')
  }, [trip.id, baseCode, destCode, rate])

  const onBaseChange = useCallback(
    (raw: string) => {
      setBaseAmountStr(raw)
      if (rate == null || !Number.isFinite(rate) || rate === 0) {
        setLocalAmountStr('')
        return
      }
      const n = parseFloat(raw)
      if (!Number.isFinite(n)) {
        setLocalAmountStr('')
        return
      }
      setLocalAmountStr((n * rate).toFixed(2))
    },
    [rate]
  )

  const onLocalChange = useCallback(
    (raw: string) => {
      setLocalAmountStr(raw)
      if (rate == null || !Number.isFinite(rate) || rate === 0) {
        setBaseAmountStr('')
        return
      }
      const n = parseFloat(raw)
      if (!Number.isFinite(n)) {
        setBaseAmountStr('')
        return
      }
      setBaseAmountStr((n / rate).toFixed(2))
    },
    [rate]
  )

  const bumpBase = useCallback(
    (delta: number) => {
      const n = parseFloat(baseAmountStr)
      const cur = Number.isFinite(n) ? n : 0
      const next = Math.max(0, parseFloat((cur + delta).toFixed(2)))
      onBaseChange(next === 0 ? '' : String(next))
    },
    [baseAmountStr, onBaseChange]
  )

  const bumpLocal = useCallback(
    (delta: number) => {
      const n = parseFloat(localAmountStr)
      const cur = Number.isFinite(n) ? n : 0
      const next = Math.max(0, parseFloat((cur + delta).toFixed(2)))
      onLocalChange(next === 0 ? '' : String(next))
    },
    [localAmountStr, onLocalChange]
  )

  const numberInputNoSpinners = cn(
    'pr-14 sm:pr-16',
    '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]',
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-primary/10 bg-linear-to-b from-primary/6 to-transparent px-4 py-10 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm">Loading exchange rate…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/30 bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Currency rate unavailable</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {error ?? 'Unable to fetch the latest exchange rate. Please try again later.'}
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  const destSymbol = currencySymbolForCode(data.destinationCurrencyCode)

  const cardAccent =
    'rounded-xl border border-primary/10 bg-linear-to-br from-primary/6 via-card to-card shadow-sm transition-shadow hover:border-primary/20 hover:shadow-md'

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-xl font-semibold text-foreground">Destination currency</h3>
        <Card className={cn(cardAccent, 'p-5')}>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/10">
              <Coins className="size-5" aria-hidden />
            </span>
            <p className="text-sm text-muted-foreground">Local currency</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold text-foreground">{data.destinationCurrencyName}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Code</p>
              <span className="inline-flex rounded-md bg-primary/12 px-2.5 py-1 font-mono text-base font-semibold text-primary tabular-nums">
                {data.destinationCurrencyCode}
              </span>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Symbol</p>
              <p className="text-lg font-semibold text-primary">{destSymbol}</p>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold text-foreground">Exchange rate</h3>
        <Card
          className={cn(
            'rounded-xl border border-chart-4/20 bg-linear-to-br from-chart-4/10 via-card to-card p-5 shadow-sm transition-shadow hover:border-chart-4/30 hover:shadow-md',
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-chart-4/15 text-chart-4 ring-1 ring-chart-4/25">
              <ArrowRightLeft className="size-5" aria-hidden />
            </span>
            <p className="text-sm text-muted-foreground">
              Your currency ({data.baseCurrencyCode}) → destination ({data.destinationCurrencyCode})
            </p>
          </div>
          <p className="text-2xl font-bold leading-snug tracking-tight text-foreground">
            <span className="text-muted-foreground">1</span>{' '}
            <span className="font-mono text-primary">{data.baseCurrencyCode}</span>{' '}
            <span className="text-base font-normal text-muted-foreground">=</span>{' '}
            <span className="font-mono text-chart-4">{data.exchangeRate.toFixed(4)}</span>{' '}
            <span className="font-mono text-primary">{data.destinationCurrencyCode}</span>
          </p>
          {sameCurrency && (
            <p className="mt-2 text-xs text-muted-foreground">Same currency — no conversion needed.</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">Rates are provided by the server and may differ from bank spreads.</p>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold text-foreground">Converter</h3>
        <Card
          className={cn(
            'rounded-xl border border-chart-3/20 bg-linear-to-br from-chart-3/10 via-card to-card p-5 shadow-sm transition-shadow hover:border-chart-3/30 hover:shadow-md',
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-chart-3/15 text-chart-3 ring-1 ring-chart-3/25">
              <CircleDollarSign className="size-5" aria-hidden />
            </span>
            <p className="text-sm text-muted-foreground">Quick conversion</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency-base" className="text-foreground/90">
                Amount in <span className="font-mono text-primary">{data.baseCurrencyCode}</span>
              </Label>
              <div className="relative">
                <Input
                  id="currency-base"
                  type="number"
                  placeholder="0.00"
                  min={0}
                  step={AMOUNT_STEP}
                  inputMode="decimal"
                  value={baseAmountStr}
                  onChange={(e) => onBaseChange(e.target.value)}
                  className={numberInputNoSpinners}
                />
                <div className="absolute right-0.5 top-1/2 flex -translate-y-1/2 flex-col gap-0 sm:right-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-b-none p-0 hover:bg-muted sm:h-5 sm:w-5"
                    aria-label={`Increase ${data.baseCurrencyCode} by ${AMOUNT_STEP}`}
                    onClick={() => bumpBase(AMOUNT_STEP)}
                  >
                    <ChevronUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-t-none p-0 hover:bg-muted sm:h-5 sm:w-5"
                    aria-label={`Decrease ${data.baseCurrencyCode} by ${AMOUNT_STEP}`}
                    onClick={() => bumpBase(-AMOUNT_STEP)}
                  >
                    <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency-dest" className="text-foreground/90">
                Amount in{' '}
                <span className="font-mono text-chart-3">{data.destinationCurrencyCode}</span>
              </Label>
              <div className="relative">
                <Input
                  id="currency-dest"
                  type="number"
                  placeholder="0.00"
                  min={0}
                  step={AMOUNT_STEP}
                  inputMode="decimal"
                  value={localAmountStr}
                  onChange={(e) => onLocalChange(e.target.value)}
                  className={numberInputNoSpinners}
                />
                <div className="absolute right-0.5 top-1/2 flex -translate-y-1/2 flex-col gap-0 sm:right-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-b-none p-0 hover:bg-muted sm:h-5 sm:w-5"
                    aria-label={`Increase ${data.destinationCurrencyCode} by ${AMOUNT_STEP}`}
                    onClick={() => bumpLocal(AMOUNT_STEP)}
                  >
                    <ChevronUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-t-none p-0 hover:bg-muted sm:h-5 sm:w-5"
                    aria-label={`Decrease ${data.destinationCurrencyCode} by ${AMOUNT_STEP}`}
                    onClick={() => bumpLocal(-AMOUNT_STEP)}
                  >
                    <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
