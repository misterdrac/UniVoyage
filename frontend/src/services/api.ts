import { ApiClient } from './api/baseClient'
import { authApi, type AuthApi } from './api/authApi'
import { profileApi, type ProfileApi } from './api/profileApi'
import { tripsApi, type TripsApi, itineraryApi, type ItineraryApi } from './api/tripsApi'
import { destinationsApi, type DestinationsApi } from './api/destinationsApi'
import { weatherApi, type WeatherApi } from './api/weatherApi'
import { placesApi, type PlacesApi } from './api/placesApi'
import { aiApi, type AiApi } from './api/aiApi'
import { hotelsApi, type HotelsApi } from './api/hotelsApi'
import { adminApi, type AdminApi } from './api/adminApi'

/**
 * Main API service class
 * Extends ApiClient and combines all API modules into a single service instance
 * Provides access to all API endpoints through a unified interface
 */
class ApiService extends ApiClient {}

// Mix in all API modules into the service prototype
Object.assign(ApiService.prototype, authApi, profileApi, tripsApi, itineraryApi, destinationsApi, weatherApi, placesApi, aiApi, hotelsApi, adminApi)

/**
 * Combined API service interface
 * Includes all API modules: Auth, Profile, Trips, Itinerary, Destinations, Weather, Places, AI, Hotels, and Admin
 */
interface ApiService extends AuthApi, ProfileApi, TripsApi, ItineraryApi, DestinationsApi, WeatherApi, PlacesApi, AiApi, HotelsApi, AdminApi {}

/**
 * Singleton API service instance
 * Use this instance throughout the application to make API calls
 * 
 * @example
 * ```ts
 * import { apiService } from '@/services/api'
 * 
 * const result = await apiService.login(email, password)
 * const trips = await apiService.getTrips()
 * ```
 */
export const apiService = new ApiService()


