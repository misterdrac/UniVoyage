import { useMemo } from 'react';
import { DestinationsPageLayout, LoadingSpinner } from '@/components/destinations';
import { getDestinationsByContinent } from '@/lib/destinationUtils';
import { useDestinations } from '@/hooks/useDestinations';

const OceaniaDestinationsPage = () => {
  const { destinations: apiDestinations, isLoading } = useDestinations();
  
  const oceaniaDestinations = useMemo(() => 
    getDestinationsByContinent(apiDestinations, 'Oceania'),
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
      title="Explore Oceania"
      description={
        <p className="text-center text-lg sm:text-xl text-muted-foreground">
          From the stunning beaches of Australia to the breathtaking landscapes of New Zealand, Oceania 
          offers incredible natural beauty, unique wildlife, and vibrant cultures. Experience world-class 
          cities, pristine coastlines, and unforgettable adventures across the Pacific.
        </p>
      }
      destinations={oceaniaDestinations}
      continent="Oceania"
      defaultFooterText="Ready to explore Oceania? Use our Trip Planner to create your perfect itinerary!"
    />
  );
};

export default OceaniaDestinationsPage;

