import { useMemo } from 'react';
import { DestinationsPageLayout, LoadingSpinner } from '@/components/destinations';
import { getDestinationsByContinent } from '@/data/destinations';
import { useDestinations } from '@/hooks/useDestinations';

const NorthAmericaDestinationsPage = () => {
  const { destinations: apiDestinations, isLoading } = useDestinations();
  
  const northAmericaDestinations = useMemo(() => 
    getDestinationsByContinent(apiDestinations, 'North America'),
    [apiDestinations]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <LoadingSpinner loadingCountry="" />
        </div>
      </div>
    );
  }

  return (
    <DestinationsPageLayout
      title="Explore North America"
      description={
        <p className="text-center text-lg sm:text-xl text-muted-foreground">
          From the bustling streets of New York and Los Angeles to the vibrant cities of Canada and Mexico, 
          North America offers diverse landscapes, cultures, and experiences. Explore iconic cities, stunning 
          natural beauty, and endless opportunities for adventure and discovery.
        </p>
      }
      destinations={northAmericaDestinations}
      continent="North America"
      defaultFooterText="Ready to explore North America? Use our Trip Planner to create your perfect itinerary!"
    />
  );
};

export default NorthAmericaDestinationsPage;

