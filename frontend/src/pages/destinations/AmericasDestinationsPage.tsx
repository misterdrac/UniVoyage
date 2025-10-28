import { DestinationCard } from '@/components/ui/destination-card';
import { DestinationPicker } from '@/components';
import { getDestinationsByContinent } from '@/data/destinations';
import { useDestination } from '@/contexts/DestinationContext';
import { useState, useMemo, useEffect } from 'react';
import type { Option } from '@/components/ui/autocomplete';
import { Plane } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const AmericasDestinationsPage = () => {
  const { selectedCountry, setDestination, setCountry, scrollToTop, setDateRange } = useDestination();
  const americasDestinations = getDestinationsByContinent('Americas');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCountry, setLoadingCountry] = useState<string>('');
  const [previousCountry, setPreviousCountry] = useState<string>('');

  // Reset all fields when page loads
  useEffect(() => {
    setCountry(undefined);
    setDestination(undefined);
    setDateRange(undefined);
  }, []);

  // Function to get random destinations from continent
  const getRandomDestinations = (count: number) => {
    const shuffled = [...americasDestinations].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Filter destinations based on selected country or show random 6
  const filteredDestinations = useMemo(() => {
    if (selectedCountry) {
      return americasDestinations.filter(dest => dest.location === selectedCountry.label);
    }
    return getRandomDestinations(6);
  }, [selectedCountry, americasDestinations]);

  // Watch for country changes and trigger loading animation only when country actually changes
  useEffect(() => {
    if (selectedCountry && selectedCountry.label !== previousCountry) {
      setLoadingCountry(selectedCountry.label);
      setIsLoading(true);
      setPreviousCountry(selectedCountry.label);
      // Simulate flight time - show spinner for 2 seconds
      setTimeout(() => {
        setIsLoading(false);
        setLoadingCountry('');
      }, 2000);
    } else if (!selectedCountry) {
      setIsLoading(false);
      setLoadingCountry('');
      setPreviousCountry('');
    }
  }, [selectedCountry, previousCountry]);

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Hero Text and Destination Picker in one card */}
        <div className="relative z-40 bg-card/50 backdrop-blur rounded-xl border border-border/50 p-6 sm:p-8 mb-12 sm:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6">
            <div className="flex items-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Explore the Americas</h1>
            </div>
            <div className="flex items-center">
              <p className="text-center text-lg sm:text-xl text-muted-foreground">
                From the bustling streets of New York to the sandy beaches of Dominican Republic, the Americas 
                offer diverse landscapes, cultures, and experiences. Explore iconic cities, stunning 
                natural beauty, and endless opportunities for adventure and discovery across North 
                and South America.
              </p>
            </div>
          </div>
          
          <div className={isAnimating ? "animate-pulse" : ""}>
            <DestinationPicker continent="Americas" />
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="text-center space-y-6">
              <Plane className="size-16 text-primary animate-bounce mx-auto" />
              <h3 className="text-2xl font-semibold text-foreground">Flying to {loadingCountry}</h3>
              <div className="flex justify-center">
                <Spinner className="size-16 text-primary" />
              </div>
              <p className="text-muted-foreground">Discovering amazing destinations...</p>
            </div>
          </div>
        )}

        {/* Destination Cards */}
        {!isLoading && (
          <div className="space-y-16 sm:space-y-20 lg:space-y-24">
            {filteredDestinations.map((destination, index) => (
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
                      onPlanTrip={() => {
                        const option = {
                          value: destination.id.toString(),
                          label: destination.title,
                          location: destination.location
                        };
                        const countryOption: Option = {
                          value: destination.location,
                          label: destination.location,
                          location: destination.location
                        };
                        // Only set country if it's different from current selection
                        if (!selectedCountry || selectedCountry.label !== destination.location) {
                          setCountry(countryOption);
                        }
                        setDestination(option);
                        setIsAnimating(true);
                        scrollToTop();
                        setTimeout(() => setIsAnimating(false), 1000);
                      }}
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
                      onPlanTrip={() => {
                        const option = {
                          value: destination.id.toString(),
                          label: destination.title,
                          location: destination.location
                        };
                        const countryOption: Option = {
                          value: destination.location,
                          label: destination.location,
                          location: destination.location
                        };
                        // Only set country if it's different from current selection
                        if (!selectedCountry || selectedCountry.label !== destination.location) {
                          setCountry(countryOption);
                        }
                        setDestination(option);
                        setIsAnimating(true);
                        scrollToTop();
                        setTimeout(() => setIsAnimating(false), 1000);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
          </div>
        )}

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


