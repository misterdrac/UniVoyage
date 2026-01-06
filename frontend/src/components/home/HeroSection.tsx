import HeroImage from "@/assets/images/hero.jpg";
import MobileHeroImage from "@/assets/images/mobile_hero.jpg";
import { HeroCard } from "./HeroCard";
import { ExploreMoreButton } from "./ExploreMoreButton";

export function HeroSection() {
  return (
    <section className="relative w-full pt-[68px] pb-0">
      <div className="relative w-full h-[calc(100vh-68px)]">
        {/* Mobile Image */}
        <img
          src={MobileHeroImage}
          alt="Students planning travel"
          className="md:hidden w-full h-full object-cover"
        />
        {/* Desktop Image */}
        <img
          src={HeroImage}
          alt="Students planning travel"
          className="hidden md:block w-full h-full object-cover"
        />
        
        {/* Content on hero */}
        <div className="absolute inset-0 flex items-center md:items-start justify-center md:pt-32">
          <div className="container mx-auto px-6 w-full">
            <HeroCard />
          </div>
        </div>
        
        <ExploreMoreButton />
      </div>
    </section>
  );
}
