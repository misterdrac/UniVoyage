import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Cloud, CloudRain, Snowflake, Sun, Moon, CloudLightning, CloudFog as CloudMist, Thermometer } from 'lucide-react'
import type { WeatherType } from './types'

export const weatherAnimations = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 15,
      },
    },
  },
  rotate: {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 20,
        ease: "linear" as const,
      },
    },
  },
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut" as const,
      },
    },
  },
  rain: {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: [0, 1, 0],
      y: [0, 20],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear" as const,
      },
    },
  },
  snow: (i: number) => ({
    initial: { opacity: 0, y: -5 },
    animate: {
      opacity: [0, 1, 0],
      y: [0, 15],
      x: [0, (i % 2 === 0 ? 5 : -5), 0],
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: "easeInOut" as const,
        delay: i * 0.2,
      },
    },
  }),
  lightning: {
    initial: { opacity: 0 },
    animate: {
      opacity: [0, 1, 0.5, 1, 0],
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: "easeInOut" as const,
        times: [0, 0.1, 0.2, 0.21, 0.3],
        repeatDelay: 1.5,
      },
    },
  },
  mist: {
    initial: { opacity: 0.3, x: -20 },
    animate: {
      opacity: [0.3, 0.6, 0.3],
      x: [-20, 20, -20],
      transition: {
        repeat: Infinity,
        duration: 8,
        ease: "easeInOut" as const,
      },
    },
  },
}

const AnimatedWeatherIcons = {
  clear: ({ isDay }: { isDay: boolean }) => (
    <motion.div variants={weatherAnimations.item} className="relative">
      {isDay ? (
        <motion.div
          animate={weatherAnimations.rotate.animate}
          className="text-primary"
          aria-label="Clear day"
        >
          <Sun className="h-8 w-8 text-amber-400 dark:text-amber-300" />
          <motion.div
            className="absolute inset-0"
            animate={weatherAnimations.pulse.animate}
          >
            <Sun className="h-8 w-8 text-amber-400 dark:text-amber-300" />
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          animate={weatherAnimations.pulse.animate}
          className="text-primary-foreground"
          aria-label="Clear night"
        >
          <Moon className="h-8 w-8 text-slate-300 dark:text-slate-200" />
        </motion.div>
      )}
    </motion.div>
  ),
  clouds: () => (
    <motion.div
      variants={weatherAnimations.item}
      className="relative"
      aria-label="Cloudy weather"
    >
      <Cloud className="h-8 w-8 text-slate-500 dark:text-slate-300" />
      <motion.div
        className="absolute -left-3 top-1"
        animate={{
          x: [0, 3, 0],
          transition: { repeat: Infinity, duration: 4, ease: "easeInOut" as const },
        }}
      >
        <Cloud className="h-6 w-6 text-slate-400/70 dark:text-slate-400/80" />
      </motion.div>
    </motion.div>
  ),
  rain: () => (
    <motion.div
      variants={weatherAnimations.item}
      className="relative"
      aria-label="Rainy weather"
    >
      <CloudRain className="h-8 w-8 text-blue-400 dark:text-blue-300" />
      <div className="absolute bottom-0 left-1 right-1 h-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 bg-blue-400 dark:bg-blue-300 w-[2px] h-[7px] rounded-full opacity-0"
            style={{ left: `${25 + i * 20}%` }}
            variants={weatherAnimations.rain}
            animate="animate"
            initial="initial"
            custom={i}
          />
        ))}
      </div>
    </motion.div>
  ),
  snow: () => (
    <motion.div
      variants={weatherAnimations.item}
      className="relative"
      aria-label="Snowy weather"
    >
      <Snowflake className="h-8 w-8 text-blue-300 dark:text-blue-200" />
      <div className="absolute bottom-0 left-0 right-0 h-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 bg-blue-300 dark:bg-blue-200 w-[3px] h-[3px] rounded-full opacity-0"
            style={{ left: `${25 + i * 20}%` }}
            variants={weatherAnimations.snow(i)}
            animate="animate"
            initial="initial"
            custom={i}
          />
        ))}
      </div>
    </motion.div>
  ),
  thunderstorm: () => (
    <motion.div
      variants={weatherAnimations.item}
      className="relative"
      aria-label="Thunderstorm weather"
    >
      <CloudLightning className="h-8 w-8 text-amber-400 dark:text-amber-300" />
      <motion.div
        className="absolute inset-0"
        variants={weatherAnimations.lightning}
        animate="animate"
        initial="initial"
      >
        <CloudLightning className="h-8 w-8 text-amber-300 dark:text-amber-200" />
      </motion.div>
    </motion.div>
  ),
  mist: () => (
    <motion.div
      variants={weatherAnimations.item}
      className="relative"
      aria-label="Misty weather"
    >
      <CloudMist className="h-8 w-8 text-slate-400 dark:text-slate-300" />
      <motion.div
        className="absolute inset-0 opacity-30"
        variants={weatherAnimations.mist}
        animate="animate"
        initial="initial"
      >
        <CloudMist className="h-8 w-8 text-slate-400 dark:text-slate-300" />
      </motion.div>
    </motion.div>
  ),
  unknown: () => (
    <motion.div variants={weatherAnimations.item} aria-label="Unknown weather condition">
      <Thermometer className="h-8 w-8 text-slate-500 dark:text-slate-300" />
    </motion.div>
  ),
}

