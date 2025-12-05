import { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import type { DateRange } from 'react-day-picker'

interface DateRangePickerProps {
  value?: DateRange | undefined
  onChange?: (range: DateRange | undefined) => void
  disabled?: (date: Date) => boolean
}

export const DateRangePicker = ({ value, onChange, disabled }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [tempRange, setTempRange] = useState<DateRange | undefined>(value)
  const [isMobile, setIsMobile] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1100 || window.innerHeight < 800)  
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Update tempRange when value changes externally
  useEffect(() => {
    setTempRange(value)
  }, [value])

  // Close calendar when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Calculate scrollbar dimensions
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      const scrollbarHeight = window.innerHeight - document.documentElement.clientHeight
      
      // Don't close if clicking on scrollbar
      const verticalScrollbarArea = scrollbarWidth > 0 ? scrollbarWidth : 17
      const horizontalScrollbarArea = scrollbarHeight > 0 ? scrollbarHeight : 17
      
      if (
        event.clientX >= window.innerWidth - verticalScrollbarArea - 5 ||
        event.clientY >= window.innerHeight - horizontalScrollbarArea - 5
      ) {
        return
      }
      
      if (pickerRef.current && !pickerRef.current.contains(target)) {
        setIsOpen(false)
        setTempRange(value)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, value])

  const formatDateRange = () => {
    if (!value?.from) return null
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    
    if (value.to) {
      return `${formatDate(value.from)} - ${formatDate(value.to)}`
    }
    return formatDate(value.from)
  }

  const handleApply = () => {
    onChange?.(tempRange)
    setIsOpen(false)
  }

  const handleClear = () => {
    setTempRange(undefined)
    onChange?.(undefined)
  }

  const handleDateSelect = (range: DateRange | undefined) => {
    setTempRange(range)
    // Auto-apply when both dates are selected, but keep calendar open
    if (range?.from && range?.to) {
      onChange?.(range)
    }
  }

  // Helper: Get today at midnight
  const getToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }

  // Helper: Get date 1 year from now
  const getOneYearFromNow = () => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    return date
  }

  // Disable dates based on custom rules
  const isDateDisabled = (date: Date) => {
    // First apply the custom disabled function if provided
    if (disabled && disabled(date)) {
      return true
    }

    // Normalize date to start of day for accurate comparison
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    const today = getToday()
    
    // Disable dates in the past
    if (compareDate < today) {
      return true
    }

    // Disable dates more than 1 year in the future
    const oneYearFromNow = getOneYearFromNow()
    if (compareDate > oneYearFromNow) {
      return true
    }

    // Disable dates more than 30 days after start date
    if (tempRange?.from) {
      const maxDate = new Date(tempRange.from)
      maxDate.setDate(maxDate.getDate() + 30)
      if (compareDate > maxDate) {
        return true
      }
    }

    return false
  }

  return (
    <div className="relative w-full" ref={pickerRef}>
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          value={formatDateRange() || ''}
          placeholder="Pick your travel dates"
          className="pl-10 cursor-pointer"
        />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 z-100 mt-3 bg-background rounded-2xl shadow-2xl">
          <div className="px-3 sm:px-6 pt-6 pb-3">
            <Calendar
              mode="range"
              defaultMonth={tempRange?.from || new Date()}
              selected={tempRange}
              onSelect={handleDateSelect}
              numberOfMonths={isMobile ? 1 : 2}
              disabled={isDateDisabled}
              startMonth={getToday()}
              endMonth={getOneYearFromNow()}
              className="rounded-2xl p-0"
            />
          </div>
          <div className="px-3 sm:px-6 pb-6 space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              A trip can last for a maximum of 1 month and must be less than a year away
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                disabled={!tempRange?.from}
                className="px-8 h-11 text-base"
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={handleApply}
                disabled={!tempRange?.from || !tempRange?.to}
                className="px-8 h-11 text-base bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

