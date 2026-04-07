import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export interface QuizOption {
  value: string
  label: string
  icon: string
  description?: string
}

interface QuizQuestionProps {
  question: string
  subtitle?: string
  options: QuizOption[]
  selectedValue: string | null
  onSelect: (value: string) => void
  columns?: 3 | 4
}

export function QuizQuestion({
  question,
  subtitle,
  options,
  selectedValue,
  onSelect,
  columns = 3,
}: QuizQuestionProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          {question}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground text-base sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {options.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            onClick={() => onSelect(option.value)}
            className={cn(
              'group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-center w-full sm:w-[calc(50%-0.5rem)]',
              columns === 4
                ? 'lg:w-[calc(25%-0.75rem)]'
                : 'lg:w-[calc(33.333%-0.75rem)]',
              selectedValue === option.value
                ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                : 'border-border bg-card hover:border-primary/40 hover:bg-accent/50 hover:shadow-sm'
            )}
          >
            <span className="text-3xl sm:text-4xl">{option.icon}</span>
            <span
              className={cn(
                'font-semibold text-base sm:text-lg transition-colors',
                selectedValue === option.value
                  ? 'text-primary'
                  : 'text-foreground group-hover:text-primary'
              )}
            >
              {option.label}
            </span>
            {option.description && (
              <span className="text-sm text-muted-foreground leading-snug">
                {option.description}
              </span>
            )}
            {selectedValue === option.value && (
              <motion.div
                layoutId="quiz-check"
                className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <svg
                  className="w-3.5 h-3.5 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
