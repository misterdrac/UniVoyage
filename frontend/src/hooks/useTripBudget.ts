import { useCallback, useEffect, useMemo, useState } from 'react'
import { MAX_TOTAL_BUDGET } from '@/lib/budgeting'

export type BudgetCategoryValue = 'accommodation' | 'transportation' | 'food' | 'activities' | 'shopping' | 'misc'

export interface TripBudgetExpense {
  id: string
  category: BudgetCategoryValue
  description: string
  amount: number
  notes?: string
  date?: string
}

export interface TripBudgetTotals {
  allocatedTotal: number
  actualTotal: number
  variance: number
  overBudget: boolean
}

export interface CategoryTotals {
  category: BudgetCategoryValue
  label: string
  allocation: number
  actual: number
  variance: number
  overBudget: boolean
}

const STORAGE_PREFIX = 'trip-budget-'
const DEFAULT_CATEGORIES: { value: BudgetCategoryValue; label: string; suggestion: string }[] = [
  { value: 'accommodation', label: 'Accommodation', suggestion: 'Hotels, hostels, rentals, resort fees' },
  { value: 'transportation', label: 'Transportation', suggestion: 'Flights, trains, rideshares, local transit' },
  { value: 'food', label: 'Food & Dining', suggestion: 'Restaurants, cafes, groceries, snacks' },
  { value: 'activities', label: 'Activities', suggestion: 'Tours, tickets, experiences, nightlife' },
  { value: 'shopping', label: 'Shopping & Gifts', suggestion: 'Souvenirs, clothing, gifts' },
  { value: 'misc', label: 'Miscellaneous', suggestion: 'Insurance, tips, emergency funds' },
]

const getStorageKey = (tripId: number | null | undefined) =>
  tripId == null ? null : `${STORAGE_PREFIX}${tripId}`

interface StoredBudgetData {
  allocations: Record<BudgetCategoryValue, number>
  expenses: TripBudgetExpense[]
  totalBudget: number
}

const emptyAllocations = (): Record<BudgetCategoryValue, number> =>
  DEFAULT_CATEGORIES.reduce(
    (acc, category) => {
      acc[category.value] = 0
      return acc
    },
    {} as Record<BudgetCategoryValue, number>
  )

const parseBudgetData = (raw: string | null): StoredBudgetData => {
  const fallback: StoredBudgetData = {
    allocations: emptyAllocations(),
    expenses: [],
    totalBudget: 0,
  }

  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      // Backward compatibility with previous array-only storage
      return {
        allocations: emptyAllocations(),
        expenses: parsed
          .map((item) => ({
            id: item.id,
            category: item.category ?? 'misc',
            description: item.description ?? 'Expense',
            amount: Number(item.actual ?? item.planned ?? 0) || 0,
            notes: item.notes,
            date: item.date,
          }))
          .filter((expense) => typeof expense.id === 'string' && expense.id.length > 0),
        totalBudget: 0,
      }
    }

    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray(parsed.expenses) &&
      parsed.allocations &&
      typeof parsed.allocations === 'object'
    ) {
      const allocations = { ...emptyAllocations(), ...parsed.allocations }
      const expenses = parsed.expenses
        .map((item: any) => ({
          id: item.id,
          category: item.category ?? 'misc',
          description: item.description ?? 'Expense',
          amount: Number(item.amount ?? 0) || 0,
          notes: item.notes,
          date: item.date,
        }))
        .filter((expense: TripBudgetExpense) => typeof expense.id === 'string' && expense.id.length > 0)
      const totalBudget = Number(parsed.totalBudget) || 0
      return { allocations, expenses, totalBudget }
    }
  } catch (error) {
    console.error('Failed to parse stored budget data', error)
  }
  return fallback
}

/**
 * Persists budget data to localStorage.
 * This is a temporary solution until backend support is added.
 * Data is stored with key: 'trip-budget-{tripId}'
 */
const persistBudgetData = (key: string | null, data: StoredBudgetData) => {
  if (!key) return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to persist trip budget to localStorage', error)
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Budget data may not be saved.')
    }
  }
}

