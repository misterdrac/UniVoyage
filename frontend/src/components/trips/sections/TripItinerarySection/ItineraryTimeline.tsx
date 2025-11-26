import { Card, CardContent } from '@/components/ui/card'
import { CalendarDays, Clock, ClipboardCheck, Sparkles } from 'lucide-react'
import type { NormalizedItinerary, NormalizedItinerarySegment } from './types'

interface ItineraryTimelineProps {
  itinerary: NormalizedItinerary
  locationLabel: string
  durationInDays: number
}

const TimelineDot = () => (
  <div className="flex h-full flex-col items-center">
    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background shadow-sm">
      <span className="block h-2 w-2 rounded-full bg-primary" />
    </div>
    <div className="mt-2 w-px flex-1 bg-linear-to-b from-primary/70 via-primary/20 to-transparent" />
  </div>
)

const SegmentsGrid = ({ segments }: { segments: NormalizedItinerarySegment[] }) => {
  if (!segments.length) return null
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      {segments.map((segment, idx) => (
        <div key={`${segment.time}-${idx}`} className="rounded-xl border bg-card/80 p-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            {segment.time}
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{segment.activity}</p>
          {segment.details && <p className="mt-1 text-sm text-muted-foreground">{segment.details}</p>}
        </div>
      ))}
    </div>
  )
}

export function ItineraryTimeline({ itinerary, locationLabel, durationInDays }: ItineraryTimelineProps) {
  return (
    <div className="space-y-8">
      {(itinerary.intro || itinerary.days.length === 0) && (
        <Card className="border border-primary/20 bg-linear-to-r from-primary/5 via-background to-card shadow-sm">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">{itinerary.intro || 'Live trip insights'}</p>
                <p className="text-sm text-muted-foreground">
                  {locationLabel} • {durationInDays} {durationInDays === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              {itinerary.days[0]?.dateLabel ?? ''}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-10">
        {itinerary.days.map((day, idx) => (
          <div key={`itinerary-day-${day.dayNumber}-${day.title}`} className="grid grid-cols-[32px_1fr] gap-6">
            <TimelineDot />
            <div className="rounded-2xl border bg-linear-to-br from-background via-card to-background p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Day {day.dayNumber} • {day.dateLabel}
                  </p>
                  <h4 className="text-lg font-semibold text-foreground">{day.title}</h4>
                </div>
                {day.vibe && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {day.vibe}
                  </span>
                )}
              </div>
              {day.summary && <p className="mt-2 text-sm text-muted-foreground">{day.summary}</p>}
              <SegmentsGrid segments={day.segments} />

              {(day.dining.length > 0 || day.tips.length > 0) && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {day.dining.length > 0 && (
                    <div className="rounded-xl border border-dashed bg-muted/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Local bites & sips
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {day.dining.map((item, diningIdx) => (
                          <li key={`${item}-${diningIdx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {day.tips.length > 0 && (
                    <div className="rounded-xl border border-dashed bg-muted/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Smart reminders
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {day.tips.map((tip, tipIdx) => (
                          <li key={`${tip}-${tipIdx}`}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {itinerary.logistics.length > 0 && (
        <div className="grid grid-cols-[32px_1fr] gap-6">
          <div className="flex h-full flex-col items-center">
            <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background shadow-sm">
              <ClipboardCheck className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 w-px flex-1 bg-linear-to-b from-primary/70 via-primary/20 to-transparent" />
          </div>
          <Card className="border border-dashed">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                On-the-ground notes
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {itinerary.logistics.map((item, idx) => (
                  <div key={`${item.title}-${idx}`} className="rounded-xl border bg-muted/30 p-4">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {itinerary.closingNote && (
        <Card className="border-0 bg-card/80 text-center shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{itinerary.closingNote}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


