import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import type { WeatherData } from './types'
import { weatherAnimations, getWeatherIcon } from './AnimatedIcons'

interface CurrentConditionsCardProps {
  weather: WeatherData
  animated: boolean
}

export function CurrentConditionsCard({ weather, animated }: CurrentConditionsCardProps) {
  return (
    <motion.div
      key="weather"
      variants={animated ? weatherAnimations.container : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "show" : undefined}
      exit={{ opacity: 0 }}
      aria-label={`Current weather in ${weather.city}`}
    >
      <div className="flex items-center mb-2">
        <div className="text-3xl">
          {getWeatherIcon(weather.weatherType, weather.isDay, animated)}
        </div>
      </div>
      <div className="space-y-1">
        <motion.div
          variants={weatherAnimations.item}
          className="text-4xl font-extralight"
          initial={animated ? { scale: 0.9, opacity: 0 } : undefined}
          animate={animated ? { scale: 1, opacity: 1 } : undefined}
          transition={{ type: "spring" as const, damping: 10 }}
          aria-label={`Temperature: ${weather.temperature} degrees celsius`}
        >
          {weather.temperature}
          <span className="text-2xl">°</span>
        </motion.div>
        <motion.div
          variants={weatherAnimations.item}
          className="flex items-center text-xs text-muted-foreground"
        >
          <MapPin size={12} className="mr-1" aria-hidden="true" />
          <span>{weather.city}</span>
        </motion.div>
        <motion.div
          variants={weatherAnimations.item}
          className="text-xs text-muted-foreground"
        >
          {weather.dateTime}
        </motion.div>
      </div>
    </motion.div>
  )
}

