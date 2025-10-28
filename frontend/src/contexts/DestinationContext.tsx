import React, { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
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
  setCountry: (country: Option | undefined) => void;
  setDestination: (destination: Option | undefined) => void;
  setDateRange: (range: DateRange | undefined) => void;
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

  const setCountry = useCallback((country: Option | undefined) => {
    setSelectedCountry(country);
  }, []);

  const setDestination = useCallback((destination: Option | undefined) => {
    setSelectedDestination(destination);
  }, []);

  const setDateRangeHandler = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const planTripHandler = useCallback((data: TripData) => {
    scrollToTop();
    onPlanTrip?.(data);
  }, [onPlanTrip, scrollToTop]);

  const value: DestinationContextType = {
    selectedCountry,
    selectedDestination,
    dateRange,
    setCountry,
    setDestination,
    setDateRange: setDateRangeHandler,
    planTrip: planTripHandler,
    scrollToTop,
  };

  return (
    <DestinationContext.Provider value={value}>
      {children}
    </DestinationContext.Provider>
  );
};

