import type { ComponentType } from 'react'
import {
  Building2,
  Bus,
  UtensilsCrossed,
  Sparkles,
  ShoppingBag,
  Wallet,
  Coins,
} from 'lucide-react'
import type { BudgetCategoryValue } from '@/hooks/useTripBudget'
import { MAX_TOTAL_BUDGET as MAX_TOTAL_BUDGET_CAP } from '@/lib/budgeting'

export const DIAL_MIN_DEGREES = 0
export const DIAL_MAX_DEGREES = 360
export const MAX_TOTAL_BUDGET = MAX_TOTAL_BUDGET_CAP

export interface CategoryConfig {
  icon: ComponentType<{ className?: string }>
  progressFrom: string
  progressTo: string
  accentClass: string
  mutedClass: string
}

export const CATEGORY_CONFIG: Record<BudgetCategoryValue, CategoryConfig> = {
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

export const TOTAL_BUDGET_ICON = Coins


