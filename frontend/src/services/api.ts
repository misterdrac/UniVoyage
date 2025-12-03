import { ApiClient } from './api/baseClient'
import { authApi, type AuthApi } from './api/authApi'
import { profileApi, type ProfileApi } from './api/profileApi'
import { tripsApi, type TripsApi, itineraryApi, type ItineraryApi } from './api/tripsApi'

class ApiService extends ApiClient {}

Object.assign(ApiService.prototype, authApi, profileApi, tripsApi, itineraryApi)

interface ApiService extends AuthApi, ProfileApi, TripsApi, ItineraryApi {}

export const apiService = new ApiService()


