import { PopularDestinationsCarousel, FeaturesSection, HeroSection, TravelHeatmapSection } from "@/components/home";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function HomePage() {
  useDocumentTitle('Home');
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <PopularDestinationsCarousel />
      <TravelHeatmapSection />
      <FeaturesSection />
    </div>
  );
}
