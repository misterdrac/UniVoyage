import type { CategoryTotals, TripBudgetExpense, BudgetCategoryValue } from '@/hooks/useTripBudget'
import { CATEGORY_CONFIG } from './constants'
import { BudgetCategoryCard } from './BudgetCategoryCard'

interface BudgetCategoryListProps {
  summaries: CategoryTotals[]
  totalBudget: number
  allocationDraft: Record<BudgetCategoryValue, string>
  onAllocationInputChange: (category: BudgetCategoryValue, value: string) => void
  onAllocationSliderChange: (category: BudgetCategoryValue, degrees: number) => void
  latestExpenseByCategory: Partial<Record<BudgetCategoryValue, TripBudgetExpense>>
}

export function BudgetCategoryList({
  summaries,
  totalBudget,
  allocationDraft,
  onAllocationInputChange,
  onAllocationSliderChange,
  latestExpenseByCategory,
}: BudgetCategoryListProps) {
  return (
    <div className="space-y-4">
      {summaries.map((summary) => (
        <BudgetCategoryCard
          key={summary.category}
          summary={summary}
          config={CATEGORY_CONFIG[summary.category]}
          totalBudget={totalBudget}
          allocationDraft={allocationDraft[summary.category] ?? ''}
          onAllocationInputChange={onAllocationInputChange}
          onAllocationSliderChange={onAllocationSliderChange}
          latestExpense={latestExpenseByCategory[summary.category]}
        />
      ))}
    </div>
  )
}


