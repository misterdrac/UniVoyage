import { useEffect, useMemo, useState, useId, type ComponentType } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Trip } from '@/types/trip'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  Building2,
  Bus,
  UtensilsCrossed,
  Sparkles,
  ShoppingBag,
  Wallet,
  Coins,
  PencilLine,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  useTripBudget,
  type TripBudgetExpense,
  type BudgetCategoryValue,
} from '@/hooks/useTripBudget'
import { AngleSlider } from '@ark-ui/react/angle-slider'

interface TripBudgetSectionProps {
  trip: Trip
}

type LedgerFormMode = 'create' | 'edit'

interface LedgerFormState {
  id?: string
  category: BudgetCategoryValue
  description: string
  amount: string
  date: string
  notes: string
}

const MAX_TOTAL_BUDGET = 10_000
const DIAL_MIN_DEGREES = 0
const DIAL_MAX_DEGREES = 360

const degreesToBudget = (degrees: number) =>
  Math.round((Math.min(Math.max(degrees, DIAL_MIN_DEGREES), DIAL_MAX_DEGREES) / DIAL_MAX_DEGREES) * MAX_TOTAL_BUDGET)

const budgetToDegrees = (budget: number) =>
  Math.round((Math.min(Math.max(budget, 0), MAX_TOTAL_BUDGET) / MAX_TOTAL_BUDGET) * DIAL_MAX_DEGREES)

interface AngleDialProps {
  value: number
  onValueChange: (value: number) => void
  size?: number
  thickness?: number
  gradientFrom?: string
  gradientTo?: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

const AngleDial = ({
  value,
  onValueChange,
  size = 200,
  thickness = 20,
  gradientFrom = '#3b82f6',
  gradientTo = '#9333ea',
  children,
  disabled = false,
  className,
}: AngleDialProps) => {
  const gradientId = useId()
  const minDegrees = DIAL_MIN_DEGREES
  const maxDegrees = DIAL_MAX_DEGREES
  const clampedValue = Math.min(Math.max(value, minDegrees), maxDegrees)
  const radius = size / 2 - thickness / 2
  const circumference = 2 * Math.PI * radius
  const progressRatio = (clampedValue - minDegrees) / (maxDegrees - minDegrees || 1)
  const offset = circumference * (1 - progressRatio)
  const innerInset = thickness + 12

  return (
    <AngleSlider.Root
      value={clampedValue}
      onValueChange={({ value }) => {
        const next = Math.min(Math.max(value, minDegrees), maxDegrees)
        onValueChange(next)
      }}
      disabled={disabled}
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size, opacity: disabled ? 0.5 : 1 }}
    >
      <AngleSlider.Control className="absolute inset-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="[--gradient-start:var(--start)] [--gradient-end:var(--end)]"
          style={{ '--start': gradientFrom, '--end': gradientTo } as React.CSSProperties}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={thickness}
            stroke="rgba(148,163,184,0.35)"
            className="dark:stroke-slate-700"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={thickness}
            strokeLinecap="round"
            stroke={`url(#${gradientId})`}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          </defs>
        </svg>
        <AngleSlider.Thumb className="absolute top-0 right-0 bottom-0 left-[calc(50%-1.5px)] pointer-events-none flex h-full w-[3px] items-start">
          <span
            className="h-6 w-6 shrink-0 rounded-full border-2 border-white shadow-lg shadow-blue-500/25 dark:border-slate-900"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            }}
          />
        </AngleSlider.Thumb>
      </AngleSlider.Control>
      <div
        className="absolute rounded-full bg-background"
        style={{ inset: innerInset }}
        aria-hidden
      />
      <div className="relative flex flex-col items-center gap-2">{children}</div>
      <AngleSlider.HiddenInput />
    </AngleSlider.Root>
  )
}

const CATEGORY_CONFIG: Record<
  BudgetCategoryValue,
  {
    icon: ComponentType<{ className?: string }>
    progressFrom: string
    progressTo: string
    accentClass: string
    mutedClass: string
  }
> = {
  accommodation: {
    icon: Building2,
    progressFrom: '#6366f1',
    progressTo: '#a855f7',
    accentClass: 'text-indigo-500',
    mutedClass: 'bg-indigo-500/10',
  },
  transportation: {
    icon: Bus,
    progressFrom: '#0ea5e9',
    progressTo: '#38bdf8',
    accentClass: 'text-sky-500',
    mutedClass: 'bg-sky-500/10',
  },
  food: {
    icon: UtensilsCrossed,
    progressFrom: '#f97316',
    progressTo: '#facc15',
    accentClass: 'text-amber-500',
    mutedClass: 'bg-amber-500/10',
  },
  activities: {
    icon: Sparkles,
    progressFrom: '#ec4899',
    progressTo: '#a855f7',
    accentClass: 'text-fuchsia-500',
    mutedClass: 'bg-fuchsia-500/10',
  },
  shopping: {
    icon: ShoppingBag,
    progressFrom: '#22c55e',
    progressTo: '#4ade80',
    accentClass: 'text-emerald-500',
    mutedClass: 'bg-emerald-500/10',
  },
  misc: {
    icon: Wallet,
    progressFrom: '#64748b',
    progressTo: '#94a3b8',
    accentClass: 'text-slate-500',
    mutedClass: 'bg-slate-500/10',
  },
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number.isFinite(value) ? value : 0)

