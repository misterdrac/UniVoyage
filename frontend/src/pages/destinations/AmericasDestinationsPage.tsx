import { useMemo } from 'react';
import { DestinationsPageLayout, LoadingSpinner } from '@/components/destinations';
import { getDestinationsByContinent } from '@/data/destinations';
import { useDestinations } from '@/hooks/useDestinations';

const AmericasDestinationsPage = () => {
  const { destinations: apiDestinations, isLoading } = useDestinations();
  
  const americasDestinations = useMemo(() => 
    getDestinationsByContinent(apiDestinations, 'Americas'),
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
      title="Explore the Americas"
      description={
        <p className="text-center text-lg sm:text-xl text-muted-foreground">
          From the bustling streets of New York to the sandy beaches of Dominican Republic, the Americas 
          offer diverse landscapes, cultures, and experiences. Explore iconic cities, stunning 
          natural beauty, and endless opportunities for adventure and discovery across North 
          and South America.
        </p>
      }
      destinations={americasDestinations}
      continent="Americas"
      defaultFooterText="Ready to explore the Americas? Use our Trip Planner to create your perfect itinerary!"
    />
  );
};

export default AmericasDestinationsPage;
