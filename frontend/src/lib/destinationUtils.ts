import type { Destination } from '@/types/destination'
import defaultDestinationImage from '@/assets/images/default_destination.jpg'

export const DEFAULT_DESTINATION_IMAGE = defaultDestinationImage

/**
 * Gets destination image by ID, falls back to default if not found
 */
export const getDestinationImageById = (
  destinationId: number | null | undefined,
  destinationsList: Destination[]
): string => {
  if (destinationId == null) {
    return DEFAULT_DESTINATION_IMAGE
  }

  const destination = destinationsList.find((d) => d.id === destinationId)
  return destination?.imageUrl || DEFAULT_DESTINATION_IMAGE
}

/**
 * Finds destination by ID in a list
 */
export const getDestinationById = (destinationsList: Destination[], id: number): Destination | undefined => {
  return destinationsList.find(destination => destination.id === id);
};

const norm = (s: string) => s.trim().toLowerCase()

export function findDestinationByHeatmapLabels(
  destinationName: string,
  destinationLocation: string,
  destinationsList: Destination[]
): Destination | undefined {
  const n = norm(destinationName)
  const l = norm(destinationLocation)
  const exact = destinationsList.find((d) => norm(d.title) === n && norm(d.location) === l)
  if (exact) return exact
  return destinationsList.find((d) => norm(d.title) === n)
}

/**
 * Filters destinations by continent
 */
export const getDestinationsByContinent = (destinationsList: Destination[], continent: string): Destination[] => {
  return destinationsList.filter(destination => 
    destination.continent?.toLowerCase() === continent.toLowerCase()
  );
};

/**
 * Checks if destination has all required fields for full card display
 */
export const hasFullDestinationDetails = (destination: Destination): boolean => {
  return !!(
    destination.imageUrl &&
    destination.overview &&
    destination.budgetPerDay !== undefined &&
    destination.budgetPerDay !== null
  );
};

/**
 * Gets destinations with full details, optionally filtered by continent
 */
export const getPopularDestinations = (destinationsList: Destination[], continent?: string): Destination[] => {
  const filtered = continent 
    ? destinationsList.filter(dest => dest.continent === continent)
    : destinationsList;
  
  // Return only destinations with full details (required for displaying cards)
  return filtered.filter(hasFullDestinationDetails);
};

/**
 * Gets unique country names from destinations, optionally filtered by continent
 */
export const getPopularCountries = (destinationsList: Destination[], continent?: string): string[] => {
  const filtered = continent 
    ? destinationsList.filter(dest => dest.continent === continent)
    : destinationsList;
  
  const uniqueCountries = Array.from(new Set(filtered.map(dest => dest.location)));
  
  return uniqueCountries.sort();
};

