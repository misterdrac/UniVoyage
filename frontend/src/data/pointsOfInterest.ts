export interface PointOfInterest {
  id: string
  name: string
  category: string
  description?: string
  address: string
  rating?: number
  website?: string
}

// Mock data for popular destinations
// Generic POIs covering all category types for display purposes
export const pointsOfInterestByCity: Record<string, PointOfInterest[]> = {
  // Generic list - shows all category types with color-coded borders
  'Default': [
    {
      id: 'poi-1',
      name: 'Historic Landmark',
      category: 'Landmark',
      description: 'Iconic landmark and symbol of the city',
      address: 'City Center, Main Street',
      rating: 4.6
    },
    {
      id: 'poi-2',
      name: 'Art Museum',
      category: 'Museum',
      description: 'World-renowned museum featuring art and history',
      address: 'Cultural District, Museum Quarter',
      rating: 4.7
    },
    {
      id: 'poi-3',
      name: 'Central Park',
      category: 'Park',
      description: 'Large urban park perfect for relaxation and recreation',
      address: 'City Park District',
      rating: 4.6
    },
    {
      id: 'poi-4',
      name: 'Historic Cathedral',
      category: 'Religious Site',
      description: 'Beautiful historic place of worship',
      address: 'Old Town Square',
      rating: 4.7
    },
    {
      id: 'poi-5',
      name: 'Historic Quarter',
      category: 'Neighborhood',
      description: 'Charming neighborhood with narrow streets and local culture',
      address: 'Historic District',
      rating: 4.5
    },
    {
      id: 'poi-6',
      name: 'City Beach',
      category: 'Beach',
      description: 'Popular beach destination with beautiful coastline',
      address: 'Coastal Area',
      rating: 4.6
    },
    {
      id: 'poi-7',
      name: 'Local Market',
      category: 'Market',
      description: 'Vibrant market with local produce and crafts',
      address: 'Market Square',
      rating: 4.3
    },
    {
      id: 'poi-8',
      name: 'Entertainment District',
      category: 'Entertainment',
      description: 'Hub of nightlife, theaters, and entertainment venues',
      address: 'Entertainment Quarter',
      rating: 4.4
    },
    {
      id: 'poi-9',
      name: 'Adventure Activity',
      category: 'Activity',
      description: 'Exciting outdoor activity and adventure experience',
      address: 'Adventure Center',
      rating: 4.5
    },
    {
      id: 'poi-10',
      name: 'Famous Street',
      category: 'Street',
      description: 'Iconic street known for shopping and dining',
      address: 'Main Shopping Street',
      rating: 4.4
    },
    {
      id: 'poi-11',
      name: 'Shopping District',
      category: 'Shopping & Dining',
      description: 'Premier shopping and dining destination',
      address: 'Shopping Quarter',
      rating: 4.5
    }
  ]
}

/**
 * Get points of interest for a given city
 * @param cityName - Name of the city
 * @returns Array of points of interest for the city, or Default list with all categories if city not found
 */
export function getPointsOfInterestForCity(cityName: string): PointOfInterest[] {
  // Try exact match first
  if (pointsOfInterestByCity[cityName]) {
    return pointsOfInterestByCity[cityName]
  }

  // Try case-insensitive match
  const cityKey = Object.keys(pointsOfInterestByCity).find(
    key => key.toLowerCase() === cityName.toLowerCase()
  )

  if (cityKey) {
    return pointsOfInterestByCity[cityKey]
  }

  // Return Default list with all category types if city not found
  return pointsOfInterestByCity['Default']
}
