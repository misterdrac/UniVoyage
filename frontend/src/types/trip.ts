export interface Trip {
  id: number;
  userId: number;
  destinationId: number;
  destinationName: string;
  destinationLocation: string;
  departureDate: string; // ISO date string
  returnDate: string; // ISO date string
  createdAt: string; // ISO date string
  status: 'planned' | 'ongoing' | 'completed';
}

export interface CreateTripRequest {
  destinationId: number;
  destinationName: string;
  destinationLocation: string;
  departureDate: string;
  returnDate: string;
}

/** Matches backend TripCurrencyResponse — rate is destination per 1 unit of base */
export interface TripCurrencyInfo {
  destinationCurrencyCode: string;
  destinationCurrencyName: string;
  baseCurrencyCode: string;
  exchangeRate: number;
}

