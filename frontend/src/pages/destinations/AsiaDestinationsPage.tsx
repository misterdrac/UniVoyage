import { DestinationsPageLayout } from '@/components/destinations';
import { getDestinationsByContinent } from '@/data/destinations';

const AsiaDestinationsPage = () => {
  const asiaDestinations = getDestinationsByContinent('Asia');

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
