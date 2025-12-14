export type BudgetCategoryValue =
  | 'accommodation'
  | 'transportation'
  | 'food'
  | 'activities'
  | 'shopping'
  | 'misc'

export interface TripBudgetExpense {
  id: string
  category: BudgetCategoryValue
  description: string
  amount: number
  notes?: string
  date?: string
}

export interface TripBudgetPayload {
  allocations: Record<BudgetCategoryValue, number>
  expenses: TripBudgetExpense[]
  totalBudget: number
}


