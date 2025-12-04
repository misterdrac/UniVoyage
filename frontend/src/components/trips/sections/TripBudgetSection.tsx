import type { Trip } from '@/types/trip'
import { TripBudgetSection as BudgetSection } from './budget'

interface TripBudgetSectionProps {
  trip: Trip
}

export function TripBudgetSection({ trip }: TripBudgetSectionProps) {
  return <BudgetSection trip={trip} />
}


