import React, { createContext, useContext, useState, type ReactNode, useCallback, useEffect, useRef } from 'react';
import type { Option } from '@/components/ui/autocomplete';
import type { DateRange } from 'react-day-picker';

interface TripData {
  destination: Option | undefined;
  departDate: string;
  returnDate: string;
}

interface DestinationContextType {
  selectedCountry: Option | undefined;
  selectedDestination: Option | undefined;
  dateRange: DateRange | undefined;
  isLoading: boolean;
  loadingCountry: string;
  isAnimating: boolean;
  setCountry: (country: Option | undefined) => void;
  setDestination: (destination: Option | undefined) => void;
  setDateRange: (range: DateRange | undefined) => void;
  resetAll: () => void;
  handlePlanTrip: (destination: { id: number; title: string; location: string }) => void;
  planTrip: (data: TripData) => void;
  scrollToTop: () => void;
}

const DestinationContext = createContext<DestinationContextType | undefined>(undefined);

export const useDestination = () => {
  const context = useContext(DestinationContext);
  if (context === undefined) {
    throw new Error('useDestination must be used within a DestinationProvider');
  }
  return context;
};

interface DestinationProviderProps {
  children: ReactNode;
  onPlanTrip?: (data: TripData) => void;
}

export const DestinationProvider: React.FC<DestinationProviderProps> = ({ children, onPlanTrip }) => {
  const [selectedCountry, setSelectedCountry] = useState<Option | undefined>();
  const [selectedDestination, setSelectedDestination] = useState<Option | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCountry, setLoadingCountry] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const previousCountryRef = useRef<string>('');

  // Watch for country changes and trigger loading animation
  useEffect(() => {
    if (selectedCountry && selectedCountry.label !== previousCountryRef.current) {
      setLoadingCountry(selectedCountry.label);
      setIsLoading(true);
      previousCountryRef.current = selectedCountry.label;
      
      // Simulate flight time - show spinner for 2 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
        setLoadingCountry('');
      }, 2000);
      
      return () => clearTimeout(timer);
    } else if (!selectedCountry) {
      setIsLoading(false);
      setLoadingCountry('');
      previousCountryRef.current = '';
    }
  }, [selectedCountry]);

  const setCountry = useCallback((country: Option | undefined) => {
    setSelectedCountry(country);
  }, []);

  const setDestination = useCallback((destination: Option | undefined) => {
    setSelectedDestination(destination);
  }, []);

  const setDateRangeHandler = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
  }, []);

  const resetAll = useCallback(() => {
    setSelectedCountry(undefined);
    setSelectedDestination(undefined);
    setDateRange(undefined);
    setIsLoading(false);
    setLoadingCountry('');
    setIsAnimating(false);
    previousCountryRef.current = '';
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePlanTrip = useCallback((destination: { id: number; title: string; location: string }) => {
    const option: Option = {
      value: destination.id.toString(),
      label: destination.title,
      location: destination.location
    };
    
    const countryOption: Option = {
      value: destination.location,
      label: destination.location,
      location: destination.location
    };
    
    // Only set country if it's different from current selection
    if (!selectedCountry || selectedCountry.label !== destination.location) {
      setSelectedCountry(countryOption);
    }
    
    setSelectedDestination(option);
    setIsAnimating(true);
    scrollToTop();
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  }, [selectedCountry, scrollToTop]);

  const planTripHandler = useCallback((data: TripData) => {
    scrollToTop();
    onPlanTrip?.(data);
  }, [onPlanTrip, scrollToTop]);

  const value: DestinationContextType = {
    selectedCountry,
    selectedDestination,
    dateRange,
    isLoading,
    loadingCountry,
    isAnimating,
    setCountry,
    setDestination,
    setDateRange: setDateRangeHandler,
    resetAll,
    handlePlanTrip,
    planTrip: planTripHandler,
    scrollToTop,
  };

  return (
    <DestinationContext.Provider value={value}>
      {children}
    </DestinationContext.Provider>
  );
};

