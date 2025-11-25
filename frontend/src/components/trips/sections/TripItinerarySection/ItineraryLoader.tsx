import { Card, CardContent } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

interface ItineraryLoaderProps {
  message: string
}

export function ItineraryLoader({ message }: ItineraryLoaderProps) {
  return (
    <Card className="border-primary/30 bg-card/80 shadow-xl">
      <CardContent className="flex flex-col items-center gap-6 py-10 text-center">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <div className="absolute inset-3 animate-[spin_4s_linear_infinite] rounded-full border-4 border-primary/10 border-t-transparent" />
          <div className="relative flex h-full w-full items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">Generating itinerary…</p>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}

