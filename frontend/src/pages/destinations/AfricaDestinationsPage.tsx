import { useMemo } from 'react';
import { DestinationsPageLayout, LoadingSpinner } from '@/components/destinations';
import { getDestinationsByContinent } from '@/lib/destinationUtils';
import { useDestinations } from '@/hooks/useDestinations';
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const AfricaDestinationsPage = () => {
  useDocumentTitle('Africa Destinations');
  const { destinations: apiDestinations, isLoading } = useDestinations();
  
  const africaDestinations = useMemo(() => 
    getDestinationsByContinent(apiDestinations, 'Africa'),
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
      title="Experience Africa"
      description={
        <p className="text-center text-lg sm:text-xl text-muted-foreground">
          Where the world began. Witness the Great Migration in Tanzania's Serengeti, wander 
          Marrakech's labyrinthine souks, and summit Table Mountain in Cape Town. Africa isn't 
          just a destination—it's where epic adventures meet incredible value, where culture runs 
          deep, and where every moment becomes a memory you'll chase forever.
        </p>
      }
      destinations={africaDestinations}
      continent="Africa"
      defaultFooterText="Turn your African dream into reality—start planning your epic adventure today."
    />
  );
};

export default AfricaDestinationsPage;
