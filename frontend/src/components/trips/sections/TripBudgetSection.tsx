import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Trip } from '@/types/trip'
import { useTripBudget, type BudgetCategoryValue } from '@/hooks/useTripBudget'
import {
  BudgetCategoryList,
  BudgetLedger,
  BudgetOverviewCard,
  BudgetTotalCard,
  DIAL_MAX_DEGREES,
  DIAL_MIN_DEGREES,
  degreesToBudget,
} from '../budget'

interface TripBudgetSectionProps {
  trip: Trip
}

export function TripBudgetSection({ trip }: TripBudgetSectionProps) {
  const {
    expenses,
    addExpense,
    updateExpense,
    removeExpense,
    totals,
    categoryTotals,
    allocations,
    updateAllocation,
    resetAllocations,
    totalBudget,
    updateTotalBudget,
    categories,
    latestExpenseByCategory,
  } = useTripBudget(trip.id)

  const [allocationDraft, setAllocationDraft] = useState<Record<BudgetCategoryValue, string>>(() =>
    Object.fromEntries(
      categories.map((category) => [category.value, allocations[category.value].toString()])
    ) as Record<BudgetCategoryValue, string>
  )

  useEffect(() => {
    setAllocationDraft(
      Object.fromEntries(
        categories.map((category) => [category.value, allocations[category.value].toString()])
      ) as Record<BudgetCategoryValue, string>
    )
  }, [allocations, categories])

  const tripDurationDays = useMemo(() => {
    const start = new Date(trip.departureDate)
    const end = new Date(trip.returnDate)
    const diffTime = end.getTime() - start.getTime()
    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1)
  }, [trip.departureDate, trip.returnDate])

  const totalAllocated = useMemo(
    () => categories.reduce((sum, category) => sum + (allocations[category.value] ?? 0), 0),
    [allocations, categories]
  )

  const remainingBudget = useMemo(() => Math.max(totalBudget - totalAllocated, 0), [totalBudget, totalAllocated])

  const averagePerDayActual = useMemo(() => {
    if (!tripDurationDays) return 0
    return totals.actualTotal / tripDurationDays
  }, [totals.actualTotal, tripDurationDays])

  const plannedVsActualRatio = useMemo(() => {
    if (!totalBudget) return 0
    return Math.min((totals.actualTotal / totalBudget) * 100, 100)
  }, [totals.actualTotal, totalBudget])

  const handleTotalBudgetChange = useCallback(
    (value: number) => {
      updateTotalBudget(value)
    },
    [updateTotalBudget]
  )

  const handleReset = useCallback(() => {
    updateTotalBudget(0)
    resetAllocations()
  }, [resetAllocations, updateTotalBudget])

  const handleAllocationSliderChange = useCallback(
    (category: BudgetCategoryValue, degrees: number) => {
      if (totalBudget === 0) return
      const normalizedDegrees = Math.min(Math.max(degrees, DIAL_MIN_DEGREES), DIAL_MAX_DEGREES)
      const proposedAmount = degreesToBudget(normalizedDegrees, totalBudget)
      const otherAllocation = totalAllocated - allocations[category]
      const allowable = Math.max(totalBudget - otherAllocation, 0)
      const clampedAmount = Math.min(proposedAmount, allowable)
      updateAllocation(category, clampedAmount)
      setAllocationDraft((prev) => ({ ...prev, [category]: clampedAmount.toString() }))
    },
    [allocations, totalAllocated, totalBudget, updateAllocation]
  )

  const handleAllocationInputChange = useCallback(
    (category: BudgetCategoryValue, value: string) => {
      if (totalBudget === 0) return
      const otherAllocation = totalAllocated - allocations[category]
      const allowable = Math.max(totalBudget - otherAllocation, 0)
      const numericValue = Math.min(Math.max(Number(value) || 0, 0), allowable)
      updateAllocation(category, numericValue)
      setAllocationDraft((prev) => ({ ...prev, [category]: numericValue.toString() }))
    },
    [allocations, totalAllocated, totalBudget, updateAllocation]
  )

  return (
    <div className="space-y-6">
      <BudgetOverviewCard
        trip={trip}
        totalBudget={totalBudget}
        totalAllocated={totalAllocated}
        remainingBudget={remainingBudget}
        averagePerDayActual={averagePerDayActual}
        plannedVsActualRatio={plannedVsActualRatio}
      />

      <section className="space-y-4">
        <BudgetTotalCard
          totalBudget={totalBudget}
          totalAllocated={totalAllocated}
          remainingBudget={remainingBudget}
          onTotalBudgetChange={handleTotalBudgetChange}
          onReset={handleReset}
        />

        <BudgetCategoryList
          summaries={categoryTotals}
          totalBudget={totalBudget}
          allocationDraft={allocationDraft}
          onAllocationInputChange={handleAllocationInputChange}
          onAllocationSliderChange={handleAllocationSliderChange}
          latestExpenseByCategory={latestExpenseByCategory}
        />
      </section>

      <BudgetLedger
        trip={trip}
        categories={categories}
        expenses={expenses}
        addExpense={addExpense}
        updateExpense={updateExpense}
        removeExpense={removeExpense}
      />
    </div>
  )
}


