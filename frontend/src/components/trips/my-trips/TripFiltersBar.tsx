import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { TripFilters, TripStatusFilter } from '@/lib/tripFilters'
import type { TripSortOption } from '@/lib/tripSorting'

const STATUS_OPTIONS: Array<{ value: TripStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'planned', label: 'Planned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
]

const SORT_OPTIONS: Array<{ value: TripSortOption; label: string }> = [
  { value: 'start-soonest', label: 'Earliest' },
  { value: 'start-latest', label: 'Latest' },
]

interface TripFiltersBarProps {
  filters: TripFilters
  totalTrips: number
  visibleTrips: number
  hasActiveFilters: boolean
  onStatusChange: (status: TripStatusFilter) => void
  onSortChange: (sort: TripSortOption) => void
  onResetFilters: () => void
}

export function TripFiltersBar({
  filters,
  totalTrips,
  visibleTrips,
  hasActiveFilters,
  onStatusChange,
  onSortChange,
  onResetFilters,
}: TripFiltersBarProps) {
  return (
    <section className="mb-8 rounded-3xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>Filters</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            Showing{' '}
            <span className="font-semibold text-foreground">{visibleTrips}</span>
            {' '}
            of{' '}
            <span className="font-semibold text-foreground">{totalTrips}</span>
            {' '}
            trip{visibleTrips === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={filters.status === option.value ? 'secondary' : 'ghost'}
              onClick={() => onStatusChange(option.value)}
              className={cn(
                'rounded-full border px-3 py-2 text-sm transition',
                filters.status === option.value
                  ? 'border-primary/40 bg-primary/10 text-primary shadow-sm hover:bg-primary/20'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Select value={filters.sort} onValueChange={(value) => onSortChange(value as TripSortOption)}>
            <SelectTrigger className="w-[200px] rounded-full text-sm">
              <SelectValue placeholder="Sort trips" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
            className="gap-2 rounded-full text-muted-foreground transition hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </section>
  )
}

