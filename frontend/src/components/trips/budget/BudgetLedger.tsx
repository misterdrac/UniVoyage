import { useCallback, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MiniCalendar } from '@/components/ui/mini-calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Trip } from '@/types/trip'
import type { TripBudgetExpense, BudgetCategoryValue } from '@/hooks/useTripBudget'
import { CATEGORY_CONFIG } from './constants'
import type { LedgerFormState } from './utils'
import { createLedgerInitialState, formatCurrency } from './utils'
import { Plus, PencilLine, Trash2 } from 'lucide-react'

function CategoryIcon({ value }: { value: BudgetCategoryValue }) {
  const config = CATEGORY_CONFIG[value]
  const Icon = config.icon
  return (
    <span
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-md text-xs',
        config.mutedClass,
        config.accentClass
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  )
}

interface CategoryDefinition {
  value: BudgetCategoryValue
  label: string
  suggestion: string
}

interface BudgetLedgerProps {
  trip: Trip
  categories: CategoryDefinition[]
  expenses: TripBudgetExpense[]
  addExpense: (expense: Omit<TripBudgetExpense, 'id'>) => void
  updateExpense: (id: string, updates: Partial<Omit<TripBudgetExpense, 'id'>>) => void
  removeExpense: (id: string) => void
}

type LedgerFormMode = 'create' | 'edit'

