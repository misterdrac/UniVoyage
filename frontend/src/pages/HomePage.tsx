import { Button } from "@/components/ui/button";
import { Plane, MapPin, Calendar } from "lucide-react";
import { AnimatedCounter } from "@/components/animations";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  Student Travel Made Easy
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Discover Your Next
                <span className="text-primary"> Adventure</span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Plan unforgettable trips with fellow students. From city breaks to cultural exchanges, 
                UniVoyage connects you with amazing travel experiences designed for students.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="text-base px-8" onClick={() => navigate('/destinations')}>
                  Explore Destinations
                  <MapPin className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="secondary" className="text-base px-8">
                  View Tours
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                <div>
                  <AnimatedCounter 
                    end={50} 
                    suffix="+"
                    className="text-3xl font-bold text-primary"
                  />
                  <div className="text-sm text-muted-foreground">Destinations</div>
                </div>
                <div>
                  <AnimatedCounter 
                    end={1000} 
                    suffix="+"
                    className="text-3xl font-bold text-primary"
                  />
                  <div className="text-sm text-muted-foreground">Happy Students</div>
                </div>
                <div>
                  <AnimatedCounter 
                    end={25} 
                    suffix="+"
                    className="text-3xl font-bold text-primary"
                  />
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
              </div>
            </div>

            {/* Right Image - Placeholder for uploaded hero */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {/* Hero Image Placeholder */}
                <img 
                  src="/src/assets/images/hero.jpeg" 
                  alt="Students planning travel" 
                  className="w-full h-full object-cover"
                />
                
                {/* Floating Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-card border border-border rounded-xl p-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-card-foreground">Next Trip</div>
                        <div className="text-xs text-muted-foreground">Barcelona, Spain</div>
                      </div>
                    </div>
                    <Button size="sm" className="text-xs">
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>
            </div>
          </div>
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
