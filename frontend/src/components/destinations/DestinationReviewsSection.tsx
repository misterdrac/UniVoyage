import { useEffect, useState } from 'react'
import { Star, Loader2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiService } from '@/services/api'
import type { DestinationReview } from '@/types/trip'

interface DestinationReviewsSectionProps {
  destinationId: number
}

export function DestinationReviewsSection({ destinationId }: DestinationReviewsSectionProps) {
  const [reviews, setReviews] = useState<DestinationReview[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    const load = async () => {
      try {
        // Fetch all reviews at once (max 50)
        const result = await apiService.getDestinationReviews(destinationId, 0, 50)
        if (isMounted && result.success && result.reviews) {
          const content = result.reviews.content
          setReviews(content)
          setTotalElements(result.reviews.totalElements)
          // Start at a random index
          if (content.length > 0) {
            setCurrentIndex(Math.floor(Math.random() * content.length))
          }
        }
      } catch {
        // silently fail
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()
    return () => { isMounted = false }
  }, [destinationId])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-2">
        <Loader2 className="size-4 animate-spin" />
        <p className="text-sm">Loading reviews...</p>
      </div>
    )
  }

  if (reviews.length === 0) return null

  const review = reviews[currentIndex]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">
          Traveller Reviews ({totalElements})
        </h4>
      </div>

      <div className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`size-3 ${star <= review.stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{review.reviewerDisplayName}</span>
        </div>
        <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
      </div>

      {/* Navigation */}
      {reviews.length > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="cursor-pointer p-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Previous review"
          >
            <ChevronLeft className="size-4 text-muted-foreground" />
          </button>
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} / {reviews.length}
          </span>
          <button
            onClick={handleNext}
            className="cursor-pointer p-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Next review"
          >
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  )
}
