import type { Option } from '@/components/ui/autocomplete';

interface DestinationFooterProps {
  selectedCountry: Option | undefined;
  defaultText: string;
  hasLoadMore?: boolean;
}

export const DestinationFooter = ({ selectedCountry, defaultText, hasLoadMore }: DestinationFooterProps) => {
  return (
    <div className={`text-center px-4 ${hasLoadMore ? 'mt-6' : 'mt-12 sm:mt-11'}`}>
      <p className="text-sm sm:text-base text-muted-foreground">
        {selectedCountry 
          ? `Ready to explore ${selectedCountry.label}? Use our trip planner to create your perfect itinerary!`
          : defaultText}
      </p>
    </div>
  );
};