export function BudgetLedger({ trip, categories, expenses, addExpense, updateExpense, removeExpense }: BudgetLedgerProps) {
  const defaultCategoryValue = categories[0]?.value ?? 'misc'
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | BudgetCategoryValue>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<LedgerFormMode>('create')
  const [formState, setFormState] = useState<LedgerFormState>(() => createLedgerInitialState(defaultCategoryValue))

  const categoryLookup = useMemo(
    () =>
      categories.reduce(
        (acc, category) => {
          acc[category.value] = category
          return acc
        },
        {} as Record<BudgetCategoryValue, CategoryDefinition | undefined>
      ),
    [categories]
  )

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false)
    setTimeout(() => {
      setFormMode('create')
      setFormState(createLedgerInitialState(defaultCategoryValue))
    }, 200)
  }, [defaultCategoryValue])

  const openCreateForm = useCallback(() => {
    setFormMode('create')
    setFormState(createLedgerInitialState(defaultCategoryValue))
    setIsDialogOpen(true)
  }, [defaultCategoryValue])

  const openEditForm = useCallback((expense: TripBudgetExpense) => {
    setFormMode('edit')
    setFormState({
      id: expense.id,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date ?? '',
      notes: expense.notes ?? '',
    })
    setIsDialogOpen(true)
  }, [])

  const handleLedgerChange = useCallback((field: keyof LedgerFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleLedgerSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault()
      const description = formState.description.trim()
      if (!description) {
        return
      }

      const payload = {
        category: formState.category,
        description,
        amount: Number.parseFloat(formState.amount) || 0,
        notes: formState.notes.trim() || undefined,
        date: formState.date || undefined,
      }

      if (formMode === 'edit' && formState.id) {
        updateExpense(formState.id, payload)
      } else {
        addExpense(payload)
      }

      handleDialogClose()
    },
    [addExpense, formMode, formState, handleDialogClose, updateExpense]
  )

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((expense) =>
        selectedCategoryFilter === 'all' ? true : expense.category === selectedCategoryFilter
      ),
    [expenses, selectedCategoryFilter]
  )

  const selectedDate = useMemo(
    () => (formState.date ? new Date(`${formState.date}T00:00:00`) : undefined),
    [formState.date]
  )

  const handleCalendarSelect = useCallback(
    (date: Date | undefined) => {
      const iso = date ? format(date, 'yyyy-MM-dd') : ''
      handleLedgerChange('date', iso)
    },
    [handleLedgerChange]
  )

  const calendarMinDate = useMemo(() => new Date(trip.departureDate), [trip.departureDate])

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Expense ledger</h3>
          <p className="text-sm text-muted-foreground">
            Log purchases as you go and compare them against your envelope plan.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? undefined : handleDialogClose())}>
          <DialogTrigger asChild>
            <Button onClick={openCreateForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Add expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl gap-0 overflow-hidden rounded-2xl border border-border/70 p-0 shadow-2xl">
            <div className="border-b border-border/70 px-6 py-5">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="text-xl font-semibold text-foreground">
                  {formMode === 'create' ? 'Log a new expense' : 'Edit expense'}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Tag the spend, capture the amount, and we’ll keep the envelope totals up to date.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form className="grid gap-6 px-6 py-6 lg:grid-cols-[3fr_2fr]" onSubmit={handleLedgerSubmit}>
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="ledger-description" className="text-xs uppercase tracking-wide text-muted-foreground">
                      Description
                    </Label>
                    <Input
                      id="ledger-description"
                      value={formState.description}
                      onChange={(event) => handleLedgerChange('description', event.target.value)}
                      placeholder="Street food market, museum tickets, taxi ride..."
                      className="h-11 rounded-lg bg-muted/40 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ledger-amount" className="text-xs uppercase tracking-wide text-muted-foreground">
                      Amount (USD)
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="ledger-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={formState.amount}
                        onChange={(event) => handleLedgerChange('amount', event.target.value)}
                        placeholder="0.00"
                        className="h-11 w-full rounded-lg bg-muted/40 pl-8 text-sm appearance-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Category</Label>
                    <Select
                      value={formState.category}
                      onValueChange={(value) => handleLedgerChange('category', value as BudgetCategoryValue)}
                    >
                      <SelectTrigger className="h-11 w-full rounded-lg border border-border/60 bg-muted/40 text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <span className="flex items-center gap-2">
                              <CategoryIcon value={category.value} />
                              <span className="font-medium">{category.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Date</Label>
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                    <MiniCalendar
                      selected={selectedDate ?? null}
                      onSelect={handleCalendarSelect}
                      minDate={calendarMinDate}
                      maxDate={new Date(trip.returnDate)}
                    />
                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        Trip window: {format(new Date(trip.departureDate), 'MMM d')} – {format(new Date(trip.returnDate), 'MMM d')}
                      </span>
                      <span>{selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'No date selected'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ledger-notes" className="text-xs uppercase tracking-wide text-muted-foreground">
                    Notes (optional)
                  </Label>
                  <textarea
                    id="ledger-notes"
                    value={formState.notes}
                    onChange={(event) => handleLedgerChange('notes', event.target.value.slice(0, 200))}
                    placeholder="Receipts, reminders, reference numbers..."
                    className="h-40 w-full resize-none rounded-lg border border-border/60 bg-muted/40 px-3 py-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    maxLength={200}
                  />
                  <div className="flex justify-end text-[11px] text-muted-foreground">{formState.notes.length}/200</div>
                </div>

                <div className="grid gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Total logged expenses</span>
                    <span className="font-medium text-foreground">{expenses.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Current filter</span>
                    <span className="font-medium text-foreground">
                      {selectedCategoryFilter === 'all'
                        ? 'All categories'
                        : categoryLookup[selectedCategoryFilter]?.label ?? 'Uncategorised'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Date selected</span>
                    <span className="font-medium text-foreground">
                      {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter className="lg:col-span-2 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-end sm:gap-0">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="rounded-lg" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-lg">
                    {formMode === 'create' ? 'Save expense' : 'Save changes'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <LedgerList
        categories={categories}
        categoryLookup={categoryLookup}
        expenses={filteredExpenses}
        allExpenses={expenses}
        selectedCategoryFilter={selectedCategoryFilter}
        onCategoryFilterChange={setSelectedCategoryFilter}
        onEdit={openEditForm}
        onRemove={removeExpense}
      />
    </section>
  )
}

interface LedgerListProps {
  categories: CategoryDefinition[]
  categoryLookup: Record<BudgetCategoryValue, CategoryDefinition | undefined>
  expenses: TripBudgetExpense[]
  allExpenses: TripBudgetExpense[]
  selectedCategoryFilter: 'all' | BudgetCategoryValue
  onCategoryFilterChange: (value: 'all' | BudgetCategoryValue) => void
  onEdit: (expense: TripBudgetExpense) => void
  onRemove: (id: string) => void
}

function LedgerList({
  categories,
  categoryLookup,
  expenses,
  allExpenses,
  selectedCategoryFilter,
  onCategoryFilterChange,
  onEdit,
  onRemove,
}: LedgerListProps) {
  if (allExpenses.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card/60 px-6 py-12 text-center text-sm text-muted-foreground">
        No expenses yet. Start logging purchases to see progress against your allocations.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={selectedCategoryFilter === 'all' ? 'default' : 'outline'}
          onClick={() => onCategoryFilterChange('all')}
        >
          All
        </Button>
        {categories.map((category) => {
          const config = CATEGORY_CONFIG[category.value]
          return (
            <Button
              key={category.value}
              type="button"
              size="sm"
              variant={selectedCategoryFilter === category.value ? 'default' : 'outline'}
              className={cn(
                'gap-2 border-border',
                selectedCategoryFilter === category.value
                  ? cn(config.accentClass, 'bg-[rgba(255,255,255,0.08)] dark:bg-[rgba(255,255,255,0.05)]')
                  : 'text-muted-foreground'
              )}
              onClick={() => onCategoryFilterChange(category.value)}
            >
              <config.icon className="h-4 w-4" />
              {category.label}
            </Button>
          )
        })}
      </div>
      <ScrollArea className="h-[440px] w-full">
        <div className="space-y-3 pb-6">
          {expenses.map((expense) => {
            const category = categoryLookup[expense.category]
            const config = CATEGORY_CONFIG[expense.category]
            const formattedDate = expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : 'No date'
            return (
              <div
                key={expense.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/60 px-4 py-3 shadow-sm"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-xl',
                        config.mutedClass,
                        config.accentClass
                      )}
                    >
                      <config.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {category?.label ?? 'Uncategorised'} · {formattedDate}
                      </p>
                    </div>
                  </div>
                  {expense.notes ? <p className="text-xs text-muted-foreground">{expense.notes}</p> : null}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(expense.amount)}</p>
                    <p className="text-[11px] text-muted-foreground">Amount</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => onEdit(expense)}
                      aria-label={`Edit ${expense.description}`}
                    >
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => onRemove(expense.id)}
                      aria-label={`Remove ${expense.description}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}


