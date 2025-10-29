import type { Option } from '@/components/ui/autocomplete';

interface DestinationFooterProps {
  selectedCountry: Option | undefined;
  defaultText: string;
}

export const DestinationFooter = ({ selectedCountry, defaultText }: DestinationFooterProps) => {
  return (
    <div className="text-center mt-12 sm:mt-16 px-4">
      <p className="text-sm sm:text-base text-muted-foreground">
        {selectedCountry 
          ? `Ready to explore ${selectedCountry.label}? Use our trip planner to create your perfect itinerary!`
          : defaultText}
      </p>
    </div>
  );
};

