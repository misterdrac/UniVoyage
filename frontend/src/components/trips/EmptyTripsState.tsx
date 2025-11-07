import { Card, CardContent } from '@/components/ui/card'
import { Plane } from 'lucide-react'

export function EmptyTripsState() {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Plane className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No trips yet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Your trips will be displayed here. Start planning your first adventure!
        </p>
      </CardContent>
    </Card>
  )
}


