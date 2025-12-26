import { useMemo } from 'react';
import { DestinationsPageLayout, LoadingSpinner } from '@/components/destinations';
import { getDestinationsByContinent } from '@/data/destinations';
import { useDestinations } from '@/hooks/useDestinations';

const AsiaDestinationsPage = () => {
  const { destinations: apiDestinations, isLoading } = useDestinations();
  
  const asiaDestinations = useMemo(() => 
    getDestinationsByContinent(apiDestinations, 'Asia'),
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
      title="Discover Asia"
      description={
        <p className="text-center text-lg sm:text-xl text-muted-foreground">
          From zen gardens and ancient temples to neon-lit megacities and tropical beaches. Asia 
          delivers the world's most incredible value—where $20 can buy paradise, street food 
          rivals Michelin stars, and ancient wisdom flows alongside cutting-edge innovation. 
          Your wallet will thank you, but your Instagram will explode.
        </p>
      }
      destinations={asiaDestinations}
      continent="Asia"
      defaultFooterText="Start planning your Asian adventure—where budget meets bucket list."
    />
  );
};

export default AsiaDestinationsPage;
