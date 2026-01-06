import { PopularDestinationsCarousel, FeaturesSection, HeroSection } from "@/components/home";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function HomePage() {
  useDocumentTitle('Home');
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <PopularDestinationsCarousel />
      <FeaturesSection />
    </div>
  );
}
