import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatsDisplay } from "./StatsDisplay";

export function HeroCard() {
  const navigate = useNavigate();

  return (
    <div className="bg-card/75 backdrop-blur-md rounded-xl border border-border/50 p-4 md:p-5 shadow-2xl max-w-xl mx-auto">
      <div className="text-center">
        <div className="inline-block mb-3">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
            Student Travel Made Easy
          </span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-3">
          Discover Your Next
          <span className="text-primary"> Adventure</span>
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Plan unforgettable trips with fellow students. From city breaks to cultural exchanges,
          UniVoyage connects you with amazing travel experiences designed for students.
        </p>

        <div className="flex justify-center mb-4">
          <Button
            variant="default"
            size="default"
            className="text-sm px-6 transition-transform duration-200 hover:scale-105 group/btn"
            onClick={() => navigate('/destinations')}
          >
            Explore Destinations
            <MapPin className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <StatsDisplay />
      </div>
    </div>
  );
}
