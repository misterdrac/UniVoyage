import { Button } from "@/components/ui/button";
import { ROUTE_PATHS } from "@/config/routes";
import { useAuth } from "@/contexts/AuthContext";
import { useTrips } from "@/contexts/TripContext";
import { useDestinations } from "@/hooks/useDestinations";
import { formatDateLong } from "@/lib/dateUtils";
import { getDestinationImageById } from "@/lib/destinationUtils";
import type { Trip } from "@/types/trip";
import { ArrowRight, CalendarDays, Globe, MapPinned, Plane } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const getGreeting = (date: Date): string => {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
};

const getFirstName = (fullName?: string): string => {
  if (!fullName) {
    return "Traveler";
  }

  const normalized = fullName.trim();
  if (!normalized) {
    return "Traveler";
  }

  return normalized.split(/\s+/)[0];
};

const getCountryFromLocation = (location: string): string => {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return location.trim();
  }

  return parts[parts.length - 1];
};

const isTripInYear = (trip: Trip, year: number): boolean => {
  const departureYear = new Date(trip.departureDate).getFullYear();
  const returnYear = new Date(trip.returnDate).getFullYear();

  return departureYear === year || returnYear === year;
};

export function PersonalizedHeroCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trips } = useTrips();
  const { destinations } = useDestinations();
  const [imageLoaded, setImageLoaded] = useState(false);

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const currentYear = now.getFullYear();

  const firstName = getFirstName(user?.name);
  const greeting = getGreeting(now);

  const nextTrip = useMemo(() => {
    const upcomingTrips = trips
      .filter((trip) => new Date(trip.departureDate) >= today)
      .sort(
        (a, b) =>
          new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
      );

    return upcomingTrips[0];
  }, [today, trips]);

  const nextTripImageUrl = useMemo(() => {
    if (!nextTrip) return null;
    return getDestinationImageById(nextTrip.destinationId, destinations);
  }, [nextTrip, destinations]);

  const thisYearStats = useMemo(() => {
    const thisYearTrips = trips.filter((trip) => isTripInYear(trip, currentYear));
    const finishedTripsThisYear = thisYearTrips.filter(
      (trip) => new Date(trip.returnDate) <= now
    );

    const uniqueDestinations = new Set(
      finishedTripsThisYear.map((trip) => trip.destinationName.trim().toLowerCase())
    );

    const uniqueCountries = new Set(
      finishedTripsThisYear
        .map((trip) => getCountryFromLocation(trip.destinationLocation).toLowerCase())
        .filter(Boolean)
    );

    return {
      trips: thisYearTrips.length,
      destinations: uniqueDestinations.size,
      countries: uniqueCountries.size,
    };
  }, [currentYear, now, trips]);

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-card/85 p-5 shadow-2xl backdrop-blur-md md:p-6">
      <div className="mb-4 text-center md:text-left">
        <p className="text-sm font-medium text-primary">{greeting}, {firstName}</p>
        <h1 className="mt-1 text-3xl font-bold leading-tight text-foreground md:text-4xl">
          Ready for your next adventure?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Here's a quick look at what's ahead and how far you've come.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-background/85">
        {nextTrip ? (
          <div className="flex">
            <div className="flex-1 p-3 md:p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Plane className="h-4 w-4 text-primary" />
                Next trip
              </div>

              <h2 className="text-lg font-semibold text-foreground md:text-xl">{nextTrip.destinationName}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{nextTrip.destinationLocation}</p>

              <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-primary/10 px-2.5 py-1 text-sm text-primary">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {formatDateLong(nextTrip.departureDate)} - {formatDateLong(nextTrip.returnDate)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => navigate(ROUTE_PATHS.TRIP_DETAIL(nextTrip.id))}>
                  View trip details
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate(ROUTE_PATHS.MY_TRIPS)}>
                  Open My Trips
                </Button>
              </div>
            </div>

            {nextTripImageUrl && (
              <div className="relative hidden w-28 shrink-0 sm:block md:w-32">
                {!imageLoaded && (
                  <div className="absolute inset-0 animate-pulse bg-muted" />
                )}
                <img
                  src={nextTripImageUrl}
                  alt={nextTrip.destinationName}
                  onLoad={() => setImageLoaded(true)}
                  className={`h-full w-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 md:p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              No upcoming trips yet
            </div>

            <p className="text-sm text-muted-foreground md:text-base">
              Start planning your next adventure. Pick a destination and lock in your dates.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => navigate(ROUTE_PATHS.DESTINATIONS)}>Plan a trip</Button>
              <Button variant="outline" onClick={() => navigate(ROUTE_PATHS.DESTINATIONS)}>
                Browse destinations
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-background/80 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">This year</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{thisYearStats.trips}</p>
          <p className="text-xs text-muted-foreground">Trips</p>
        </div>

        <div className="rounded-lg border border-border/60 bg-background/80 p-3">
          <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
            <MapPinned className="h-3.5 w-3.5" />
            Destinations
          </div>
          <p className="mt-1 text-xl font-semibold text-foreground">{thisYearStats.destinations}</p>
          <p className="text-xs text-muted-foreground">Visited</p>
        </div>

        <div className="rounded-lg border border-border/60 bg-background/80 p-3">
          <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            Countries
          </div>
          <p className="mt-1 text-xl font-semibold text-foreground">{thisYearStats.countries}</p>
          <p className="text-xs text-muted-foreground">Visited</p>
        </div>
      </div>
    </div>
  );
}