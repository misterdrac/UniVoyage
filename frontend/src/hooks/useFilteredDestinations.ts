import { useMemo } from 'react';
import type { Option } from '@/components/ui/autocomplete';
import type { Destination } from '@/data/destinations';

interface UseFilteredDestinationsParams {
  destinations: Destination[];
  selectedCountry: Option | undefined;
  randomCount?: number;
}

/**
 * Hook to filter destinations based on selected country or return random destinations
 */
export const useFilteredDestinations = ({ 
  destinations, 
  selectedCountry, 
  randomCount = 6 
}: UseFilteredDestinationsParams) => {
  const getRandomDestinations = (count: number) => {
    const shuffled = [...destinations].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const filteredDestinations = useMemo(() => {
    if (selectedCountry) {
      return destinations.filter(dest => dest.location === selectedCountry.label);
    }
    return getRandomDestinations(randomCount);
  }, [destinations, selectedCountry, randomCount]);

  return filteredDestinations;
};

