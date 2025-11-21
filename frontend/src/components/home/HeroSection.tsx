import HeroImage from "@/assets/images/hero2.jpg";
import { HeroCard } from "./HeroCard";
import { ExploreMoreButton } from "./ExploreMoreButton";

const MOBILE_IMAGE_URL = "https://images.unsplash.com/photo-1517999349371-c43520457b23?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687";

export function HeroSection() {
  return (
    <section className="relative w-full pt-[68px] pb-0">
      <div className="relative w-full h-[calc(100vh-68px)]">
        {/* Mobile Image */}
        <img
          src={MOBILE_IMAGE_URL}
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
