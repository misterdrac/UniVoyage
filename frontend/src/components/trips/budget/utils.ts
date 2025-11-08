import type { BudgetCategoryValue } from '@/hooks/useTripBudget'
import { DIAL_MAX_DEGREES, DIAL_MIN_DEGREES, MAX_TOTAL_BUDGET } from './constants'

const clampDegrees = (degrees: number) => Math.min(Math.max(degrees, DIAL_MIN_DEGREES), DIAL_MAX_DEGREES)
const clampBudget = (budget: number, cap: number) => Math.min(Math.max(budget, 0), Math.max(cap, 0))

export const degreesToBudget = (degrees: number, cap: number = MAX_TOTAL_BUDGET) => {
  const clampedDegrees = clampDegrees(degrees)
  const effectiveCap = Math.max(cap, 0)
  if (effectiveCap === 0) {
    return 0
  }
  return Math.round((clampedDegrees / DIAL_MAX_DEGREES) * effectiveCap)
}

export const budgetToDegrees = (budget: number, cap: number = MAX_TOTAL_BUDGET) => {
  const effectiveCap = Math.max(cap, 0)
  if (effectiveCap === 0) {
    return 0
  }
  const clampedBudget = clampBudget(budget, effectiveCap)
  return Math.round((clampedBudget / effectiveCap) * DIAL_MAX_DEGREES)
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(Number.isFinite(value) ? value : 0)

export interface LedgerFormState {
  id?: string
  category: BudgetCategoryValue
  description: string
  amount: string
  date: string
  notes: string
}

export const createLedgerInitialState = (category: BudgetCategoryValue): LedgerFormState => ({
  category,
  description: '',
  amount: '',
  date: '',
  notes: '',
})


