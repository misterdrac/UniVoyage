import { DestinationCard } from '@/components/ui/destination-card';
import { DestinationPicker } from '@/components';
import { getDestinationsByContinent } from '@/data/destinations';
import { useDestinationPicker } from '@/hooks/useDestinationPicker';

const EuropeDestinationsPage = () => {
  const { pickerRef, selectDestination } = useDestinationPicker();
  const europeDestinations = getDestinationsByContinent('Europe');

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Hero Text and Destination Picker in one card */}
        <div className="relative z-40 bg-card/50 backdrop-blur rounded-xl border border-border/50 p-6 sm:p-8 mb-12 sm:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6">
            <div className="flex items-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Explore Europe</h1>
            </div>
            <div className="flex items-center">
              <p className="text-center text-lg sm:text-xl text-muted-foreground">
                Where culture begins and history lives. From the charming streets of Paris to the 
                fairytale architecture of Prague, Europe offers an unparalleled journey through 
                centuries of art, culture, and discovery. Experience the continent where every 
                cobblestone tells a story and every city boasts its own unique character.
              </p>
            </div>
          </div>
          
          <DestinationPicker ref={pickerRef} />
        </div>

        <div className="space-y-16 sm:space-y-20 lg:space-y-24">
          {europeDestinations.map((destination, index) => (
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
                      onPlanTrip={() => selectDestination(destination)}
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
                      onPlanTrip={() => selectDestination(destination)}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-16 px-4">
          <p className="text-sm sm:text-base text-muted-foreground">
            Ready to start your European adventure? Use our Trip Planner to create your perfect itinerary!
          </p>
        </div>
      </div>
    </div>
  );
};

export default EuropeDestinationsPage;


