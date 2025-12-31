/**
 * Destination types and helper functions
 * All destination data is now fetched from the backend API
 */

// Destination data structure
export interface Destination {
  id: number;
  title: string;
  location: string;
  continent?: string;
  // Optional fields for full destination cards
  imageUrl?: string;
  imageAlt?: string;
  overview?: string;
  budgetPerDay?: number;
  whyVisit?: string;
  studentPerks?: string[];
}

// ======================================================================
// HELPER FUNCTIONS - These work with destinations arrays from API
// ======================================================================

// Helper functions for destination data
export const getDestinationById = (destinationsList: Destination[], id: number): Destination | undefined => {
  return destinationsList.find(destination => destination.id === id);
};

export const getDestinationsByContinent = (destinationsList: Destination[], continent: string): Destination[] => {
  return destinationsList.filter(destination => 
    destination.continent?.toLowerCase() === continent.toLowerCase()
  );
};

/**
 * Check if a destination has all required fields for displaying a full destination card
 * @param destination Destination to check
 * @returns true if destination has imageUrl, overview, and budgetPerDay
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
 * Get destinations with full details (required for displaying cards)
 * Optionally filtered by continent
 * @param destinationsList Array of destinations to filter from
 * @param continent Optional continent filter
 * @returns Array of destinations with full details (imageUrl, overview, budgetPerDay)
 */
export const getPopularDestinations = (destinationsList: Destination[], continent?: string): Destination[] => {
  const filtered = continent 
    ? destinationsList.filter(dest => dest.continent === continent)
    : destinationsList;
  
  // Return only destinations with full details (required for displaying cards)
  return filtered.filter(hasFullDestinationDetails);
};

/**
 * Get popular countries based on available destinations, optionally filtered by continent
 * @param destinationsList Array of destinations to filter from
 * @param continent Optional continent filter
 * @returns Array of unique country names
 */
export const getPopularCountries = (destinationsList: Destination[], continent?: string): string[] => {
  const filtered = continent 
    ? destinationsList.filter(dest => dest.continent === continent)
    : destinationsList;
  
  const uniqueCountries = Array.from(new Set(filtered.map(dest => dest.location)));
  
  return uniqueCountries.sort();
};
