import { ApiClient } from './api/baseClient'
import { authApi, type AuthApi } from './api/authApi'
import { profileApi, type ProfileApi } from './api/profileApi'
import { tripsApi, type TripsApi, itineraryApi, type ItineraryApi } from './api/tripsApi'
import { destinationsApi, type DestinationsApi } from './api/destinationsApi'

class ApiService extends ApiClient {}

Object.assign(ApiService.prototype, authApi, profileApi, tripsApi, itineraryApi, destinationsApi)

interface ApiService extends AuthApi, ProfileApi, TripsApi, ItineraryApi, DestinationsApi {}

export const apiService = new ApiService()


