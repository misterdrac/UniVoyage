import { useState, useEffect, useCallback } from 'react'
import { Calendar } from '@/components/ui/calendar'
import type { DateRange } from 'react-day-picker'

interface TravelDatesStepProps {
  departureDate: string
  returnDate: string
  onChange: (dates: { departureDate: string; returnDate: string }) => void
}

function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseLocalDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function TravelDatesStep({ departureDate, returnDate, onChange }: TravelDatesStepProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = parseLocalDate(departureDate)
    const to = parseLocalDate(returnDate)
    if (from) return { from, to }
    return undefined
  })

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const getToday = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }, [])

  const getOneYearFromNow = useCallback(() => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    return date
  }, [])

  const isDateDisabled = useCallback((date: Date) => {
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    const today = getToday()

    if (compareDate < today) return true
    if (compareDate > getOneYearFromNow()) return true

    if (dateRange?.from) {
      const maxDate = new Date(dateRange.from)
      maxDate.setDate(maxDate.getDate() + 30)
      if (compareDate > maxDate) return true
    }

    return false
  }, [dateRange?.from, getToday, getOneYearFromNow])

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    onChange({
      departureDate: range?.from ? formatDateLocal(range.from) : '',
      returnDate: range?.to ? formatDateLocal(range.to) : '',
    })
  }

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '—'
    const date = parseLocalDate(dateStr)
    if (!date) return '—'
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          When are you traveling?
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Select your departure and return dates. Trips can be up to 30 days long and must start within the next year.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from || new Date()}
          selected={dateRange}
          onSelect={handleDateSelect}
          numberOfMonths={isMobile ? 1 : 2}
          disabled={isDateDisabled}
          startMonth={getToday()}
          endMonth={getOneYearFromNow()}
          className="rounded-2xl p-0"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Departure:</span>
          <span className="font-medium text-foreground">
            {formatDisplayDate(departureDate)}
          </span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Return:</span>
          <span className="font-medium text-foreground">
            {formatDisplayDate(returnDate)}
          </span>
        </div>
      </div>
    </div>
  )
}
