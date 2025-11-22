import { Card, CardContent } from '@/components/ui/card'
import { Plane } from 'lucide-react'

export function EmptyTripsState() {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center px-6 py-16">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Plane className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">No trips yet</h3>
        <p className="max-w-md text-center text-muted-foreground">
          Your trips will be displayed here. Start planning your first adventure!
        </p>
      </CardContent>
    </Card>
  )
}

