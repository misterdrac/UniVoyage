import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, X } from 'lucide-react';
import { type Option } from '@/components/ui/autocomplete';
import { DestinationAutoComplete } from '@/components/ui/destination-autocomplete';
import { Button } from '@/components/ui/button';
import { getPopularDestinations } from '@/lib/destinationUtils';
import { useDestinations } from '@/hooks/useDestinations';
import { useDestination } from '@/contexts/DestinationContext';
import { cn } from '@/lib/utils';
import { ROUTE_PATHS } from '@/config/routes';

interface DestinationPickerProps {
  continent?: string;
}

export const DestinationPicker = ({ continent }: DestinationPickerProps) => {
  const {
    selectedCountry,
    selectedDestination,
    setCountry,
    setDestination,
    getPlanTripDestination,
  } = useDestination();
  const navigate = useNavigate();
  const { destinations: apiDestinations } = useDestinations();

  // Get unique countries from destinations, filtered by continent if provided
  const countryOptions: Option[] = useMemo(() => {
    const filteredDestinations = continent 
      ? apiDestinations.filter(dest => dest.continent === continent)
      : apiDestinations;
    
    const uniqueCountries = Array.from(new Set(filteredDestinations.map(dest => dest.location)));
    return uniqueCountries
      .sort()
      .map(location => ({
        value: location,
        label: location,
        location: location
      }));
  }, [apiDestinations, continent]);

  // Popular destinations - major destinations from all continents
  const popularDestinations: Option[] = useMemo(() => {
    return getPopularDestinations(apiDestinations, continent).map(dest => ({
      value: dest.id.toString(),
      label: dest.title,
      location: dest.location
    }));
  }, [apiDestinations, continent]);

  // Convert destinations to options for autocomplete, filtered by continent and selected country
  const destinationOptions: Option[] = useMemo(() => {
    let filtered = continent 
      ? apiDestinations.filter(dest => dest.continent === continent)
      : apiDestinations;
    
    if (selectedCountry) {
      filtered = filtered.filter(dest => dest.location === selectedCountry.label);
    }
    
    return filtered.map(dest => ({
      value: dest.id.toString(),
      label: dest.title,
      location: dest.location,
      imageUrl: dest.imageUrl || '',
    }));
  }, [apiDestinations, selectedCountry, continent]);

  const handleCountryChange = (option: Option | undefined) => {
    setCountry(option);
    setDestination(undefined);
  };

  const handlePlanTrip = useCallback(() => {
    const destination = getPlanTripDestination();
    if (!destination) return;

    navigate(ROUTE_PATHS.PLAN_TRIP, { state: destination });
  }, [getPlanTripDestination, navigate]);

  return (
    <div className="relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Country Selection */}
        <div className="relative md:col-span-3">
          <label className="text-xs text-muted-foreground mb-1.5 block">Country</label>
          <div className="relative">
            <DestinationAutoComplete
              options={countryOptions}
              placeholder="Select a country..."
              emptyMessage="No countries found"
              value={selectedCountry}
              onValueChange={handleCountryChange}
              maxResults={countryOptions.length}
            />
            {selectedCountry && (
              <button
                type="button"
                onClick={() => {
                  setCountry(undefined);
                  setDestination(undefined);
                }}
                className={cn(
                  "cursor-pointer absolute right-3 top-1/2 -translate-y-1/2",
                  "h-4 w-4 rounded-full bg-muted hover:bg-muted-foreground/20",
                  "flex items-center justify-center transition-colors"
                )}
                aria-label="Clear country selection"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Destination Selection */}
        <div className="relative md:col-span-6">
          <label className="text-xs text-muted-foreground mb-1.5 block">Destination</label>
          <div className="relative">
            <DestinationAutoComplete
              options={destinationOptions}
              placeholder="Search for a destination..."
              emptyMessage="No destinations found"
              value={selectedDestination}
              onValueChange={(option) => {
                setDestination(option);
                if (option && option.location) {
                  const countryOption = countryOptions.find(
                    country => country.value === option.location
                  );
                  if (countryOption && !selectedCountry) {
                    setCountry(countryOption);
                  }
                }
              }}
              popularOptions={!selectedCountry ? popularDestinations : undefined}
              popularLabel="You Might Like"
            />
            {selectedDestination && (
              <button
                type="button"
                onClick={() => setDestination(undefined)}
                className={cn(
                  "cursor-pointer absolute right-3 top-1/2 -translate-y-1/2",
                  "h-4 w-4 rounded-full bg-muted hover:bg-muted-foreground/20",
                  "flex items-center justify-center transition-colors"
                )}
                aria-label="Clear destination selection"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Plan Trip Button */}
        <div className="md:col-span-3 flex flex-col">
          <label className="text-xs text-muted-foreground mb-1.5 block">&nbsp;</label>
          <Button 
            onClick={handlePlanTrip}
            className="cursor-pointer w-full h-12 text-base"
            disabled={!selectedDestination}
          >
            <Plane className="mr-2 h-5 w-5" />
            Plan Trip
          </Button>
        </div>
      </div>
    </div>
  );
};

