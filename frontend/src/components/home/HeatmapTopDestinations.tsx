import { cn } from '@/lib/utils'

export interface HeatmapTopDestinationItem {
  rank: number
  name: string
  country: string
  imageUrl: string
  imageAlt: string
}

interface HeatmapTopDestinationsProps {
  items: HeatmapTopDestinationItem[]
}

/**
 * Minimal top-3 strip: rank on image, city + country only.
 */
export function HeatmapTopDestinations({ items }: HeatmapTopDestinationsProps) {
  if (items.length === 0) return null

  return (
    <div className="mt-10 md:mt-14">
      <div className="mb-6 text-center md:mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Top destinations
        </p>
      </div>

      <div
        className={cn(
          'grid gap-5 sm:gap-6',
          items.length === 1 && 'mx-auto max-w-sm',
          items.length === 2 && 'mx-auto max-w-3xl sm:grid-cols-2',
          items.length >= 3 && 'md:grid-cols-3'
        )}
      >
        {items.map((item) => (
          <article
            key={`${item.name}-${item.country}-${item.rank}`}
            className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
          >
            <div className="relative aspect-4/3 w-full bg-muted sm:aspect-3/2">
              <img
                src={item.imageUrl}
                alt={item.imageAlt}
                className="h-full w-full object-cover"
                loading="lazy"
                draggable={false}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 to-transparent"
                aria-hidden
              />
              <div className="absolute left-3 top-3 flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/25 bg-background/90 px-2.5 text-sm font-semibold tabular-nums text-foreground shadow-sm backdrop-blur-sm dark:bg-background/80">
                #{item.rank}
              </div>
            </div>
            <div className="px-4 py-3.5 sm:px-5 sm:py-4">
              <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                {item.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.country}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
