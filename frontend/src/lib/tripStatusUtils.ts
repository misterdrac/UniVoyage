export type TripStatus = 'planned' | 'ongoing' | 'completed' | string

export interface TripStatusConfig {
  bg: string
  text: string
  border: string
  icon: string
}

export const getStatusConfig = (status: TripStatus): TripStatusConfig => {
  switch (status) {
    case 'planned':
      return {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        border: 'border-blue-500/40',
        icon: '📅',
      }
    case 'ongoing':
      return {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/40',
        icon: '✈️',
      }
    case 'completed':
      return {
        bg: 'bg-gray-500/20',
        text: 'text-gray-400',
        border: 'border-gray-500/40',
        icon: '✓',
      }
    default:
      return {
        bg: 'bg-gray-500/20',
        text: 'text-gray-400',
        border: 'border-gray-500/40',
        icon: '📋',
      }
  }
}


