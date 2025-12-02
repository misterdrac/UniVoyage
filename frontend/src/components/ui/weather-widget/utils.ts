import type { ForecastApiResponse, ForecastDay, WeatherType } from './types'

const DAY_IN_MS = 24 * 60 * 60 * 1000

export const mapWeatherType = (condition: string): WeatherType => {
  const main = condition.toLowerCase()
  if (main.includes('clear')) return 'clear'
  if (main.includes('cloud')) return 'clouds'
  if (main.includes('rain') || main.includes('drizzle')) return 'rain'
  if (main.includes('snow')) return 'snow'
  if (main.includes('thunder')) return 'thunderstorm'
  if (main.includes('mist') || main.includes('fog') || main.includes('haze')) return 'mist'
  return 'unknown'
}

export const formatISODateInTimezone = (timestampMs: number, offsetMs: number): string => {
  const adjusted = new Date(timestampMs + offsetMs)
  const year = adjusted.getUTCFullYear()
  const month = String(adjusted.getUTCMonth() + 1).padStart(2, '0')
  const day = String(adjusted.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDateLabelInTimezone = (timestampMs: number, offsetMs: number): string => {
  const adjusted = new Date(timestampMs + offsetMs)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(adjusted)
}

export const getTimezoneDayNumber = (timestampMs: number, offsetMs: number): number =>
  Math.floor((timestampMs + offsetMs) / DAY_IN_MS)

export const parseTripDateToDayNumber = (dateString: string, offsetMs: number): number => {
  const [year, month, day] = dateString.split('-').map(Number)
  const localMidnightUtc = Date.UTC(year, month - 1, day) - offsetMs
  return getTimezoneDayNumber(localMidnightUtc, offsetMs)
}

export const getDayStartTimestamp = (dayNumber: number, offsetMs: number): number => {
  const dayStartLocalMs = dayNumber * DAY_IN_MS
  return dayStartLocalMs - offsetMs
}

export const formatDateTimeForTimezone = (timezoneSeconds?: number): string => {
  const formatOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }

  if (typeof timezoneSeconds !== 'number') {
    return new Intl.DateTimeFormat('en-US', formatOptions).format(new Date())
  }

  const targetDate = new Date(Date.now() + timezoneSeconds * 1000)
  return new Intl.DateTimeFormat('en-US', {
    ...formatOptions,
    timeZone: 'UTC',
  }).format(targetDate)
}

export const normalizeLocalDate = (date: Date) => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

export const isFinalTripDayForToday = (returnDate?: string, timezoneOffsetSeconds?: number): boolean => {
  if (!returnDate) return false

  if (typeof timezoneOffsetSeconds !== 'number') {
    const today = normalizeLocalDate(new Date())
    const target = normalizeLocalDate(new Date(returnDate))

    if (Number.isNaN(target.getTime())) {
      return false
    }

    return today.getTime() === target.getTime()
  }

  const offsetMs = timezoneOffsetSeconds * 1000
  const todayDayNumber = getTimezoneDayNumber(Date.now(), offsetMs)
  const returnDayNumber = parseTripDateToDayNumber(returnDate, offsetMs)
  return todayDayNumber === returnDayNumber
}

export const groupForecastByDay = (
  forecastList: ForecastApiResponse['list'],
  departureDate: string,
  isOngoing: boolean,
  timezoneOffsetSeconds: number = 0,
  returnDate?: string
): ForecastDay[] => {
  const offsetMs = timezoneOffsetSeconds * 1000
  const todayDayNumber = getTimezoneDayNumber(Date.now(), offsetMs)
  const departureDayNumber = parseTripDateToDayNumber(departureDate, offsetMs)
  const startDayNumber = isOngoing ? todayDayNumber : departureDayNumber
  const daysToFetch = isOngoing ? 4 : 3
  const defaultEndDayNumber = startDayNumber + daysToFetch - 1
  const returnDayNumber = returnDate ? parseTripDateToDayNumber(returnDate, offsetMs) : null
  const endDayNumber = returnDayNumber !== null
    ? Math.min(defaultEndDayNumber, returnDayNumber)
    : defaultEndDayNumber

  const days: Map<string, ForecastDay> = new Map()

  forecastList.forEach((item) => {
    const itemDayNumber = getTimezoneDayNumber(item.dt * 1000, offsetMs)

    if (itemDayNumber < startDayNumber || itemDayNumber > endDayNumber) {
      return
    }

    if (isOngoing && itemDayNumber === todayDayNumber) {
      return
    }

    const dayStartTimestamp = getDayStartTimestamp(itemDayNumber, offsetMs)
    const dateKey = formatISODateInTimezone(dayStartTimestamp, offsetMs)

    if (!days.has(dateKey)) {
      days.set(dateKey, {
        date: dateKey,
        dateLabel: formatDateLabelInTimezone(dayStartTimestamp, offsetMs),
        temperature: {
          min: item.main.temp_min,
          max: item.main.temp_max,
        },
        weatherType: mapWeatherType(item.weather[0].main),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      })
    } else {
      const existing = days.get(dateKey)!
      existing.temperature.min = Math.min(existing.temperature.min, item.main.temp_min)
      existing.temperature.max = Math.max(existing.temperature.max, item.main.temp_max)
    }
  })

  const sortedDays = Array.from(days.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  )

  return sortedDays.slice(0, 3)
}

