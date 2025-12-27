import { ApiClient } from './api/baseClient'
import { authApi, type AuthApi } from './api/authApi'
import { profileApi, type ProfileApi } from './api/profileApi'
import { tripsApi, type TripsApi, itineraryApi, type ItineraryApi } from './api/tripsApi'
import { destinationsApi, type DestinationsApi } from './api/destinationsApi'
import { weatherApi, type WeatherApi } from './api/weatherApi'
import { placesApi, type PlacesApi } from './api/placesApi'
import { aiApi, type AiApi } from './api/aiApi'
import { hotelsApi, type HotelsApi } from './api/hotelsApi'

class ApiService extends ApiClient {}

Object.assign(ApiService.prototype, authApi, profileApi, tripsApi, itineraryApi, destinationsApi, weatherApi, placesApi, aiApi, hotelsApi)

interface ApiService extends AuthApi, ProfileApi, TripsApi, ItineraryApi, DestinationsApi, WeatherApi, PlacesApi, AiApi, HotelsApi {}

export const apiService = new ApiService()