export const useTripBudget = (tripId: number | null | undefined) => {
  const [expenses, setExpenses] = useState<TripBudgetExpense[]>([])
  const [allocations, setAllocations] = useState<Record<BudgetCategoryValue, number>>(emptyAllocations())
  const [totalBudget, setTotalBudget] = useState<number>(0)
  const [isInitialized, setIsInitialized] = useState(false)

  const storageKey = useMemo(() => getStorageKey(tripId), [tripId])

  // Load budget data from localStorage on mount or when tripId changes
  // This runs every time the component mounts, ensuring data is loaded when switching tabs
  useEffect(() => {
    if (!storageKey) {
      setExpenses([])
      setAllocations(emptyAllocations())
      setTotalBudget(0)
      setIsInitialized(true)
      return
    }

    try {
      const stored = parseBudgetData(localStorage.getItem(storageKey))
      // Only update state if we have valid stored data
      if (stored) {
        setAllocations(stored.allocations)
        setExpenses(stored.expenses)
        setTotalBudget(Math.min(Math.max(stored.totalBudget || 0, 0), MAX_TOTAL_BUDGET))
      }
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to load budget data from localStorage', error)
      // Reset to defaults on error
      setAllocations(emptyAllocations())
      setExpenses([])
      setTotalBudget(0)
      setIsInitialized(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]) // Only depend on storageKey, not on state values

  // Persist budget data to localStorage whenever it changes
  // TODO: Replace with backend API calls when backend support is added
  // Only persist after initial load to avoid overwriting with empty defaults
  useEffect(() => {
    if (!isInitialized || !storageKey) return
    
    persistBudgetData(storageKey, { allocations, expenses, totalBudget })
  }, [storageKey, allocations, expenses, totalBudget, isInitialized])

  const updateAllocation = useCallback((category: BudgetCategoryValue, amount: number) => {
    setAllocations((prev) => ({
      ...prev,
      [category]: Number(amount) || 0,
    }))
  }, [])

  const updateAllocations = useCallback((values: Record<BudgetCategoryValue, number>) => {
    setAllocations((prev) => ({ ...prev, ...values }))
  }, [])

  const resetAllocations = useCallback(() => {
    setAllocations(emptyAllocations())
  }, [])

  const updateTotalBudget = useCallback((amount: number) => {
    const normalized = Math.min(Math.max(amount, 0), MAX_TOTAL_BUDGET)
    setTotalBudget((prev) => {
      if (normalized < prev) {
        // ensure allocations do not exceed new total budget
        setAllocations((current) => {
          const totalAllocated = Object.values(current).reduce((sum, value) => sum + value, 0)
          if (totalAllocated <= normalized) {
            return current
          }

          const scale = normalized === 0 || totalAllocated === 0 ? 0 : normalized / totalAllocated
          const scaled = Object.fromEntries(
            Object.entries(current).map(([key, value]) => [key, Math.round(value * scale)])
          ) as Record<BudgetCategoryValue, number>
          return scaled
        })
      }
      return normalized
    })
  }, [])

  const addExpense = useCallback((expense: Omit<TripBudgetExpense, 'id'>) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
    setExpenses((prev) => [
      ...prev,
      {
        ...expense,
        id,
        amount: Number(expense.amount) || 0,
      },
    ])
  }, [])

  const updateExpense = useCallback((id: string, updates: Partial<Omit<TripBudgetExpense, 'id'>>) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              ...updates,
              amount:
                updates.amount !== undefined ? Number(updates.amount) || 0 : expense.amount,
            }
          : expense
      )
    )
  }, [])

  const removeExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }, [])

  const clearExpenses = useCallback(() => {
    setExpenses([])
  }, [])

  const totals: TripBudgetTotals = useMemo(() => {
    const allocatedTotal = DEFAULT_CATEGORIES.reduce(
      (sum, category) => sum + (Number.isFinite(allocations[category.value]) ? allocations[category.value] : 0),
      0
    )
    const actualTotal = expenses.reduce((sum, expense) => sum + (Number.isFinite(expense.amount) ? expense.amount : 0), 0)
    const variance = allocatedTotal - actualTotal
    return {
      allocatedTotal,
      actualTotal,
      variance,
      overBudget: variance < 0,
    }
  }, [allocations, expenses])

  const categoryTotals: CategoryTotals[] = useMemo(() => {
    return DEFAULT_CATEGORIES.map(({ value, label }) => {
      const relevant = expenses.filter((expense) => expense.category === value)
      const allocation = Number.isFinite(allocations[value]) ? allocations[value] : 0
      const actual = relevant.reduce((sum, expense) => sum + (Number.isFinite(expense.amount) ? expense.amount : 0), 0)
      const variance = allocation - actual
      return {
        category: value,
        label,
        allocation,
        actual,
        variance,
        overBudget: variance < 0,
      }
    })
  }, [allocations, expenses])

  const latestExpenseByCategory = useMemo(() => {
    return expenses.reduce(
      (acc, expense) => {
        acc[expense.category] = expense
        return acc
      },
      {} as Partial<Record<BudgetCategoryValue, TripBudgetExpense>>
    )
  }, [expenses])

  return {
    expenses,
    addExpense,
    updateExpense,
    removeExpense,
    clearExpenses,
    totals,
    categoryTotals,
    allocations,
    updateAllocation,
    updateAllocations,
    resetAllocations,
    totalBudget,
    updateTotalBudget,
    categories: DEFAULT_CATEGORIES,
    latestExpenseByCategory,
  }
}
