import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_CONFIG } from './categoryConfig'
import { AddExpenseDialog } from './AddExpenseDialog'
import { ExpenseItem } from './ExpenseItem'
import type { TripBudgetExpense, BudgetCategoryValue } from '@/types/budget'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

interface CategoryExpenseCardProps {
  category: { value: BudgetCategoryValue; label: string }
  expenses: TripBudgetExpense[]
  categorySpent: number
  totalBudget: number
  remainingBudget: number
  onAddExpense: (expense: { category: BudgetCategoryValue; description: string; amount: number; date?: string; notes?: string }) => void
  onDeleteExpense: (expenseId: string) => void
  onStartEdit: (expense: TripBudgetExpense) => void
  editingExpenseId: string | null
}

export function CategoryExpenseCard({
  category,
  expenses,
  categorySpent,
  totalBudget,
  remainingBudget,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onStartEdit,
  editingExpenseId,
}: CategoryExpenseCardProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const config = CATEGORY_CONFIG[category.value]
  const Icon = config.icon
  const percentage = totalBudget > 0 ? (categorySpent / totalBudget) * 100 : 0

  return (
    <div className={cn(
      'p-3 sm:p-5 rounded-lg border-2 transition-all',
      config.bgColor,
      config.borderColor
    )}>
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className={cn('p-2 sm:p-3 rounded-lg shrink-0', config.bgColor, config.borderColor, 'border-2')}>
              <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', config.textColor)} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={cn('text-base sm:text-lg font-semibold truncate', config.textColor)}>
                {category.label}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="whitespace-nowrap">{formatCurrency(categorySpent)} spent</span>
                {totalBudget > 0 && (
                  <span className="hidden sm:inline"> • {percentage.toFixed(0)}% of budget</span>
                )}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setAddDialogOpen(true)}
            size="sm"
            variant="outline"
            className={cn('border-2 w-full sm:w-auto', config.borderColor, config.textColor, 'hover:bg-background/50')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Add Expense Dialog */}
        <AddExpenseDialog
          category={category.value}
          categoryLabel={category.label}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSubmit={(expense) => {
            onAddExpense({ ...expense, category: category.value })
          }}
          totalBudget={totalBudget}
          remainingBudget={remainingBudget}
        />

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              No expenses in this category yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onEdit={() => onStartEdit(expense)}
                onDelete={() => onDeleteExpense(expense.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

