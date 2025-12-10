import { useCallback, useEffect, useMemo, useState } from 'react'
import { MAX_TOTAL_BUDGET } from '@/lib/budgeting'
import { apiService } from '@/services/api'
import type { BudgetCategoryValue, TripBudgetExpense, TripBudgetPayload } from '@/types/budget'

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

const STORAGE_PREFIX = 'trip-budget-' // localStorage key prefix for mock mode
const DEFAULT_CATEGORIES: { value: BudgetCategoryValue; label: string; suggestion: string }[] = [
  { value: 'accommodation', label: 'Accommodation', suggestion: 'Hotels, hostels, rentals, resort fees' },
  { value: 'transportation', label: 'Transportation', suggestion: 'Flights, trains, rideshares, local transit' },
  { value: 'food', label: 'Food & Dining', suggestion: 'Restaurants, cafes, groceries, snacks' },
  { value: 'activities', label: 'Activities', suggestion: 'Tours, tickets, experiences, nightlife' },
  { value: 'shopping', label: 'Shopping & Gifts', suggestion: 'Souvenirs, clothing, gifts' },
  { value: 'misc', label: 'Miscellaneous', suggestion: 'Insurance, tips, emergency funds' },
]

const getStorageKey = (tripId: number | null | undefined) =>
  tripId == null ? null : `${STORAGE_PREFIX}${tripId}` // unique per trip

const emptyAllocations = (): Record<BudgetCategoryValue, number> =>
  DEFAULT_CATEGORIES.reduce(
    (acc, category) => {
      acc[category.value] = 0
      return acc
    },
    {} as Record<BudgetCategoryValue, number>
  )

const createEmptyBudget = (): TripBudgetPayload => ({
  allocations: emptyAllocations(),
  expenses: [],
  totalBudget: 0,
})

const normalizeExpenses = (rawExpenses: any[] = []): TripBudgetExpense[] =>
  rawExpenses
    .map((item) => ({
      id: item?.id,
      category: (item?.category ?? 'misc') as BudgetCategoryValue,
      description: item?.description ?? 'Expense',
      amount: Number(item?.amount ?? item?.actual ?? item?.planned ?? 0) || 0,
      notes: item?.notes,
      date: item?.date,
    }))
    .filter((expense) => typeof expense.id === 'string' && expense.id.length > 0)

const normalizeBudgetPayload = (data?: TripBudgetPayload | null): TripBudgetPayload => {
  if (!data) return createEmptyBudget()

  return {
    allocations: { ...emptyAllocations(), ...(data.allocations ?? {}) },
    expenses: normalizeExpenses(data.expenses),
    totalBudget: Math.min(Math.max(Number(data.totalBudget) || 0, 0), MAX_TOTAL_BUDGET),
  }
}

const parseBudgetData = (raw: string | null): TripBudgetPayload => {
  const fallback = createEmptyBudget()

  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      // Backward compatibility with previous array-only storage
      return normalizeBudgetPayload({
        allocations: emptyAllocations(),
        expenses: parsed,
        totalBudget: 0,
      })
    }

    if (parsed && typeof parsed === 'object') {
      return normalizeBudgetPayload({
        allocations: { ...emptyAllocations(), ...(parsed.allocations ?? {}) },
        expenses: parsed.expenses ?? [],
        totalBudget: parsed.totalBudget ?? 0,
      })
    }
  } catch (error) {
    console.error('Failed to parse stored budget data', error)
  }
  return fallback
}

/**
 * Persists budget data to localStorage (mock mode only).
 * Data is stored with key: 'trip-budget-{tripId}'
 */
const persistBudgetData = (key: string | null, data: TripBudgetPayload) => {
  if (!key) return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to persist trip budget to localStorage', error)
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

  // Load budget data when the component mounts or when the trip changes
  useEffect(() => {
    let isMounted = true

    const applyBudget = (budget: TripBudgetPayload) => {
      if (!isMounted) return
      setAllocations(budget.allocations)
      setExpenses(budget.expenses)
      setTotalBudget(budget.totalBudget)
    }

    const loadBudget = async () => {
      if (!tripId) {
        applyBudget(createEmptyBudget())
        setIsInitialized(true)
        return
      }

      if (apiService.useMock) {
        const stored = parseBudgetData(storageKey ? localStorage.getItem(storageKey) : null)
        applyBudget(stored)
        setIsInitialized(true)
        return
      }

      try {
        const response = await apiService.getTripBudget(tripId)
        if (response.success) {
          applyBudget(normalizeBudgetPayload(response.budget))
        } else {
          applyBudget(createEmptyBudget())
        }
      } catch (error) {
        console.error('Failed to load trip budget from API', error)
        applyBudget(createEmptyBudget())
      } finally {
        if (isMounted) {
          setIsInitialized(true)
        }
      }
    }

    loadBudget()

    return () => {
      isMounted = false
    }
  }, [tripId, storageKey])

  // Persist budget data whenever it changes
  // Uses backend API when available, otherwise falls back to localStorage mock
  useEffect(() => {
    if (!isInitialized || !tripId) return

    const payload: TripBudgetPayload = {
      allocations,
      expenses,
      totalBudget,
    }

    if (apiService.useMock) {
      persistBudgetData(storageKey, payload)
      return
    }

    const saveBudget = async () => {
      try {
        await apiService.saveTripBudget(tripId, payload)
      } catch (error) {
        console.error('Failed to save trip budget', error)
      }
    }

    saveBudget()
  }, [storageKey, allocations, expenses, totalBudget, isInitialized, tripId])

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
        amount: parseFloat(Number(expense.amount).toFixed(2)) || 0,
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
                updates.amount !== undefined ? parseFloat(Number(updates.amount).toFixed(2)) || 0 : expense.amount,
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