const createLedgerInitialState = (category: BudgetCategoryValue): LedgerFormState => ({
  category,
  description: '',
  amount: '',
  date: '',
  notes: '',
})

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
  } = useTripBudget(trip.id)

  const latestExpenseByCategory = useMemo(() => {
    const map = {} as Partial<Record<BudgetCategoryValue, TripBudgetExpense>>
    expenses.forEach((expense) => {
      map[expense.category] = expense
    })
    return map
  }, [expenses])
 
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

  const [formMode, setFormMode] = useState<LedgerFormMode>('create')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formState, setFormState] = useState<LedgerFormState>(createLedgerInitialState(categories[0].value))
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | BudgetCategoryValue>('all')

  const tripDurationDays = useMemo(() => {
    const start = new Date(trip.departureDate)
    const end = new Date(trip.returnDate)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1)
    return diffDays
  }, [trip.departureDate, trip.returnDate])

  const totalAllocated = useMemo(
    () => categories.reduce((sum, category) => sum + allocations[category.value], 0),
    [allocations, categories]
  )

  const remainingBudget = Math.max(totalBudget - totalAllocated, 0)

  const averagePerDayActual = useMemo(() => {
    if (!tripDurationDays) return 0
    return totals.actualTotal / tripDurationDays
  }, [totals.actualTotal, tripDurationDays])

  const plannedVsActualRatio = useMemo(() => {
    if (!totalBudget) return 0
    return Math.min((totals.actualTotal / totalBudget) * 100, 100)
  }, [totals.actualTotal, totalBudget])

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setTimeout(() => {
      setFormMode('create')
      setFormState(createLedgerInitialState(categories[0].value))
    }, 200)
  }

  const openCreateForm = () => {
    setFormMode('create')
    setFormState(createLedgerInitialState(categories[0].value))
    setIsDialogOpen(true)
  }

  const openEditForm = (expense: TripBudgetExpense) => {
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
  }

  const handleLedgerChange = (field: keyof LedgerFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleLedgerSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    if (!formState.description.trim()) {
      return
    }

    const payload = {
      category: formState.category,
      description: formState.description.trim(),
      amount: Number(formState.amount) || 0,
      notes: formState.notes.trim() || undefined,
      date: formState.date || undefined,
    }

    if (formMode === 'edit' && formState.id) {
      updateExpense(formState.id, payload)
    } else {
      addExpense(payload)
    }

    handleDialogClose()
  }

  const generalSliderValue = budgetToDegrees(totalBudget)

  const handleGeneralSliderChange = (degrees: number) => {
    updateTotalBudget(degreesToBudget(degrees))
  }

  const handleGeneralInputChange = (value: string) => {
    const numericValue = Math.min(Math.max(Number(value) || 0, 0), MAX_TOTAL_BUDGET)
    updateTotalBudget(numericValue)
  }

  const handleAllocationSliderChange = (category: BudgetCategoryValue, degrees: number) => {
    if (totalBudget === 0) return
    const normalizedDegrees = Math.min(Math.max(degrees, DIAL_MIN_DEGREES), DIAL_MAX_DEGREES)
    const proposedAmount = degreesToBudget(normalizedDegrees)
    const otherAllocation = totalAllocated - allocations[category]
    const allowable = totalBudget > 0 ? Math.max(totalBudget - otherAllocation, 0) : MAX_TOTAL_BUDGET
    const clampedAmount = Math.min(proposedAmount, totalBudget > 0 ? allowable : MAX_TOTAL_BUDGET)
    updateAllocation(category, clampedAmount)
    setAllocationDraft((prev) => ({ ...prev, [category]: clampedAmount.toString() }))
  }

  const handleAllocationInputChange = (category: BudgetCategoryValue, value: string) => {
    if (totalBudget === 0) return
    const otherAllocation = totalAllocated - allocations[category]
    const allowable = totalBudget > 0 ? Math.max(totalBudget - otherAllocation, 0) : MAX_TOTAL_BUDGET
    const numericValue = Math.min(Math.max(Number(value) || 0, 0), totalBudget > 0 ? allowable : MAX_TOTAL_BUDGET)
    updateAllocation(category, numericValue)
    setAllocationDraft((prev) => ({ ...prev, [category]: numericValue.toString() }))
  }

  const renderCategoryCard = (categoryTotal: (typeof categoryTotals)[number]) => {
    const config = CATEGORY_CONFIG[categoryTotal.category]
    const Icon = config.icon
    const allocation = categoryTotal.allocation
    const actual = categoryTotal.actual
    const variance = categoryTotal.variance
    const ratio = allocation ? Math.min((actual / allocation) * 100, 100) : 0
    const sliderValue = budgetToDegrees(allocation)
    const disabled = totalBudget === 0
    const latestExpense = latestExpenseByCategory[categoryTotal.category]

    return (
      <Card key={categoryTotal.category} className="border-border/70">
        <CardContent className="flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:gap-6">
          <div className="mx-auto lg:mx-0">
            <AngleDial
              value={sliderValue}
              onValueChange={(value) => handleAllocationSliderChange(categoryTotal.category, value)}
              size={168}
              thickness={18}
              gradientFrom={config.progressFrom}
              gradientTo={config.progressTo}
              disabled={disabled}
            >
              <div className={cn('rounded-full p-3 text-xl', config.mutedClass, config.accentClass)}>
                <Icon className="h-6 w-6" />
              </div>
              <AngleSlider.ValueText className="text-xl font-semibold text-foreground">
                {formatCurrency(allocation)}
              </AngleSlider.ValueText>
              <p className="text-xs text-muted-foreground">allocated</p>
            </AngleDial>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{categoryTotal.label}</p>
              <p className="text-xs text-muted-foreground">
                {variance === 0
                  ? 'Perfectly on track'
                  : variance > 0
                    ? `${formatCurrency(variance)} remaining`
                    : `Over by ${formatCurrency(Math.abs(variance))}`}
              </p>
              {disabled ? (
                <p className="text-[11px] text-muted-foreground">Set a total budget to enable this category.</p>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div>
                <Label htmlFor={`${categoryTotal.category}-allocation`} className="text-xs text-muted-foreground">
                  Allocation amount
                </Label>
                <Input
                  id={`${categoryTotal.category}-allocation`}
                  type="number"
                  min="0"
                  max={totalBudget > 0 ? totalBudget : MAX_TOTAL_BUDGET}
                  step="10"
                  value={allocationDraft[categoryTotal.category] ?? ''}
                  onChange={(event) => handleAllocationInputChange(categoryTotal.category, event.target.value)}
                  className="mt-1"
                  disabled={disabled}
                />
              </div>
              <div className="rounded-md bg-muted px-3 py-2 text-center">
                <p className={cn('text-xs uppercase tracking-wide', config.accentClass)}>share</p>
                <p className="text-sm font-semibold text-foreground">
                  {totalBudget > 0
                    ? (allocation / totalBudget || 0).toLocaleString(undefined, {
                        style: 'percent',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })
                    : '—'}
                </p>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full transition-all', variance < 0 ? 'bg-destructive' : 'bg-primary')}
                style={{ width: `${ratio}%` }}
              />
            </div>
            <div>
              {latestExpense ? (
                <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{formatCurrency(latestExpense.amount)}</span>
                  {latestExpense.description ? ` · ${latestExpense.description}` : ''}
                  {latestExpense.date ? ` · ${format(new Date(latestExpense.date), 'MMM d')}` : ''}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No expenses logged yet.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>Budget overview</span>
            <span className="text-sm font-normal text-muted-foreground">
              {trip.destinationName} · {tripDurationDays} day{tripDurationDays !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Total budget</p>
            <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalBudget)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Allocated</p>
            <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalAllocated)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(remainingBudget)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg daily spend</p>
            <p className="text-2xl font-semibold text-foreground">{formatCurrency(averagePerDayActual)}</p>
          </div>
          <div className="sm:col-span-2 xl:col-span-4">
            <p className="mb-1 text-sm text-muted-foreground">Actual vs planned</p>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full transition-all', totals.actualTotal > totalBudget ? 'bg-destructive' : 'bg-primary')}
                style={{ width: `${plannedVsActualRatio}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalBudget === 0
                ? 'Set your target budget to start tracking progress.'
                : `${plannedVsActualRatio.toFixed(0)}% of your planned budget has been spent.`}
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Total budget</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-center">
            <div className="mx-auto lg:mx-0">
              <AngleDial
                value={generalSliderValue}
                onValueChange={handleGeneralSliderChange}
                size={176}
                thickness={16}
                gradientFrom="#3b82f6"
                gradientTo="#9333ea"
              >
                <div className="rounded-full bg-sky-500/15 p-3 text-sky-500">
                  <Coins className="h-6 w-6" />
                </div>
                <AngleSlider.ValueText className="text-2xl font-semibold text-foreground">
                  {formatCurrency(totalBudget)}
                </AngleSlider.ValueText>
                <p className="text-xs text-muted-foreground">up to $10,000</p>
              </AngleDial>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="total-budget" className="text-xs text-muted-foreground">
                  Set total budget (USD)
                </Label>
                <Input
                  id="total-budget"
                  type="number"
                  min="0"
                  max={MAX_TOTAL_BUDGET}
                  step="50"
                  value={totalBudget}
                  onChange={(event) => handleGeneralInputChange(event.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="border-dashed border-2 border-emerald-500/30 bg-emerald-500/5">
                  <CardContent className="py-4">
                    <p className="text-xs text-emerald-600">Remaining to allocate</p>
                    <p className="text-lg font-semibold text-emerald-600">{formatCurrency(remainingBudget)}</p>
                  </CardContent>
                </Card>
                <Card className="border-dashed border-2 border-sky-500/30 bg-sky-500/5">
                  <CardContent className="py-4">
                    <p className="text-xs text-sky-500">Currently allocated</p>
                    <p className="text-lg font-semibold text-sky-500">{formatCurrency(totalAllocated)}</p>
                  </CardContent>
                </Card>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                updateTotalBudget(0)
                resetAllocations()
              }}>
                Reset all
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {categories.map((category) => {
            const summary = categoryTotals.find((total) => total.category === category.value)
            return summary ? renderCategoryCard(summary) : null
          })}
        </div>
      </section>

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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{formMode === 'create' ? 'Add expense' : 'Edit expense'}</DialogTitle>
                <DialogDescription>
                  Record spending for your trip. We’ll automatically compare it against your planned budget.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleLedgerSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="ledger-category">Category</Label>
                    <select
                      id="ledger-category"
                      value={formState.category}
                      onChange={(event) => handleLedgerChange('category', event.target.value as BudgetCategoryValue)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      required
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {categories.find((category) => category.value === formState.category)?.suggestion}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="ledger-description">Description</Label>
                    <Input
                      id="ledger-description"
                      value={formState.description}
                      onChange={(event) => handleLedgerChange('description', event.target.value)}
                      placeholder="e.g., Street food market"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ledger-amount">Amount</Label>
                    <Input
                      id="ledger-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formState.amount}
                      onChange={(event) => handleLedgerChange('amount', event.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ledger-date">Date (optional)</Label>
                    <Input
                      id="ledger-date"
                      type="date"
                      value={formState.date}
                      onChange={(event) => handleLedgerChange('date', event.target.value)}
                      min={trip.departureDate}
                      max={trip.returnDate}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="ledger-notes">Notes (optional)</Label>
                    <Input
                      id="ledger-notes"
                      value={formState.notes}
                      onChange={(event) => handleLedgerChange('notes', event.target.value)}
                      placeholder="Add receipts, booking references, or reminders"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit">{formMode === 'create' ? 'Add expense' : 'Save changes'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Card className="border-border/70">
          <CardContent className="p-0">
            {expenses.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                No expenses yet. Start logging purchases to see progress against your allocations.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 px-6 pt-4">
                  <Button
                    type="button"
                    size="sm"
                    variant={selectedCategoryFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategoryFilter('all')}
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
                        onClick={() => setSelectedCategoryFilter(category.value)}
                      >
                        <config.icon className="h-4 w-4" />
                        {category.label}
                      </Button>
                    )
                  })}
                </div>
                <ScrollArea className="h-[440px] w-full">
                  <div className="space-y-3 px-6 pb-6">
                    {expenses
                      .filter((expense) =>
                        selectedCategoryFilter === 'all' ? true : expense.category === selectedCategoryFilter
                      )
                      .map((expense) => {
                        const category = categories.find((category) => category.value === expense.category)
                        const config = CATEGORY_CONFIG[expense.category]
                        const formattedDate = expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : 'No date'
                        return (
                          <div
                            key={expense.id}
                            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/60 px-4 py-3 shadow-sm"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="relative flex h-9 w-9 items-center justify-center">
                                  <span
                                    className={cn(
                                      'absolute inset-0 rounded-xl opacity-20',
                                      config.accentClass.replace('text-', 'bg-')
                                    )}
                                  />
                                  <span className={cn('relative flex h-8 w-8 items-center justify-center rounded-xl', config.mutedClass, config.accentClass)}>
                                    <config.icon className="h-4 w-4" />
                                  </span>
                                </span>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{expense.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {category?.label ?? 'Uncategorised'} · {formattedDate}
                                  </p>
                                </div>
                              </div>
                              {expense.notes ? (
                                <p className="text-xs text-muted-foreground">{expense.notes}</p>
                              ) : null}
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
                                  onClick={() => openEditForm(expense)}
                                  aria-label={`Edit ${expense.description}`}
                                >
                                  <PencilLine className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => removeExpense(expense.id)}
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
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}


