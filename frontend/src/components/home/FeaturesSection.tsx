import { MapPin, Calendar, Plane } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: MapPin,
    title: "Curated Destinations",
    description: "Handpicked locations perfect for student travelers on any budget",
  },
  {
    icon: Calendar,
    title: "Flexible Booking",
    description: "Easy scheduling that works around your academic calendar",
  },
  {
    icon: Plane,
    title: "Group Travel",
    description: "Connect with other students and travel together for better experiences",
  },
];

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
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                    <Icon className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <CardTitle className="text-xl transition-colors duration-300 group-hover:text-primary">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
