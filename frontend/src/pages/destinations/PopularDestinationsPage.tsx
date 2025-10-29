import { DestinationsPageLayout } from '@/components/destinations';
import { destinations } from '@/data/destinations';

const PopularDestinationsPage = () => {
  return (
    <DestinationsPageLayout
      title="Popular Destinations"
      description="Discover the world's most amazing destinations, perfect for student travelers. Each location offers unique experiences, rich culture, and student-friendly perks."
      destinations={destinations}
      defaultFooterText="Ready to start your adventure? Use our Trip Planner to create your perfect itinerary!"
    />
  );
};

export default PopularDestinationsPage;
