import { useMemo } from 'react';
import { DestinationsPageLayout, LoadingSpinner } from '@/components/destinations';
import { getDestinationsByContinent } from '@/data/destinations';
import { useDestinations } from '@/hooks/useDestinations';

const EuropeDestinationsPage = () => {
  const { destinations: apiDestinations, isLoading } = useDestinations();
  
  const europeDestinations = useMemo(() => 
    getDestinationsByContinent(apiDestinations, 'Europe'),
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
      title="Explore Europe"
      description={
        <p className="text-center text-lg sm:text-xl text-muted-foreground">
          Where culture begins and history lives. From the charming streets of Paris to the 
          fairytale architecture of Prague, Europe offers an unparalleled journey through 
          centuries of art, culture, and discovery. Experience the continent where every 
          cobblestone tells a story and every city boasts its own unique character.
        </p>
      }
      destinations={europeDestinations}
      continent="Europe"
      defaultFooterText="Ready to start your European adventure? Use our Trip Planner to create your perfect itinerary!"
    />
  );
};

export default EuropeDestinationsPage;
