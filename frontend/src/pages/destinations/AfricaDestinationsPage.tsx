import { DestinationsPageLayout } from '@/components/destinations';
import { getDestinationsByContinent } from '@/data/destinations';

const AfricaDestinationsPage = () => {
  const africaDestinations = getDestinationsByContinent('Africa');

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
