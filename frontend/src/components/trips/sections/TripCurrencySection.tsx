import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowRightLeft, CircleDollarSign, AlertTriangle, Coins, Loader2 } from 'lucide-react'
import type { Trip } from '@/types/trip'
import { useTripCurrency } from '@/hooks/useTripCurrency'

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

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-muted-foreground">
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

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-xl font-semibold text-foreground">Destination currency</h3>
        <Card className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <Coins className="size-5 text-primary" />
            <p className="text-sm text-muted-foreground">Local currency</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold text-foreground">{data.destinationCurrencyName}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Code</p>
              <p className="text-lg font-semibold text-foreground">{data.destinationCurrencyCode}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Symbol</p>
              <p className="text-lg font-semibold text-foreground">{destSymbol}</p>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold text-foreground">Exchange rate</h3>
        <Card className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <ArrowRightLeft className="size-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Your currency ({data.baseCurrencyCode}) → destination ({data.destinationCurrencyCode})
            </p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            1 {data.baseCurrencyCode} = {data.exchangeRate.toFixed(4)} {data.destinationCurrencyCode}
          </p>
          {sameCurrency && (
            <p className="mt-2 text-xs text-muted-foreground">Same currency — no conversion needed.</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">Rates are provided by the server and may differ from bank spreads.</p>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold text-foreground">Converter</h3>
        <Card className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <CircleDollarSign className="size-5 text-primary" />
            <p className="text-sm text-muted-foreground">Quick conversion</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency-base">Amount in {data.baseCurrencyCode}</Label>
              <Input
                id="currency-base"
                type="number"
                placeholder="0.00"
                min={0}
                step="0.01"
                value={baseAmountStr}
                onChange={(e) => onBaseChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency-dest">Amount in {data.destinationCurrencyCode}</Label>
              <Input
                id="currency-dest"
                type="number"
                placeholder="0.00"
                min={0}
                step="0.01"
                value={localAmountStr}
                onChange={(e) => onLocalChange(e.target.value)}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
