import React, { useEffect, useMemo } from 'react';
import { DestinationCard } from '@/components/ui/destination-card';
import { DestinationPicker, LoadingSpinner, DestinationFooter, useFilteredDestinations } from '@/components/destinations';
import { useDestination } from '@/contexts/DestinationContext';
import { usePaginatedItems } from '@/hooks/usePaginatedItems';
import { ChevronDown, ArrowDown } from 'lucide-react';
import type { Destination } from '@/data/destinations';
import { Button } from '@/components/ui/button';

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]; // Create a copy to avoid mutating original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }
  return shuffled;
};

// Store shuffled destinations per page for this session (module-level Map)
// Key: page identifier (title or continent), Value: shuffled array
const sessionShuffledDestinations = new Map<string, Destination[]>();

interface DestinationsPageLayoutProps {
  title: string;
  description: string | React.ReactNode;
  destinations: Destination[];
  continent?: string;
  defaultFooterText: string;
  resetOnMount?: boolean;
}

export const DestinationsPageLayout = ({
  title,
  description,
  destinations,
  continent,
  defaultFooterText,
  resetOnMount = false,
}: DestinationsPageLayoutProps) => {
  const {
    selectedCountry,
    selectedDestination,
    isLoading,
    loadingCountry,
    isAnimating,
    resetAll,
    handlePlanTrip,
  } = useDestination();

  // Reset all fields when page loads (if resetOnMount is true)
  // todo find a solution to this
  // useEffect(() => {
  //   if (resetOnMount) {
  //     resetAll();
  //   }
  // }, [resetAll, resetOnMount]);

  // Shuffle destinations once per session (per page)
  const shuffledDestinations = useMemo(() => {
    // Create a unique key for this page (use title as identifier)
    const pageKey = title;
    
    // If we haven't shuffled this page this session, do it now
    if (!sessionShuffledDestinations.has(pageKey)) {
      const shuffled = shuffleArray(destinations);
      sessionShuffledDestinations.set(pageKey, shuffled);
    }
    
    // Return the shuffled array for this session
    return sessionShuffledDestinations.get(pageKey)!;
  }, [destinations, title]);

  // Filter destinations based on selected country, excluding selected destination
  const filteredDestinations = useFilteredDestinations({
    destinations: shuffledDestinations,
    selectedCountry,
    selectedDestination,
  });

  // Paginate filtered destinations
  const { displayedItems, hasMore, loadMore } = usePaginatedItems(filteredDestinations);

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Hero Text and Destination Picker in one card */}
        <div className="relative z-40 bg-card/50 backdrop-blur rounded-xl border border-border/50 p-6 sm:p-8 mb-12 sm:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6">
            <div className="flex items-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">{title}</h1>
            </div>
            <div className="flex items-center">
              {typeof description === 'string' ? (
                <p className="text-lg sm:text-xl text-muted-foreground">{description}</p>
              ) : (
                description
              )}
            </div>
          </div>
          
          <div className={isAnimating ? "animate-bounce-once" : ""}>
            <DestinationPicker continent={continent} />
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && <LoadingSpinner loadingCountry={loadingCountry} />}

        {/* Destination Cards */}
        {!isLoading && (
          <>
            {selectedDestination && displayedItems.length > 0 && (
              <div className="-mt-8 sm:-mt-10 mb-6 sm:mb-8 text-center">
                <div className="flex items-center justify-center gap-2">
                  <ChevronDown className="size-4 text-muted-foreground" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    More places to explore in {selectedDestination.location}
                  </p>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </div>
              </div>
            )}
            {displayedItems.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <p className="text-lg sm:text-xl text-muted-foreground">
                  Unfortunately, there are no more destination cards to show, but there are still other amazing options available.
                </p>
              </div>
            ) : (
              <div className="space-y-16 sm:space-y-20 lg:space-y-24">
                {displayedItems.map((destination, index) => (
                <div key={destination.id} className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                  {index % 2 === 0 ? (
                    // Card first, then text
                    <>
                      <div className="flex justify-center lg:justify-end">
                        <DestinationCard
                          imageUrl={destination.imageUrl!}
                          imageAlt={destination.imageAlt || ""}
                          title={destination.title}
                          location={destination.location}
                          overview={destination.overview!}
                          budgetPerDay={destination.budgetPerDay!}
                          onPlanTrip={() => handlePlanTrip(destination)}
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
                            {destination.studentPerks!.map((perk, perkIndex) => (
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
                            {destination.studentPerks!.map((perk, perkIndex) => (
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
                          imageUrl={destination.imageUrl!}
                          imageAlt={destination.imageAlt || ""}
                          title={destination.title}
                          location={destination.location}
                          overview={destination.overview!}
                          budgetPerDay={destination.budgetPerDay!}
                          onPlanTrip={() => handlePlanTrip(destination)}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
              </div>
            )}
          </>
        )}

        {/* Load More Button */}
        {!isLoading && hasMore && (
          <div className="flex justify-center mt-8 mb-6">
            <Button variant="outline" size="lg" onClick={loadMore} className="gap-2">
              Load More Destinations
              <ArrowDown className="size-4" />
            </Button>
          </div>
        )}

        {/* Footer - Hide during loading */}
        {!isLoading && (
          <DestinationFooter
            selectedCountry={selectedCountry}
            defaultText={defaultFooterText}
            hasLoadMore={hasMore}
          />
        )}
      </div>
    </div>
  );
};

