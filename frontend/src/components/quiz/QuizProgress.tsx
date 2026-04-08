import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface QuizProgressProps {
  currentStep: number
  totalSteps: number
}

export function QuizProgress({ currentStep, totalSteps }: QuizProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground font-medium">
          Question {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>
      <div className="flex justify-between gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i <= currentStep ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  )
}
