import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CATEGORY_CONFIG } from './categoryConfig'
import type { TripBudgetExpense } from '@/types/budget'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

interface ExpenseItemProps {
  expense: TripBudgetExpense
  onEdit: () => void
  onDelete: () => void
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  const expenseConfig = CATEGORY_CONFIG[expense.category]

  return (
    <div className={cn(
      'p-2 sm:p-3 rounded-lg border bg-background/50 backdrop-blur-sm',
      'border-border/50'
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{expense.description}</p>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
            {expense.date && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {format(new Date(expense.date), 'MMM d, yyyy')}
              </span>
            )}
            {expense.notes && (
              <>
                {expense.date && <span className="text-xs text-muted-foreground hidden sm:inline">·</span>}
                <span className="text-xs text-muted-foreground italic truncate max-w-[150px] sm:max-w-[200px]">
                  {expense.notes}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
          <span className={cn('font-semibold text-sm sm:text-base', expenseConfig.textColor)}>
            {formatCurrency(expense.amount)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-muted shrink-0"
            onClick={onEdit}
          >
            <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

