import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, DollarSign, Sparkles, ArrowRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoginDialog, SignUpDialog } from '@/components/auth'
import type { QuizRecommendationResponse, RecommendedDestination } from '@/services/api/quizApi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTE_PATHS } from '@/config/routes'

interface QuizResultsProps {
  data: QuizRecommendationResponse
  onRetake: () => void
}

export function QuizResults({ data, onRetake }: QuizResultsProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [pendingDestination, setPendingDestination] = useState<RecommendedDestination | null>(null)

  useEffect(() => {
    if (user && pendingDestination && !isLoginOpen && !isSignUpOpen) {
      navigateToPlanner(pendingDestination)
      setPendingDestination(null)
    }
  }, [user, pendingDestination, isLoginOpen, isSignUpOpen])

  const handlePlanTrip = (rec: RecommendedDestination) => {
    if (!user) {
      setPendingDestination(rec)
      setIsLoginOpen(true)
      return
    }
    navigateToPlanner(rec)
  }

  const navigateToPlanner = (rec: RecommendedDestination) => {
    navigate(ROUTE_PATHS.PLAN_TRIP, {
      state: {
        destinationId: rec.destinationId,
        destinationName: rec.name,
        destinationLocation: rec.location,
        destinationImageUrl: rec.imageUrl,
      },
    })
  }

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
          <Sparkles className="w-4 h-4" />
          Your Personalized Results
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          {data.intro}
        </h2>
      </motion.div>

      <div className="grid gap-8">
        {data.recommendations.map((rec, index) => (
          <motion.div
            key={rec.destinationId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
          >
            <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr]">
                {rec.imageUrl ? (
                  <div className="relative h-56 md:h-full min-h-[220px] overflow-hidden">
                    <img
                      src={rec.imageUrl}
                      alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                        #{index + 1} Match
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-56 md:h-full min-h-[220px] bg-muted flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-muted-foreground/40" />
                  </div>
                )}

                <CardContent className="p-6 sm:p-8 flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                        {rec.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {rec.location}, {rec.continent}
                        </span>
                        {rec.budgetPerDay && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            ~${rec.budgetPerDay}/day
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      {rec.matchReason}
                    </p>

                    {rec.highlights.length > 0 && (
                      <ul className="space-y-2">
                        {rec.highlights.map((hl, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-foreground"
                          >
                            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            {hl}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <Button
                    onClick={() => handlePlanTrip(rec)}
                    className="w-full sm:w-auto self-start gap-2"
                    size="lg"
                  >
                    Plan This Trip
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center space-y-6"
      >
        <p className="text-muted-foreground text-lg italic">
          {data.closingNote}
        </p>
        <Button
          variant="outline"
          size="lg"
          onClick={onRetake}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Quiz
        </Button>
      </motion.div>

      <LoginDialog
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onSignUpClick={() => {
          setIsLoginOpen(false)
          setIsSignUpOpen(true)
        }}
      />

      <SignUpDialog
        open={isSignUpOpen}
        onOpenChange={setIsSignUpOpen}
        onLoginClick={() => {
          setIsSignUpOpen(false)
          setIsLoginOpen(true)
        }}
      />
    </div>
  )
}
