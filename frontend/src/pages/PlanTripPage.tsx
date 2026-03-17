import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Loader2, ChevronLeft, ChevronRight, CalendarDays, Wallet, Hotel, Check, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Stepper, Step, useStepper } from '@/components/ui/stepper'
import { DEFAULT_DESTINATION_IMAGE } from '@/lib/destinationUtils'
import { scrollToTop } from '@/lib/utils'
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
  destinationImageUrl?: string
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

function isTravelDatesStepComplete(form: TripFormState) {
  return !!form.departureDate && !!form.returnDate
}

function isBudgetStepComplete(form: TripFormState) {
  return !!form.totalBudget && parseFloat(form.totalBudget) > 0
}

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
    scrollToTop()
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
      <div className="flex items-start justify-center py-6">
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

      {/* Fixed floating nav — always visible, no scrolling needed */}
      <button
        type="button"
        onClick={() => { prevStep(); scrollToTop() }}
        disabled={isDisabledStep || isSubmitting}
        className="cursor-pointer fixed left-4 top-1/2 z-40 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background/80 text-muted-foreground shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-accent hover:text-foreground hover:scale-110 disabled:pointer-events-none disabled:opacity-0 sm:left-8 sm:h-11 sm:w-11"
        aria-label="Previous step"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {isLastStep ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="cursor-pointer fixed right-4 top-1/2 z-40 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:scale-110 disabled:pointer-events-none disabled:opacity-50 sm:right-8 sm:h-11 sm:w-11"
          aria-label={isSubmitting ? 'Creating trip' : 'Create trip'}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Check className="h-5 w-5" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className="cursor-pointer fixed right-4 top-1/2 z-40 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:scale-110 disabled:pointer-events-none disabled:opacity-30 sm:right-8 sm:h-11 sm:w-11"
          aria-label="Next step"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </>
  )
}

export default function PlanTripPage() {
  const location = useLocation()

  const destination = location.state as DestinationState | null

  const [form, setForm] = useState<TripFormState>(INITIAL_FORM_STATE)

  const handleFormChange = useCallback((updates: Partial<TripFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleStepClick = useCallback(
    (step: number, setStep: (step: number) => void, activeStep: number) => {
      if (step <= activeStep) {
        setStep(step)
        scrollToTop()
        return
      }

      const canOpenStep =
        (step === 1 && isTravelDatesStepComplete(form))
        || (step === 2
          && isTravelDatesStepComplete(form)
          && isBudgetStepComplete(form))

      if (canOpenStep) {
        setStep(step)
        scrollToTop()
      }
    },
    [form],
  )

  if (!destination?.destinationId || !destination?.destinationName) {
    return <Navigate to={ROUTE_PATHS.DESTINATIONS} replace />
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-1 justify-center px-4 pt-20 pb-4 sm:pt-24 sm:pb-6">
        <div className="flex w-full max-w-2xl flex-col gap-6">
          {/* Header with destination image */}
          <div className="relative mt-4 overflow-hidden rounded-2xl">
            <div className="relative h-32 sm:h-36">
              <img
                src={destination.destinationImageUrl || DEFAULT_DESTINATION_IMAGE}
                alt={destination.destinationName}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/10" />
              <div className="relative flex h-full flex-col items-center justify-end pb-4 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">
                  Plan your trip
                </h1>
                <div className="mt-1 flex items-center gap-1.5 text-white/85">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">
                    {destination.destinationName}, {destination.destinationLocation}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <Stepper
            initialStep={0}
            steps={STEPS}
            size="md"
            variant="circle"
            onClickStep={handleStepClick}
            styles={{
              'main-container': 'gap-6',
              'horizontal-step': 'flex-1',
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
