import { PopularDestinationsCarousel, FeaturesSection, HeroSection } from "@/components/home";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <PopularDestinationsCarousel />
      <FeaturesSection />
    </div>
  );
}
