import { AnimatePresence } from 'framer-motion'
import { Loader2, Cloud, Calendar, Thermometer } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ForecastDay } from './types'
import { getForecastWeatherIcon } from './AnimatedIcons'

interface TripForecastPanelProps {
  loading: boolean
  error: string | null
  isTooFarAway: boolean
  isFinalTripDay: boolean
  forecast: ForecastDay[]
  animated: boolean
}

export function TripForecastPanel({
  loading,
  error,
  isTooFarAway,
  isFinalTripDay,
  forecast,
  animated,
}: TripForecastPanelProps) {
  return (
    <>
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-destructive mb-2">{error}</p>
            <p className="text-xs text-muted-foreground">
              Please try again later.
            </p>
          </div>
        ) : isTooFarAway ? (
          <div className="text-center py-8">
            <Cloud className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Forecast not available yet
            </p>
            <p className="text-xs text-muted-foreground">
              Weather forecasts are only available up to 5 days in advance.
              Check back closer to your trip date for accurate weather information.
            </p>
          </div>
        ) : isFinalTripDay ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              You're on the final day of this trip.
            </p>
            <p className="text-xs text-muted-foreground">
              Future-day forecasts wrap up once the journey ends, but you can keep checking the current conditions above.
            </p>
          </div>
        ) : forecast.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No forecast data available for the selected dates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {forecast.map((day) => (
              <div
                key={day.date}
                className={cn(
                  "flex flex-col items-center p-4 rounded-lg border bg-card",
                  "hover:shadow-md transition-shadow"
                )}
              >
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  {day.dateLabel}
                </div>
                <div className="mb-3 text-3xl">
                  {getForecastWeatherIcon(day.weatherType, day.icon.includes('d'), animated)}
                </div>
                <div className="text-center mb-2">
                  <div className="flex items-center gap-2 justify-center">
                    <Thermometer className="w-4 h-4 text-muted-foreground" />
                    <span className="text-lg font-bold text-foreground">
                      {Math.round(day.temperature.max)}°
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {Math.round(day.temperature.min)}°
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-center capitalize">
                  {day.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
      {forecast.length > 0 && !isFinalTripDay && !loading && !error && !isTooFarAway && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          Note: weather forecasts are not 100% accurate and should be used as a guide only.
        </p>
      )}
    </>
  )
}

