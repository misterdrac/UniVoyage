import { useMemo } from 'react';
import type { Option } from '@/components/ui/autocomplete';
import type { Destination } from '@/data/destinations';

interface UseFilteredDestinationsParams {
  destinations: Destination[];
  selectedCountry: Option | undefined;
  selectedDestination?: Option | undefined;
}

/**
 * Hook to filter destinations based on selected country or return all destinations
 * Excludes the selected destination from the results
 */
export const useFilteredDestinations = ({ 
  destinations, 
  selectedCountry,
  selectedDestination,
}: UseFilteredDestinationsParams) => {
  const filteredDestinations = useMemo(() => {
    let filtered: Destination[];
    
    // Filter by country if selected, otherwise return all
    if (selectedCountry) {
      filtered = destinations.filter(dest => dest.location === selectedCountry.label);
    } else {
      filtered = destinations;
    }

    // Exclude selected destination if one is selected
    if (selectedDestination) {
      const selectedId = parseInt(selectedDestination.value);
      filtered = filtered.filter(dest => dest.id !== selectedId);
    }

    // Filter out minimal destinations (only show destinations with full details)
    filtered = filtered.filter(dest => dest.imageUrl !== undefined);

    return filtered;
  }, [destinations, selectedCountry, selectedDestination]);

  return filteredDestinations;
};

