import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRightLeft, CircleDollarSign, AlertTriangle, Coins } from 'lucide-react'

export function TripCurrencySection() {
  return (
    <div className="space-y-8">
      {/* Destination Currency */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Destination Currency</h3>
        <Card className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Coins className="size-5 text-primary" />
            <p className="text-sm text-muted-foreground">Local Currency</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Name</p>
              <p className="text-lg font-semibold text-foreground">Euro</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Code</p>
              <p className="text-lg font-semibold text-foreground">EUR</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Symbol</p>
              <p className="text-lg font-semibold text-foreground">&euro;</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Exchange Rate */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Exchange Rate</h3>
        <Card className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <ArrowRightLeft className="size-5 text-primary" />
            <p className="text-sm text-muted-foreground">Rate vs USD</p>
          </div>
          <p className="text-2xl font-bold text-foreground">1 USD = 0.93 EUR</p>
          <p className="text-xs text-muted-foreground mt-1">Static placeholder — connect to a live API for real rates</p>
        </Card>
      </div>

      {/* Converter */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Converter</h3>
        <Card className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <CircleDollarSign className="size-5 text-primary" />
            <p className="text-sm text-muted-foreground">Quick Conversion</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency-usd">Amount in USD</Label>
              <Input
                id="currency-usd"
                type="number"
                placeholder="0.00"
                min={0}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency-local">Amount in EUR</Label>
              <Input
                id="currency-local"
                type="number"
                placeholder="0.00"
                min={0}
                step="0.01"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Error placeholder */}
      <Card className="p-5 rounded-xl border border-destructive/30 bg-card">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-5 text-destructive" />
          <p className="text-sm text-destructive font-medium">Currency rate unavailable</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Unable to fetch the latest exchange rate. Please try again later.
        </p>
      </Card>
    </div>
  )
}
