import { DestinationsPageLayout } from '@/components/destinations';
import { getDestinationsByContinent } from '@/data/destinations';

const AmericasDestinationsPage = () => {
  const americasDestinations = getDestinationsByContinent('Americas');

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
