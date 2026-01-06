import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DestinationCard } from "@/components/ui/destination-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getPopularDestinations } from "@/lib/destinationUtils";
import { useDestinations } from "@/hooks/useDestinations";

export function PopularDestinationsCarousel() {
  const navigate = useNavigate();
  const { destinations: apiDestinations } = useDestinations();

  const popularDestinations = useMemo(() => 
    getPopularDestinations(apiDestinations).slice(0, 12), 
    [apiDestinations]
  );

  return (
    <section className="pt-32 pb-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Our Users Liked These Destinations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the most beloved destinations among our student travelers
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4 mt-2">
            {popularDestinations.map((destination) => (
              <CarouselItem
                key={destination.id}
                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <DestinationCard
                  imageUrl={destination.imageUrl!}
                  imageAlt={destination.imageAlt || destination.title}
                  title={destination.title}
                  location={destination.location}
                  overview={destination.overview!}
                  budgetPerDay={destination.budgetPerDay!}
                  onPlanTrip={() => navigate('/destinations')}
                  className="h-[350px] hover:-translate-y-2"
                  hideOverview={true}
                  buttonText="Explore Destinations"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
}
