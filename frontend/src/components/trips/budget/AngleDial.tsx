"use client"

import { useId, type CSSProperties, type ReactNode } from 'react'
import { AngleSlider } from '@ark-ui/react/angle-slider'
import { cn } from '@/lib/utils'
import { DIAL_MAX_DEGREES, DIAL_MIN_DEGREES } from './constants'

interface AngleDialProps {
  value: number
  onValueChange: (value: number) => void
  size?: number
  thickness?: number
  gradientFrom?: string
  gradientTo?: string
  children: ReactNode
  disabled?: boolean
  className?: string
}

export function AngleDial({
  value,
  onValueChange,
  size = 200,
  thickness = 20,
  gradientFrom = '#3b82f6',
  gradientTo = '#9333ea',
  children,
  disabled = false,
  className,
}: AngleDialProps) {
  const gradientId = useId()
  const minDegrees = DIAL_MIN_DEGREES
  const maxDegrees = DIAL_MAX_DEGREES
  const clamp = (input: number) => Math.min(Math.max(input, minDegrees), maxDegrees)
  const clampedValue = clamp(value)
  const radius = size / 2 - thickness / 2
  const circumference = 2 * Math.PI * radius
  const progressRatio = (clampedValue - minDegrees) / (maxDegrees - minDegrees || 1)
  const offset = circumference * (1 - progressRatio)
  const innerInset = thickness + 12
  const gradientStyle = { '--start': gradientFrom, '--end': gradientTo } as CSSProperties

  return (
    <AngleSlider.Root
      value={clampedValue}
      onValueChange={({ value: nextValue }) => {
        onValueChange(clamp(nextValue))
      }}
      disabled={disabled}
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size, opacity: disabled ? 0.5 : 1 }}
    >
      <AngleSlider.Control className="absolute inset-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="[--gradient-start:var(--start)] [--gradient-end:var(--end)]"
          style={gradientStyle}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={thickness}
            stroke="rgba(148,163,184,0.35)"
            className="dark:stroke-slate-700"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={thickness}
            strokeLinecap="round"
            stroke={`url(#${gradientId})`}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          </defs>
        </svg>
        <AngleSlider.Thumb className="absolute top-0 right-0 bottom-0 left-[calc(50%-1.5px)] pointer-events-none flex h-full w-[3px] items-start">
          <span
            className="h-6 w-6 shrink-0 rounded-full border-2 border-white shadow-lg shadow-blue-500/25 dark:border-slate-900"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            }}
          />
        </AngleSlider.Thumb>
      </AngleSlider.Control>
      <div
        className="absolute rounded-full bg-background"
        style={{ inset: innerInset }}
        aria-hidden
      />
      <div className="relative flex flex-col items-center gap-2">{children}</div>
      <AngleSlider.HiddenInput />
    </AngleSlider.Root>
  )
}


