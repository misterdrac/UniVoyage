import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Define the props for the DestinationCard component
interface DestinationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  imageAlt: string;
  logo?: React.ReactNode;
  title: string;
  location: string;
  overview: string;
  budgetPerDay: number;
  onPlanTrip: () => void;
}

const DestinationCard = React.forwardRef<HTMLDivElement, DestinationCardProps>(
  (
    {
      className,
      imageUrl,
      imageAlt,
      logo,
      title,
      location,
      overview,
      budgetPerDay,
      onPlanTrip,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg",
          "transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2",
          className
        )}
        {...props}
      >
        {/* Background Image with Zoom Effect on Hover */}
        <img
          src={imageUrl}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent dark:from-black/90 dark:via-black/50"></div>

        {/* Content Container */}
        <div className="relative flex h-full flex-col justify-between p-6 text-card-foreground">
          {/* Top Section: Logo */}
          <div className="flex h-40 items-start">
             {logo && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/50 bg-black/20 backdrop-blur-sm dark:border-white/60 dark:bg-black/30">
                   {logo}
                </div>
             )}
          </div>
          
          {/* Middle Section: Details (slides up on hover) */}
          <div className="space-y-4 transition-transform duration-500 ease-in-out group-hover:-translate-y-16">
            <div>
              <h3 className="text-3xl font-bold text-white">{title}</h3>
              <p className="text-sm text-white/80 dark:text-white/90">{location}</p>
            </div>
            <div>
              <h4 className="font-semibold text-white/90 dark:text-white/95">OVERVIEW</h4>
              <p className="text-sm text-white/70 dark:text-white/80 leading-relaxed">
                {overview}
              </p>
            </div>
          </div>

          {/* Bottom Section: Budget and Button (revealed on hover) */}
          <div className="absolute -bottom-20 left-0 w-full p-6 opacity-0 transition-all duration-500 ease-in-out group-hover:bottom-0 group-hover:opacity-100">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-4xl font-bold text-white">${budgetPerDay}</span>
                <span className="text-white/80 dark:text-white/90"> per day</span>
              </div>
              <Button variant="secondary" onClick={onPlanTrip} size="lg" className="bg-white/10 text-white hover:bg-white/20 border border-white/20">
                Plan Trip <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
DestinationCard.displayName = "DestinationCard";

export { DestinationCard };
