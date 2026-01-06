import { useMemo } from 'react';
import { DestinationsPageLayout, LoadingSpinner } from '@/components/destinations';
import { useDestinations } from '@/hooks/useDestinations';
import { getPopularDestinations } from '@/lib/destinationUtils';

const PopularDestinationsPage = () => {
  const { destinations: apiDestinations, isLoading } = useDestinations();

  const popularDestinations = useMemo(() =>
    getPopularDestinations(apiDestinations),
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
      title="Popular Destinations"
      description="Discover the world's most amazing destinations, perfect for student travelers. Each location offers unique experiences, rich culture, and student-friendly perks."
      destinations={popularDestinations}
      defaultFooterText="Ready to start your adventure? Use our Trip Planner to create your perfect itinerary!"
    />
  );
};

export default PopularDestinationsPage;
