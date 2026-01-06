/**
 * Budget category types for trip expenses
 */
export type BudgetCategoryValue =
  | 'accommodation'
  | 'transportation'
  | 'food'
  | 'activities'
  | 'shopping'
  | 'misc'

/**
 * Individual expense entry in trip budget
 */
export interface TripBudgetExpense {
  id: string
  category: BudgetCategoryValue
  description: string
  amount: number
  notes?: string
  date?: string
}

/**
 * Complete trip budget data (allocations, expenses, total)
 */
export interface TripBudgetPayload {
  allocations: Record<BudgetCategoryValue, number>
  expenses: TripBudgetExpense[]
  totalBudget: number
}


