/**
 * Hotel cache utility
 * Provides functions to clear hotel cache data
 */

const CACHE_KEY_PREFIX = 'univoyage_hotels_'

/**
 * Clear all hotel cache from localStorage
 */
export const clearAllHotelCache = (): void => {
  try {
    if (typeof window === 'undefined') return
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Error clearing all hotel cache:', error)
  }
}

