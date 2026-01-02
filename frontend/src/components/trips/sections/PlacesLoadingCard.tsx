import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Loader2, Landmark, Camera, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlacesLoadingCardProps {
  title?: string
  subtitle?: string
  message?: string
  compact?: boolean
}

const icons = [
  { Icon: MapPin, label: 'Finding locations' },
  { Icon: Landmark, label: 'Discovering landmarks' },
  { Icon: Camera, label: 'Exploring attractions' },
  { Icon: Compass, label: 'Mapping points of interest' },
] as const

export function PlacesLoadingCard({
  title,
  subtitle,
  message = 'Please wait while we gather the best places to visit',
  compact = false,
}: PlacesLoadingCardProps) {
  const [currentIconIndex, setCurrentIconIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % icons.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  const { label } = icons[currentIconIndex]

  return (
    <div className="space-y-6">
      {(title || subtitle) && (
        <div>
          {title && (
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <Card className="border-2 border-dashed">
        <CardContent className={compact ? 'py-10' : 'py-16'}>
          <div className={cn(
            'flex flex-col items-center justify-center',
            compact ? 'space-y-4' : 'space-y-6'
          )}>
            <div className={cn(
              'relative',
              compact ? 'h-16 w-16' : 'h-20 w-20'
            )}>
              {icons.map(({ Icon: IconComponent }, index) => (
                <div
                  key={index}
                  className={cn(
                    'absolute inset-0 flex items-center justify-center transition-all duration-500',
                    index === currentIconIndex
                      ? 'opacity-100 scale-100 rotate-0'
                      : 'opacity-0 scale-75 rotate-12'
                  )}
                >
                  <IconComponent className={cn(
                    'text-primary animate-pulse',
                    compact ? 'h-10 w-10' : 'h-12 w-12'
                  )} />
                </div>
              ))}
            </div>

            <div className={cn('text-center', compact ? 'space-y-1' : 'space-y-2')}>
              <p className={cn(
                'font-medium text-foreground animate-pulse',
                compact ? 'text-base' : 'text-lg'
              )}>
                {label}...
              </p>
              <div className="flex items-center justify-center gap-1">
                <Loader2 className={cn(
                  'animate-spin text-muted-foreground',
                  compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
                )} />
                <span className="text-sm text-muted-foreground">
                  {message}
                </span>
              </div>
            </div>

            <div className={cn('flex', compact ? 'gap-1.5' : 'gap-2')}>
              {icons.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'rounded-full transition-all duration-500',
                    compact ? 'h-1.5 w-1.5' : 'h-2 w-2',
                    index === currentIconIndex
                      ? 'bg-primary scale-125'
                      : 'bg-muted-foreground/30 scale-100'
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

