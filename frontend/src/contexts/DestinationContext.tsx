import React, { createContext, useContext, useState, type ReactNode, useCallback, useEffect, useRef } from 'react';
import type { Option } from '@/components/ui/autocomplete';
import type { DateRange } from 'react-day-picker';
import { useAuth } from './AuthContext';
import { useTrips } from './TripContext';

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
  showAuthDialog: boolean;
  setCountry: (country: Option | undefined) => void;
  setDestination: (destination: Option | undefined) => void;
  setDateRange: (range: DateRange | undefined) => void;
  resetAll: () => void;
  handlePlanTrip: (destination: { id: number; title: string; location: string }) => void;
  planTrip: (data: TripData) => Promise<{ success: boolean; error?: string }>;
  scrollToTop: () => void;
  setShowAuthDialog: (show: boolean) => void;
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
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const previousCountryRef = useRef<string>('');
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useAuth();
  const { createTrip } = useTrips();

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear animation timeout on unmount
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

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
    // Clear animation timeout if it exists
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
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
    // Clear any existing animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

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
    
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      animationTimeoutRef.current = null;
    }, 300);
  }, [selectedCountry, scrollToTop]);

  const planTripHandler = useCallback(async (data: TripData): Promise<{ success: boolean; error?: string }> => {
    // Check if user is logged in
    if (!user) {
      setShowAuthDialog(true);
      return { success: false, error: 'You must be logged in to create a trip' };
    }

    // Check if destination and dates are selected
    if (!data.destination || !data.departDate || !data.returnDate) {
      return { success: false, error: 'Please select a destination and dates' };
    }

    // Create trip
    const result = await createTrip({
      destinationId: parseInt(data.destination.value),
      destinationName: data.destination.label,
      destinationLocation: data.destination.location || '',
      departureDate: data.departDate,
      returnDate: data.returnDate,
    });

    if (result.success) {
      // Reset form on success
      resetAll();
      // Also call the original callback if provided
      onPlanTrip?.(data);
    }

    return result;
  }, [user, createTrip, resetAll, onPlanTrip]);

  const value: DestinationContextType = {
    selectedCountry,
    selectedDestination,
    dateRange,
    isLoading,
    loadingCountry,
    isAnimating,
    showAuthDialog,
    setCountry,
    setDestination,
    setDateRange: setDateRangeHandler,
    resetAll,
    handlePlanTrip,
    planTrip: planTripHandler,
    scrollToTop,
    setShowAuthDialog,
  };

  return (
    <DestinationContext.Provider value={value}>
      {children}
    </DestinationContext.Provider>
  );
};

