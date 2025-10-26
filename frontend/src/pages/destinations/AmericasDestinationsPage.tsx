import React from 'react';
import { DestinationCard } from '@/components/ui/destination-card';
import { getDestinationsByContinent } from '@/data/destinations';

const AmericasDestinationsPage: React.FC = () => {
  const americasDestinations = getDestinationsByContinent('Americas');

  const handlePlanTrip = (destination: string) => {
    console.log(`Plan trip clicked for ${destination}`);
    // TODO: Implement trip planning functionality
  };

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">Explore the Americas</h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            From the bustling streets of New York to the sandy beaches of Dominican Republic, the Americas 
            offer diverse landscapes, cultures, and experiences. Explore iconic cities, stunning 
            natural beauty, and endless opportunities for adventure and discovery across North 
            and South America.
          </p>
        </div>

        <div className="space-y-16 sm:space-y-20 lg:space-y-24">
          {americasDestinations.map((destination, index) => (
            <div key={destination.id} className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              {index % 2 === 0 ? (
                // Card first, then text
                <>
                  <div className="flex justify-center lg:justify-end">
                    <DestinationCard
                      imageUrl={destination.imageUrl}
                      imageAlt={destination.imageAlt || ""}
                      title={destination.title}
                      location={destination.location}
                      overview={destination.overview}
                      budgetPerDay={destination.budgetPerDay}
                      onPlanTrip={() => handlePlanTrip(destination.title)}
                    />
                  </div>
                  <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
                    <div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">{destination.title}</h2>
                      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                        {destination.whyVisit}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">Student Perks</h3>
                      <ul className="space-y-2">
                        {destination.studentPerks.map((perk, perkIndex) => (
                          <li key={perkIndex} className="flex items-start gap-2 text-muted-foreground text-sm sm:text-base">
                            <span className="text-primary mt-1 shrink-0">•</span>
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                // Text first, then card
                <>
                  <div className="space-y-4 sm:space-y-6 order-2 lg:order-1 px-4 sm:px-0">
                    <div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">{destination.title}</h2>
                      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                        {destination.whyVisit}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">Student Perks</h3>
                      <ul className="space-y-2">
                        {destination.studentPerks.map((perk, perkIndex) => (
                          <li key={perkIndex} className="flex items-start gap-2 text-muted-foreground text-sm sm:text-base">
                            <span className="text-primary mt-1 shrink-0">•</span>
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex justify-center lg:justify-start order-1 lg:order-2">
                    <DestinationCard
                      imageUrl={destination.imageUrl}
                      imageAlt={destination.imageAlt || ""}
                      title={destination.title}
                      location={destination.location}
                      overview={destination.overview}
                      budgetPerDay={destination.budgetPerDay}
                      onPlanTrip={() => handlePlanTrip(destination.title)}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-16 px-4">
          <p className="text-sm sm:text-base text-muted-foreground">
            Ready to explore the Americas? Use our Trip Planner to create your perfect itinerary!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmericasDestinationsPage;

