import { useMemo } from 'react';
import { DestinationsPageLayout, LoadingSpinner } from '@/components/destinations';
import { getDestinationsByContinent } from '@/lib/destinationUtils';
import { useDestinations } from '@/hooks/useDestinations';

const SouthAmericaDestinationsPage = () => {
  const { destinations: apiDestinations, isLoading } = useDestinations();
  
  const southAmericaDestinations = useMemo(() => 
    getDestinationsByContinent(apiDestinations, 'South America'),
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
      title="Discover South America"
      description={
        <p className="text-center text-lg sm:text-xl text-muted-foreground">
          From the vibrant rhythms of Rio de Janeiro to the ancient mysteries of Machu Picchu, South America 
          offers incredible diversity, rich cultures, and breathtaking landscapes. Experience the warmth of 
          Latin American hospitality, world-class cuisine, and unforgettable adventures across this 
          magnificent continent.
        </p>
      }
      destinations={southAmericaDestinations}
      continent="South America"
      defaultFooterText="Ready to explore South America? Use our Trip Planner to create your perfect itinerary!"
    />
  );
};

export default SouthAmericaDestinationsPage;

