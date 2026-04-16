import { useEffect, useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiService } from '@/services/api'
import type { TripRating } from '@/types/trip'

interface TripRatingSectionProps {
  tripId: number
  destinationName: string
}

const MAX_COMMENT_LENGTH = 280

export function TripRatingSection({ tripId, destinationName }: TripRatingSectionProps) {
  const [rating, setRating] = useState<TripRating | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)
  const [selectedStar, setSelectedStar] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Load existing rating on mount
  useEffect(() => {
    let isMounted = true

    const loadRating = async () => {
      try {
        const result = await apiService.getTripRating(tripId)
        if (isMounted) {
          setRating(result.rating ?? null)
          if (result.rating) {
            setSelectedStar(result.rating.stars)
            setComment(result.rating.comment ?? '')
          }
        }
      } catch {
        // No rating yet — that's fine
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadRating()
    return () => { isMounted = false }
  }, [tripId])

  const handleSubmit = async () => {
    if (!selectedStar) return
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await apiService.submitTripRating(tripId, selectedStar, comment.trim() || undefined)
      if (result.success && result.rating) {
        setRating(result.rating)
        setIsEditing(false)
      } else {
        setError(result.error ?? 'Failed to submit rating')
      }
    } catch {
      setError('Failed to submit rating. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setSelectedStar(rating?.stars ?? null)
    setComment(rating?.comment ?? '')
    setError(null)
  }

  const displayStars = hoveredStar ?? selectedStar ?? 0

  if (isLoading) {
    return (
      <Card className="p-5 rounded-xl border bg-card">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <p className="text-sm">Loading your rating...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <Star className="size-5 text-primary" />
        <p className="text-sm text-muted-foreground">Your Rating</p>
      </div>

      {/* Already rated and not editing */}
      {rating && !isEditing ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            You rated your trip to {destinationName}:
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`size-6 ${star <= rating.stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
              />
            ))}
            <span className="ml-2 text-sm font-semibold text-foreground">{rating.stars}/5</span>
          </div>

          {/* Comment */}
          {rating.comment && (
            <p className="text-sm text-muted-foreground italic break-words">"{rating.comment}"</p>
          )}

          <Button variant="outline" size="sm" onClick={handleEdit}>
            Update rating
          </Button>
        </div>
      ) : (
        /* No rating yet or editing — show form */
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            How was your trip to {destinationName}?
          </p>

          {/* Star picker */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedStar(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                className="cursor-pointer transition-transform hover:scale-110"
                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              >
                <Star
                  className={`size-7 transition-colors ${
                    star <= displayStars
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Optional comment */}
          <div className="space-y-1">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
              placeholder="Share your experience (optional)..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/{MAX_COMMENT_LENGTH}
            </p>
            {comment.trim().length > 0 && (
              <p className="text-xs text-muted-foreground">
                Reviews with comments are subject to moderation before being published.
              </p>
            )}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={!selectedStar || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </Button>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
