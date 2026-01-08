import React, { createContext, useContext, useState, type ReactNode, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { Option } from '@/components/ui/autocomplete';
import type { DateRange } from 'react-day-picker';
import { useAuth } from './AuthContext';
import { useTrips } from './TripContext';

/**
 * Trip data structure for trip creation
 */
interface TripData {
  destination: Option | undefined;
  departDate: string;
  returnDate: string;
}

/**
 * Destination context type
 * Manages destination picker state and trip planning flow
 */
interface DestinationContextType {
  /** Currently selected country option */
  selectedCountry: Option | undefined;
  /** Currently selected destination option */
  selectedDestination: Option | undefined;
  /** Selected date range for the trip */
  dateRange: DateRange | undefined;
  /** Loading state when country changes (animation) */
  isLoading: boolean;
  /** Name of the country currently loading */
  loadingCountry: string;
  /** Animation state for destination selection */
  isAnimating: boolean;
  /** Whether to show authentication dialog */
  showAuthDialog: boolean;
  /** Set the selected country */
  setCountry: (country: Option | undefined) => void;
  /** Set the selected destination */
  setDestination: (destination: Option | undefined) => void;
  /** Set the date range */
  setDateRange: (range: DateRange | undefined) => void;
  /** Reset all destination picker state */
  resetAll: () => void;
  /** Handle planning a trip from a destination card click */
  handlePlanTrip: (destination: { id: number; title: string; location: string }) => void;
  /** Create a trip with selected destination and dates */
  planTrip: (data: TripData) => Promise<{ success: boolean; error?: string }>;
  /** Scroll to top of page */
  scrollToTop: () => void;
  /** Set authentication dialog visibility */
  setShowAuthDialog: (show: boolean) => void;
}

const DestinationContext = createContext<DestinationContextType | undefined>(undefined);

/**
 * Hook to access destination context
 * @returns DestinationContextType with destination picker state and operations
 * @throws Error if used outside of DestinationProvider
 */
export const useDestination = () => {
  const context = useContext(DestinationContext);
  if (context === undefined) {
    throw new Error('useDestination must be used within a DestinationProvider');
  }
  return context;
};

interface DestinationProviderProps {
  children: ReactNode;
  /** Optional callback when a trip is successfully created */
  onPlanTrip?: (data: TripData) => void;
}

/**
 * Context provider for destination picker state management
 * Manages country/destination selection, date range, and trip creation flow
 * Automatically resets state on route changes via RouteChangeHandler
 * Provides loading animations and authentication dialog triggers
 * 
 * @example
 * ```tsx
 * <DestinationProvider>
 *   <App />
 * </DestinationProvider>
 * ```
 */
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

  /**
   * Resets all destination picker state
   * Clears selected country, destination, date range, and loading states
   */
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

  /**
   * Scrolls to the top of the page
   */
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /**
   * Handles planning a trip from a destination card click
   * Sets the destination and country, triggers animation, and scrolls to top
   * @param destination - Destination data from card click
   */
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

  /**
   * Creates a trip with selected destination and dates
   * Shows authentication dialog if user is not logged in
   * Resets picker state on successful trip creation
   * @param data - Trip data including destination and dates
   * @returns Promise resolving to success status and optional error message
   */
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

/**
 * Component to handle route changes and reset destination picker state
 * Automatically resets destination fields when navigating between pages
 * Must be used inside a Router component (typically in App.tsx)
 * 
 * @example
 * ```tsx
 * <Router>
 *   <RouteChangeHandler />
 *   <Routes>...</Routes>
 * </Router>
 * ```
 */
export const RouteChangeHandler: React.FC = () => {
  const { resetAll } = useDestination();
  const location = useLocation();
  const previousPathnameRef = useRef<string>(location.pathname);

  useEffect(() => {
    const currentPathname = location.pathname;
    if (previousPathnameRef.current && previousPathnameRef.current !== currentPathname) {
      resetAll();
    }
    previousPathnameRef.current = currentPathname;
  }, [location.pathname, resetAll]);

  return null;
};

