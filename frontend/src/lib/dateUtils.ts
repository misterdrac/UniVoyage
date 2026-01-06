type DateInput = string | number | Date

const toDate = (value: DateInput): Date => {
  if (value instanceof Date) {
    return new Date(value.getTime())
  }

  return new Date(value)
}

const normalizeForDiff = (value: DateInput): Date => {
  const date = toDate(value)
  date.setHours(0, 0, 0, 0)
  return date
}

/**
 * Formats date as short string (e.g., "Jan 15")
 */
export const formatDateShort = (
  value: DateInput,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
): string => {
  return toDate(value).toLocaleDateString(locale, options)
}

/**
 * Formats date as long string (e.g., "January 15, 2024")
 */
export const formatDateLong = (
  value: DateInput,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }
): string => {
  return toDate(value).toLocaleDateString(locale, options)
}

/**
 * Calculates duration in days between two dates (minimum 1 day)
 */
export const calculateDurationInDays = (start: DateInput, end: DateInput): number => {
  const normalizedStart = normalizeForDiff(start)
  const normalizedEnd = normalizeForDiff(end)

  const diffTime = Math.abs(normalizedEnd.getTime() - normalizedStart.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(diffDays, 1)
}