export const getForecastWeatherIcon = (weatherType: WeatherType, isDay: boolean = true, animated: boolean = true) => {
  if (animated) {
    const IconComponent = AnimatedWeatherIcons[weatherType]
    return <IconComponent isDay={isDay} />
  }

  const iconClass = "w-8 h-8"
  switch (weatherType) {
    case 'clear':
      return isDay
        ? <Sun className={cn(iconClass, "text-amber-400 dark:text-amber-300")} />
        : <Moon className={cn(iconClass, "text-slate-300 dark:text-slate-200")} />
    case 'clouds':
      return <Cloud className={cn(iconClass, "text-slate-500 dark:text-slate-300")} />
    case 'rain':
      return <CloudRain className={cn(iconClass, "text-blue-400 dark:text-blue-300")} />
    case 'snow':
      return <Snowflake className={cn(iconClass, "text-blue-300 dark:text-blue-200")} />
    case 'thunderstorm':
      return <CloudLightning className={cn(iconClass, "text-amber-400 dark:text-amber-300")} />
    case 'mist':
      return <CloudMist className={cn(iconClass, "text-slate-400 dark:text-slate-300")} />
    default:
      return <Cloud className={cn(iconClass, "text-slate-500 dark:text-slate-300")} />
  }
}

export const getWeatherIcon = (type: WeatherType, isDay: boolean, animated: boolean) => {
  if (animated) {
    const IconComponent = AnimatedWeatherIcons[type]
    return <IconComponent isDay={isDay} />
  }

  switch (type) {
    case 'clear':
      return isDay
        ? <Sun className="h-8 w-8 text-amber-400 dark:text-amber-300" aria-label="Clear day" />
        : <Moon className="h-8 w-8 text-slate-300 dark:text-slate-200" aria-label="Clear night" />
    case 'clouds':
      return <Cloud className="h-8 w-8 text-slate-500 dark:text-slate-300" aria-label="Cloudy weather" />
    case 'rain':
      return <CloudRain className="h-8 w-8 text-blue-400 dark:text-blue-300" aria-label="Rainy weather" />
    case 'snow':
      return <Snowflake className="h-8 w-8 text-blue-300 dark:text-blue-200" aria-label="Snowy weather" />
    case 'thunderstorm':
      return <CloudLightning className="h-8 w-8 text-amber-400 dark:text-amber-300" aria-label="Thunderstorm weather" />
    case 'mist':
      return <CloudMist className="h-8 w-8 text-slate-400 dark:text-slate-300" aria-label="Misty weather" />
    default:
      return <Thermometer className="h-8 w-8 text-slate-500 dark:text-slate-300" aria-label="Unknown weather condition" />
  }
}

