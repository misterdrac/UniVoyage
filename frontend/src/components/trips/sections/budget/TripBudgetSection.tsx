import { useState } from 'react'
import { useTripBudget } from '@/hooks/useTripBudget'
import type { TripBudgetExpense } from '@/types/budget'
import type { Trip } from '@/types/trip'
import { TotalBudgetCard } from './TotalBudgetCard'
import { CategoryExpenseCard } from './CategoryExpenseCard'
import { EditExpenseDialog } from './EditExpenseDialog'
import { toast } from 'sonner'

export function TripBudgetSection({ trip }: { trip: Trip }) {
  const {
    totalBudget,
    updateTotalBudget,
    expenses,
    addExpense,
    updateExpense,
    removeExpense,
    totals,
    categoryTotals,
    categories,
  } = useTripBudget(trip.id)
  
  const [editExpenseDialogOpen, setEditExpenseDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<TripBudgetExpense | null>(null)

  const remainingBudget = totalBudget - totals.actualTotal

  const handleStartEdit = (expense: TripBudgetExpense) => {
    setEditingExpense(expense)
    setEditExpenseDialogOpen(true)
  }

  const handleSaveEdit = (updates: { description: string; amount: number; date?: string; notes?: string }) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, updates)
      setEditingExpense(null)
      setEditExpenseDialogOpen(false)
      toast.success('Expense updated successfully')
    }
  }

  const handleCancelEdit = () => {
    setEditingExpense(null)
    setEditExpenseDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <TotalBudgetCard
        totalBudget={totalBudget}
        updateTotalBudget={updateTotalBudget}
        totals={totals}
        remainingBudget={remainingBudget}
      />

      {/* Expenses by Category */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryExpenses = expenses.filter((exp) => exp.category === category.value)
          const categoryTotal = categoryTotals.find((ct) => ct.category === category.value)
          const categorySpent = categoryTotal?.actual || 0

          return (
            <CategoryExpenseCard
              key={category.value}
              category={category}
              expenses={categoryExpenses}
              categorySpent={categorySpent}
              totalBudget={totalBudget}
              remainingBudget={remainingBudget}
              onAddExpense={addExpense}
              onDeleteExpense={removeExpense}
              onStartEdit={handleStartEdit}
              editingExpenseId={editingExpense?.id || null}
            />
          )
        })}
      </div>

      {/* Edit Expense Dialog */}
      <EditExpenseDialog
        expense={editingExpense}
        categoryLabel={editingExpense ? categories.find(c => c.value === editingExpense.category)?.label || '' : ''}
        open={editExpenseDialogOpen}
        onOpenChange={setEditExpenseDialogOpen}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        totalBudget={totalBudget}
        remainingBudget={remainingBudget}
      />
    </div>
  )
}
