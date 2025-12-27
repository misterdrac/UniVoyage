import { Card, CardContent } from '@/components/ui/card'
import { Hotel, Loader2, AlertCircle, RefreshCw, Building, ExternalLink, MapPin, Star, Users, Phone, Save, Check } from 'lucide-react'
import type { Trip } from '@/types/trip'
import { useHotels } from '@/hooks/useHotels'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { apiService } from '@/services/api'

interface TripAccommodationSectionProps {
  trip: Trip
}

interface BookingPartner {
  name: string
  description: string
  url: string
  icon: React.ReactNode
  color: string
  bestFor: string
}

export function TripAccommodationSection({ trip }: TripAccommodationSectionProps) {
  const cityName = trip.destinationName || trip.destinationLocation
  const [displayCount, setDisplayCount] = useState(6)
  
  // State for user's saved accommodation details
  const [accommodationName, setAccommodationName] = useState('')
  const [accommodationAddress, setAccommodationAddress] = useState('')
  const [accommodationPhone, setAccommodationPhone] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  const checkIn = trip.departureDate
  const checkOut = trip.returnDate

  // Fetch hotel suggestions for the destination city
  const { hotels, isLoading, error, refetch } = useHotels({
    city: cityName,
    limit: 10,
    enabled: !!cityName,
  })

  // Reset display count when hotels list changes
  useEffect(() => {
    setDisplayCount(6)
  }, [hotels.length])

  // Slice hotels array to show only displayed count
  const displayedHotels = hotels.slice(0, displayCount)
  const canLoadMore = hotels.length > displayCount

  // Load more hotels incrementally
  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 6, hotels.length))
  }

  const formatDateForBooking = (dateStr: string | undefined) => {
    return dateStr || ''
  }

  const safeCityName = cityName || 'destination'
  // Booking partner configurations with URLs and metadata
  const bookingPartners: BookingPartner[] = [
    {
      name: 'Hostelworld',
      description: 'The cheapest accommodation option. Find hostels, shared rooms, and budget-friendly stays perfect for students.',
      url: `https://www.hostelworld.com/st/hostels/${encodeURIComponent(safeCityName.toLowerCase().replace(/\s+/g, '-'))}/?dateFrom=${formatDateForBooking(checkIn)}&dateTo=${formatDateForBooking(checkOut)}`,
      icon: <Users className="h-8 w-8" />,
      color: 'from-orange-500 to-red-500',
      bestFor: 'Cheapest Option',
    },
    {
      name: 'Booking.com',
      description: 'Wide selection of hotels, apartments, and hostels with free cancellation options and flexible booking.',
      url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(safeCityName)}&checkin=${formatDateForBooking(checkIn)}&checkout=${formatDateForBooking(checkOut)}`,
      icon: <Building className="h-8 w-8" />,
      color: 'from-blue-500 to-blue-700',
      bestFor: 'Hotels & Apartments',
    },
  ]

  // Save user's accommodation details to backend
  const handleSave = async () => {
    try {
      const result = await apiService.saveTripAccommodation(trip.id, {
        accommodationName: accommodationName.trim() || undefined,
        accommodationAddress: accommodationAddress.trim() || undefined,
        accommodationPhone: accommodationPhone.trim() || undefined,
      })

      if (result.success) {
        setIsSaved(true)
        toast.success('Accommodation details saved!')
      } else {
        toast.error(result.error || 'Failed to save accommodation details')
      }
    } catch (err) {
      toast.error('Failed to save accommodation details')
    }
  }

  const hasAccommodationInfo = accommodationName.trim() || accommodationAddress.trim() || accommodationPhone.trim()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Accommodation in {cityName}
        </h3>
        <p className="text-sm text-muted-foreground">
          Save your booking details or find accommodation from our trusted partners
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* User's saved accommodation info card with input fields */}
        <Card className="h-full overflow-hidden border-2 border-primary/30 transition-all duration-300 hover:shadow-xl hover:border-primary/50">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-5 text-white">
              <div className="flex items-center justify-between">
                <Hotel className="h-8 w-8" />
                {isSaved && (
                  <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    <Check className="h-3 w-3" />
                    Saved
                  </span>
                )}
              </div>
              <h4 className="text-lg font-bold mt-3">My Accommodation</h4>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-2 inline-block">
                Your Booking
              </span>
            </div>
            <div className="p-4 space-y-3">
              <Input
                value={accommodationName}
                onChange={(e) => { setAccommodationName(e.target.value); setIsSaved(false) }}
                placeholder="Hotel / Hostel name"
                className="h-9 text-sm"
              />
              <Input
                value={accommodationAddress}
                onChange={(e) => { setAccommodationAddress(e.target.value); setIsSaved(false) }}
                placeholder="Address"
                className="h-9 text-sm"
              />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={accommodationPhone}
                    onChange={(e) => { setAccommodationPhone(e.target.value); setIsSaved(false) }}
                    placeholder="Phone"
                    type="tel"
                    className="h-9 text-sm pl-8"
                  />
                </div>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={!hasAccommodationInfo || isSaved}
                  className="h-9 px-3"
                >
                  {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hostelworld booking partner card */}
        <a
          href={bookingPartners[0].url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <Card className="h-full overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
            <CardContent className="p-0 flex flex-col h-full">
              <div className={cn('bg-gradient-to-r p-5 text-white', bookingPartners[0].color)}>
                <div className="flex items-center justify-between">
                  {bookingPartners[0].icon}
                  <ExternalLink className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-lg font-bold mt-3">{bookingPartners[0].name}</h4>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-2 inline-block">
                  {bookingPartners[0].bestFor}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="text-sm text-muted-foreground mb-3">{bookingPartners[0].description}</p>
                <div className="text-xs text-muted-foreground mb-3 space-y-1">
                  <p>✓ Dorm beds from $10/night</p>
                  <p>✓ Social atmosphere</p>
                  <p>✓ Free cancellation</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-auto">
                  Search Hostels
                </Button>
              </div>
            </CardContent>
          </Card>
        </a>

        {/* Booking.com partner card */}
        <a
          href={bookingPartners[1].url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <Card className="h-full overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
            <CardContent className="p-0 flex flex-col h-full">
              <div className={cn('bg-gradient-to-r p-5 text-white', bookingPartners[1].color)}>
                <div className="flex items-center justify-between">
                  {bookingPartners[1].icon}
                  <ExternalLink className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-lg font-bold mt-3">{bookingPartners[1].name}</h4>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-2 inline-block">
                  {bookingPartners[1].bestFor}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="text-sm text-muted-foreground mb-3">{bookingPartners[1].description}</p>
                <div className="text-xs text-muted-foreground mb-3 space-y-1">
                  <p>✓ 28M+ listings worldwide</p>
                  <p>✓ Price match guarantee</p>
                  <p>✓ No booking fees</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-auto">
                  Search Hotels
                </Button>
              </div>
            </CardContent>
          </Card>
        </a>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Hotel className="h-5 w-5 text-muted-foreground" />
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Popular Hotels in {cityName}
          </h4>
        </div>

        {/* Loading state for hotel suggestions */}
        {isLoading ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading hotel suggestions...</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <>
            {/* Error state with retry option */}
            <Card className={error === 'NO_HOTELS_FOUND' ? 'border-muted bg-muted/30' : 'border-destructive/50 bg-destructive/5'}>
            <CardContent className="py-8 text-center">
              {error === 'NO_HOTELS_FOUND' ? (
                <>
                  <Hotel className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-foreground font-medium mb-2">No hotel suggestions available</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    We couldn't find hotel data for {cityName} in our database. 
                    Don't worry! You can still use the booking options above to find great accommodation.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-destructive font-medium mb-2">Couldn't load hotel suggestions</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    There was an issue loading hotel data. Please try again or use the booking options above.
                  </p>
                  <Button variant="outline" size="sm" onClick={refetch}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try again
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          </>
        ) : hotels.length > 0 ? (
          <>
            {/* Grid of hotel suggestion cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayedHotels.map((hotel, index) => (
                <a
                  key={hotel.hotelId || index}
                  href={`https://www.google.com/search?q=${encodeURIComponent(hotel.hotelName + ' ' + cityName + ' booking')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {hotel.hotelName}
                          </h5>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{cityName}</span>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>

            {/* Load more button when more hotels are available */}
            {canLoadMore && (
              <div className="flex justify-center pt-2">
                <Button variant="ghost" size="sm" onClick={handleLoadMore} className="text-muted-foreground">
                  Show more suggestions
                </Button>
              </div>
            )}
          </>
        ) : !isLoading && !error ? (
          <Card className="border-muted bg-muted/30">
            <CardContent className="py-8 text-center">
              <Hotel className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-foreground font-medium mb-2">No hotel suggestions available</p>
              <p className="text-sm text-muted-foreground">
                We couldn't find hotel data for {cityName} in our database. 
                Don't worry! You can still use the booking options above to find great accommodation.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Student travel tip card */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h5 className="text-sm font-medium text-foreground">Student Travel Tip</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Hostels are often the best value for students. They offer social atmospheres, 
                shared kitchens to save on food, and opportunities to meet other travelers. 
                Book early for the best rates!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
