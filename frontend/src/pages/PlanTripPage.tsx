import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Loader2, ArrowLeft, ArrowRight, CalendarDays, Wallet, Hotel, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Stepper, Step, useStepper } from '@/components/ui/stepper'
import { TravelDatesStep } from '@/components/trips/create/TravelDatesStep'
import { BudgetStep } from '@/components/trips/create/BudgetStep'
import { AccommodationStep } from '@/components/trips/create/AccommodationStep'
import { useTrips } from '@/contexts/TripContext'
import { apiService } from '@/services/api'
import { ROUTE_PATHS } from '@/config/routes'
import type { BudgetCategoryValue, TripBudgetPayload } from '@/types/budget'

interface DestinationState {
  destinationId: number
  destinationName: string
  destinationLocation: string
}

interface TripFormState {
  departureDate: string
  returnDate: string
  totalBudget: string
  accommodationName: string
  accommodationAddress: string
  accommodationPhone: string
}

const INITIAL_FORM_STATE: TripFormState = {
  departureDate: '',
  returnDate: '',
  totalBudget: '',
  accommodationName: '',
  accommodationAddress: '',
  accommodationPhone: '',
}

const STEPS = [
  { label: 'Travel Dates', description: 'When are you going?', icon: CalendarDays },
  { label: 'Budget', description: 'Set your spending limit', icon: Wallet },
  { label: 'Accommodation', description: 'Where are you staying?', icon: Hotel },
]

function createEmptyAllocations(): Record<BudgetCategoryValue, number> {
  return {
    accommodation: 0,
    transportation: 0,
    food: 0,
    activities: 0,
    shopping: 0,
    misc: 0,
  }
}

function StepperContent({
  form,
  destination,
  onFormChange,
}: {
  form: TripFormState
  destination: DestinationState
  onFormChange: (updates: Partial<TripFormState>) => void
}) {
  const { activeStep, nextStep, prevStep, isLastStep, isDisabledStep } = useStepper()
  const { createTrip } = useTrips()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canProceed = useMemo(() => {
    switch (activeStep) {
      case 0:
        return !!form.departureDate && !!form.returnDate
      case 1:
        return !!form.totalBudget && parseFloat(form.totalBudget) > 0
      case 2:
        return true
      default:
        return false
    }
  }, [activeStep, form.departureDate, form.returnDate, form.totalBudget])

  const handleNext = useCallback(() => {
    if (!canProceed) return
    nextStep()
  }, [canProceed, nextStep])

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const tripResult = await createTrip({
        destinationId: destination.destinationId,
        destinationName: destination.destinationName,
        destinationLocation: destination.destinationLocation,
        departureDate: form.departureDate,
        returnDate: form.returnDate,
      })

      if (!tripResult.success || !tripResult.trip) {
        toast.error(tripResult.error || 'Failed to create trip')
        setIsSubmitting(false)
        return
      }

      const tripId = tripResult.trip.id

      const budgetAmount = parseFloat(form.totalBudget) || 0
      if (budgetAmount > 0) {
        const budgetPayload: TripBudgetPayload = {
          allocations: createEmptyAllocations(),
          expenses: [],
          totalBudget: budgetAmount,
        }
        await apiService.saveTripBudget(tripId, budgetPayload)
      }

      const hasAccommodation =
        form.accommodationName.trim() ||
        form.accommodationAddress.trim() ||
        form.accommodationPhone.trim()

      if (hasAccommodation) {
        await apiService.saveTripAccommodation(tripId, {
          accommodationName: form.accommodationName.trim() || undefined,
          accommodationAddress: form.accommodationAddress.trim() || undefined,
          accommodationPhone: form.accommodationPhone.trim() || undefined,
        })
      }

      navigate(ROUTE_PATHS.TRIP_DETAIL(tripId), { replace: true })
    } catch (error) {
      console.error('Trip creation failed:', error)
      toast.error('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }, [isSubmitting, createTrip, destination, form, navigate])

  return (
    <>
      <div className="min-h-[380px] flex items-start justify-center pt-4 pb-8">
        {activeStep === 0 && (
          <TravelDatesStep
            departureDate={form.departureDate}
            returnDate={form.returnDate}
            onChange={(dates) => onFormChange(dates)}
          />
        )}
        {activeStep === 1 && (
          <BudgetStep
            totalBudget={form.totalBudget}
            onChange={(budget) => onFormChange({ totalBudget: budget })}
          />
        )}
        {activeStep === 2 && (
          <AccommodationStep
            data={{
              accommodationName: form.accommodationName,
              accommodationAddress: form.accommodationAddress,
              accommodationPhone: form.accommodationPhone,
            }}
            onChange={(data) => onFormChange(data)}
          />
        )}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isDisabledStep || isSubmitting}
          className="cursor-pointer gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {isLastStep ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="cursor-pointer gap-2 min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Create Trip
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="cursor-pointer gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  )
}

export default function PlanTripPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const destination = location.state as DestinationState | null

  const [form, setForm] = useState<TripFormState>(INITIAL_FORM_STATE)

  const handleFormChange = useCallback((updates: Partial<TripFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }))
  }, [])

  if (!destination?.destinationId || !destination?.destinationName) {
    return <Navigate to={ROUTE_PATHS.DESTINATIONS} replace />
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-start px-4 py-10 sm:py-16">
        <div className="w-full max-w-2xl space-y-10">
          {/* Header */}
          <div className="text-center space-y-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Plan your trip
            </h1>
            <p className="text-muted-foreground">
              {destination.destinationName}, {destination.destinationLocation}
            </p>
          </div>

          {/* Stepper */}
          <Stepper
            initialStep={0}
            steps={STEPS}
            size="md"
            variant="circle"
            styles={{
              'main-container': 'gap-6',
            }}
          >
            {STEPS.map(({ label }) => (
              <Step key={label} label={label} />
            ))}

            <StepperContent
              form={form}
              destination={destination}
              onFormChange={handleFormChange}
            />
          </Stepper>
        </div>
      </div>
    </div>
  )
}
