import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Compass, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuizProgress, QuizQuestion, QuizResults } from '@/components/quiz'
import type { QuizOption } from '@/components/quiz'
import { apiService } from '@/services/api'
import type { QuizRecommendationResponse } from '@/services/api/quizApi'

interface QuizStep {
  key: string
  question: string
  subtitle: string
  options: QuizOption[]
}

const QUIZ_STEPS: QuizStep[] = [
  {
    key: 'budget',
    question: "What's your daily budget?",
    subtitle: 'How much are you comfortable spending per day?',
    options: [
      { value: 'low', label: 'Budget-Friendly', icon: '💰', description: 'Under $30/day' },
      { value: 'medium', label: 'Moderate', icon: '💵', description: '$30 - $60/day' },
      { value: 'high', label: 'Comfortable', icon: '💎', description: '$60+/day' },
    ],
  },
  {
    key: 'climate',
    question: 'What climate do you prefer?',
    subtitle: 'Pick the weather vibe that suits you best',
    options: [
      { value: 'tropical', label: 'Tropical & Warm', icon: '☀️', description: 'Sun, beaches, and heat' },
      { value: 'temperate', label: 'Temperate & Mild', icon: '🌤️', description: 'Pleasant and moderate' },
      { value: 'cold', label: 'Cold & Winter', icon: '❄️', description: 'Snow, mountains, cozy vibes' },
      { value: 'any', label: 'No Preference', icon: '🌍', description: "I'm flexible!" },
    ],
  },
  {
    key: 'activityType',
    question: 'What type of activities do you enjoy?',
    subtitle: 'Choose what excites you the most',
    options: [
      { value: 'culture', label: 'Culture & History', icon: '🏛️', description: 'Museums, monuments, heritage' },
      { value: 'adventure', label: 'Adventure & Nature', icon: '🏔️', description: 'Hiking, wildlife, outdoors' },
      { value: 'beach', label: 'Beach & Relaxation', icon: '🏖️', description: 'Coastal vibes and chill' },
      { value: 'food', label: 'Food & Nightlife', icon: '🍜', description: 'Culinary tours and going out' },
      { value: 'mix', label: 'Mix of Everything', icon: '✨', description: 'A bit of everything!' },
    ],
  },
  {
    key: 'continent',
    question: 'Which continent interests you?',
    subtitle: 'Where in the world do you want to go?',
    options: [
      { value: 'Europe', label: 'Europe', icon: '🏰' },
      { value: 'Asia', label: 'Asia', icon: '⛩️' },
      { value: 'North America', label: 'North America', icon: '🗽' },
      { value: 'South America', label: 'South America', icon: '🌎' },
      { value: 'Africa', label: 'Africa', icon: '🦁' },
      { value: 'Oceania', label: 'Oceania', icon: '🐨' },
      { value: 'any', label: 'No Preference', icon: '🌐', description: 'Surprise me!' },
    ],
  },
  {
    key: 'travelStyle',
    question: 'What is your travel style?',
    subtitle: 'How do you like to experience a destination?',
    options: [
      { value: 'solo', label: 'Solo Explorer', icon: '🎒', description: 'Independent and self-guided' },
      { value: 'backpacker', label: 'Backpacker', icon: '🗺️', description: 'Budget travel, hostels, trains' },
      { value: 'luxury', label: 'Luxury', icon: '👑', description: 'Comfort and premium experiences' },
      { value: 'group', label: 'Group / Social', icon: '👥', description: 'Meet people, group tours' },
      { value: 'cultural', label: 'Cultural Immersion', icon: '🎭', description: 'Live like a local' },
    ],
  },
]

type QuizAnswers = Record<string, string>

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [direction, setDirection] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<QuizRecommendationResponse | null>(null)

  const step = QUIZ_STEPS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === QUIZ_STEPS.length - 1
  const currentAnswer = answers[step.key] ?? null

  const handleSelect = useCallback(
    (value: string) => {
      setAnswers((prev) => ({ ...prev, [step.key]: value }))
    },
    [step.key]
  )

  const goNext = useCallback(() => {
    if (!currentAnswer) return
    setDirection(1)
    if (isLastStep) {
      submitQuiz()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentAnswer, isLastStep])

  const goBack = useCallback(() => {
    setDirection(-1)
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }, [])

  const submitQuiz = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiService.getQuizRecommendation({
        budget: answers.budget,
        climate: answers.climate,
        activityType: answers.activityType,
        continent: answers.continent,
        travelStyle: answers.travelStyle,
      })

      if (response.success && response.data) {
        setResults(response.data)
      } else {
        setError(response.error || 'Failed to get recommendations. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetake = useCallback(() => {
    setResults(null)
    setAnswers({})
    setCurrentStep(0)
    setDirection(1)
    setError(null)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-16 px-4 sm:px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative inline-flex">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Finding your perfect destinations...
            </h2>
            <p className="text-muted-foreground text-lg">
              Our AI is analyzing your preferences
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (results) {
    return (
      <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <QuizResults data={results} onRetake={handleRetake} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Compass className="w-4 h-4" />
            Destination Quiz
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Find Your Dream Destination
          </h1>
          <p className="text-muted-foreground text-lg">
            Answer 5 quick questions and get personalized recommendations
          </p>
        </motion.div>

        <div className="mb-8">
          <QuizProgress currentStep={currentStep} totalSteps={QUIZ_STEPS.length} />
        </div>

        <div className="relative overflow-hidden min-h-[380px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <QuizQuestion
                question={step.question}
                subtitle={step.subtitle}
                options={step.options}
                selectedValue={currentAnswer}
                onSelect={handleSelect}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 rounded-xl bg-destructive/10 text-destructive text-center text-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={isFirstStep}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            onClick={goNext}
            disabled={!currentAnswer}
            className="gap-2"
            size="lg"
          >
            {isLastStep ? (
              <>
                Get Recommendations
                <Compass className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
