import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MiniCalendar } from '@/components/ui/mini-calendar'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_CONFIG } from './categoryConfig'
import { AmountInput } from './AmountInput'
import type { BudgetCategoryValue } from '@/types/budget'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

interface ExpenseForm {
  description: string
  amount: number
  date: Date | null
  notes: string
}

interface AddExpenseDialogProps {
  category: BudgetCategoryValue
  categoryLabel: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (expense: { description: string; amount: number; date?: string; notes?: string }) => void
  totalBudget: number
  remainingBudget: number
}

export function AddExpenseDialog({
  category,
  categoryLabel,
  open,
  onOpenChange,
  onSubmit,
  totalBudget,
  remainingBudget,
}: AddExpenseDialogProps) {
  const [form, setForm] = useState<ExpenseForm>({
    description: '',
    amount: 0,
    date: null,
    notes: '',
  })

  const config = CATEGORY_CONFIG[category]
  const Icon = config.icon

  const handleSubmit = () => {
    if (form.description.trim() && form.amount > 0) {
      onSubmit({
        description: form.description,
        amount: form.amount,
        date: form.date ? form.date.toISOString().split('T')[0] : undefined,
        notes: form.notes || undefined,
      })
      setForm({ description: '', amount: 0, date: null, notes: '' })
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setForm({ description: '', amount: 0, date: null, notes: '' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className={cn('p-1.5 sm:p-2 rounded-lg', config.bgColor, config.borderColor, 'border-2')}>
              <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', config.textColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className={cn('text-base sm:text-xl truncate', config.textColor)}>
                Add {categoryLabel} Expense
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Enter the details for your expense
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="space-y-2">
            <Label htmlFor="expense-description" className="text-sm">Description</Label>
            <Input
              id="expense-description"
              placeholder="e.g., Hotel booking, Restaurant dinner..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="text-sm sm:text-base"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense-amount" className="text-sm">Amount (USD)</Label>
            <AmountInput
              id="expense-amount"
              value={form.amount}
              onChange={(amount) => setForm({ ...form, amount })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Date (Optional)</Label>
            <div className="w-full sm:w-auto rounded-md border bg-popover text-popover-foreground shadow-md p-0 overflow-x-auto">
              <MiniCalendar
                selected={form.date || undefined}
                onSelect={(date) => setForm({ ...form, date: date || null })}
                className="min-w-[280px]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense-notes" className="text-sm">Notes (Optional)</Label>
            <Textarea
              id="expense-notes"
              placeholder="Add any additional notes about this expense..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="text-sm min-h-[60px] sm:min-h-[80px] resize-none"
            />
          </div>
          {totalBudget > 0 && (
            <div className={cn(
              'p-2 sm:p-3 rounded-lg border',
              remainingBudget - form.amount < 0
                ? 'bg-destructive/10 border-destructive/30'
                : 'bg-muted/50'
            )}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
                <span className="text-muted-foreground">Remaining after this expense:</span>
                <span className={cn(
                  'font-semibold',
                  remainingBudget - form.amount < 0 ? 'text-destructive' : 'text-foreground'
                )}>
                  {formatCurrency(remainingBudget - form.amount)}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.description.trim() || form.amount <= 0}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

