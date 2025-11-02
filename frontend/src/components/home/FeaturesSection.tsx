import { MapPin, Calendar, Plane } from "lucide-react";

export function FeaturesSection() {
  return (
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
  );
}
