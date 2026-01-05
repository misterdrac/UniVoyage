import { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, X, Loader2 } from 'lucide-react';
import { type Option } from '@/components/ui/autocomplete';
import { DestinationAutoComplete } from '@/components/ui/destination-autocomplete';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from './DateRangePicker';
import { getPopularDestinations } from '@/data/destinations';
import { useDestinations } from '@/hooks/useDestinations';
import type { DateRange } from 'react-day-picker';
import { useDestination } from '@/contexts/DestinationContext';
import { cn } from '@/lib/utils';

interface DestinationPickerProps {
  continent?: string;
}

export const DestinationPicker = ({ continent }: DestinationPickerProps) => {
  const {
    selectedCountry,
    selectedDestination,
    dateRange,
    setCountry,
    setDestination,
    setDateRange,
    planTrip
  } = useDestination();
  const navigate = useNavigate();
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
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
      location: dest.location
    }));
  }, [apiDestinations, selectedCountry, continent]);

  // Reset destination when country changes
  const handleCountryChange = (option: Option | undefined) => {
    setCountry(option);
    setDestination(undefined);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  // Helper function to format date as YYYY-MM-DD in local timezone (not UTC)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle plan trip button click
  const handlePlanTrip = useCallback(async () => {
    if (!selectedDestination || !dateRange?.from || !dateRange?.to) {
      return;
    }

    setIsCreatingTrip(true);
    try {
      const result = await planTrip({
        destination: selectedDestination,
        departDate: formatDateLocal(dateRange.from),
        returnDate: formatDateLocal(dateRange.to)
      });

      if (result.success) {
        // Navigate to My Trips page using client-side navigation
        navigate('/my-trips', { replace: false });
      }
    } catch (error) {
      console.error('Error creating trip:', error);
    } finally {
      setIsCreatingTrip(false);
    }
  }, [selectedDestination, dateRange, planTrip, navigate]);

  return (
    <div className="relative z-10">
      {/* Country, Destination, Date, and Button in one row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Country Selection */}
        <div className="relative md:col-span-2">
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
                  "absolute right-3 top-1/2 -translate-y-1/2",
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
        <div className="relative md:col-span-4">
          <label className="text-xs text-muted-foreground mb-1.5 block">Destination</label>
          <div className="relative">
            <DestinationAutoComplete
              options={destinationOptions}
              placeholder="Search for a destination..."
              emptyMessage="No destinations found"
              value={selectedDestination}
              onValueChange={(option) => {
                setDestination(option);
                // Auto-set country if not already set
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
                  "absolute right-3 top-1/2 -translate-y-1/2",
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

        {/* Date Range Selection */}
        <div className="relative md:col-span-4">
          <label className="text-xs text-muted-foreground mb-1.5 block">Depart - Return</label>
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>

        {/* Plan Trip Button */}
        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs text-muted-foreground mb-1.5 block">&nbsp;</label>
          <Button 
            onClick={handlePlanTrip}
            className="w-full h-12 text-base"
            disabled={!selectedDestination || !dateRange?.from || !dateRange?.to || isCreatingTrip}
          >
            {isCreatingTrip ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plane className="mr-2 h-5 w-5" />
                Plan Trip
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

