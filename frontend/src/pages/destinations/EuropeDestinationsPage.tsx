import { DestinationsPageLayout } from '@/components/destinations';
import { getDestinationsByContinent } from '@/data/destinations';

const EuropeDestinationsPage = () => {
  const europeDestinations = getDestinationsByContinent('Europe');

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
