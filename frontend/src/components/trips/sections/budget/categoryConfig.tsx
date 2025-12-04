import { 
  Home, 
  Plane, 
  UtensilsCrossed, 
  Ticket, 
  ShoppingBag, 
  MoreHorizontal,
  type LucideIcon 
} from 'lucide-react'
import type { BudgetCategoryValue } from '@/hooks/useTripBudget'

export interface CategoryConfig {
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
  textColor: string
}

export const CATEGORY_CONFIG: Record<BudgetCategoryValue, CategoryConfig> = {
  accommodation: {
    icon: Home,
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-600',
  },
  transportation: {
    icon: Plane,
    color: 'purple',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-600',
  },
  food: {
    icon: UtensilsCrossed,
    color: 'orange',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-600',
  },
  activities: {
    icon: Ticket,
    color: 'green',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500',
    textColor: 'text-green-600',
  },
  shopping: {
    icon: ShoppingBag,
    color: 'pink',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-600',
  },
  misc: {
    icon: MoreHorizontal,
    color: 'gray',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500',
    textColor: 'text-gray-600',
  },
}

