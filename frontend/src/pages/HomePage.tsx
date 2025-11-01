import { Button } from "@/components/ui/button";
import { Plane, MapPin, Calendar, ChevronDown } from "lucide-react";
import { AnimatedCounter } from "@/components/animations";
import { useNavigate } from "react-router-dom";
import { DestinationCard } from "@/components/ui/destination-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getPopularDestinations } from "@/data/destinations";

export default function HomePage() {
  const navigate = useNavigate();

  const handleExploreMore = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative w-full pt-[68px] pb-0">
        {/* Full Width Hero Image */}
        <div className="relative w-full h-[calc(100vh-68px)]">
          <img 
            src="/src/assets/images/hero.jpeg" 
            alt="Students planning travel" 
            className="w-full h-full object-cover"
          />
          
          {/* Content on hero */}
          <div className="absolute inset-0 flex items-end pb-40">
            <div className="container mx-auto px-6 w-full">
              <div className="max-w-full">
                {/* Main content card */}
                <div className="bg-card/30 backdrop-blur-md rounded-2xl border border-border/50 p-6 md:p-8 shadow-2xl max-w-3xl mx-auto">
                  <div className="text-center">
                    <div className="inline-block mb-6">
                      <span className="px-4 py-2 bg-primary/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/20">
                        Student Travel Made Easy
                      </span>
                    </div>
                    
                    <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                      Discover Your Next
                      <span className="text-primary"> Adventure</span>
                    </h1>
                    
                    <p className="text-xl text-white/90 leading-relaxed mb-8">
                      Plan unforgettable trips with fellow students. From city breaks to cultural exchanges, 
                      UniVoyage connects you with amazing travel experiences designed for students.
                    </p>

                    {/* CTA Button */}
                    <div className="flex justify-center mb-8">
                      <Button size="lg" className="text-base px-8" onClick={() => navigate('/destinations')}>
                        Explore Destinations
                        <MapPin className="w-5 h-5 ml-2" />
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-8 justify-center">
                      <div>
                        <AnimatedCounter 
                          end={50} 
                          suffix="+"
                          className="text-3xl font-bold text-white"
                        />
                        <div className="text-sm text-white/80">Destinations</div>
                      </div>
                      <div>
                        <AnimatedCounter 
                          end={1000} 
                          suffix="+"
                          className="text-3xl font-bold text-white"
                        />
                        <div className="text-sm text-white/80">Happy Students</div>
                      </div>
                      <div>
                        <AnimatedCounter 
                          end={25} 
                          suffix="+"
                          className="text-3xl font-bold text-white"
                        />
                        <div className="text-sm text-white/80">Countries</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Explore More Arrow */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <button
              onClick={handleExploreMore}
              className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors group"
            >
              <span className="text-sm font-medium">Explore More</span>
              <ChevronDown className="w-6 h-6 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* Popular Destinations Carousel */}
      <section className="pt-32 pb-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Users Liked These Destinations</h2>
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
              {getPopularDestinations().slice(0, 12).map((destination) => (
                <CarouselItem key={destination.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <DestinationCard
                    imageUrl={destination.imageUrl!}
                    imageAlt={destination.imageAlt!}
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

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose UniVoyage?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make student travel affordable, safe, and unforgettable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Curated Destinations</h3>
              <p className="text-muted-foreground">
                Handpicked locations perfect for student travelers on any budget
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Flexible Booking</h3>
              <p className="text-muted-foreground">
                Easy scheduling that works around your academic calendar
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Plane className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Group Travel</h3>
              <p className="text-muted-foreground">
                Connect with other students and travel together for better experiences
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
