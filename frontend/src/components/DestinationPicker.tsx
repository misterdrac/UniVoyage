import { useState, useImperativeHandle, forwardRef } from 'react';
import { Plane } from 'lucide-react';
import { AutoComplete, type Option } from '@/components/ui/autocomplete';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from './DateRangePicker';
import { destinations } from '@/data/destinations';
import type { DateRange } from 'react-day-picker';

interface DestinationPickerProps {
  onPlanTrip?: (data: {
    destination: Option | undefined;
    departDate: string;
    returnDate: string;
  }) => void;
}

export interface DestinationPickerRef {
  setDestination: (option: Option) => void;
}

export const DestinationPicker = forwardRef<DestinationPickerRef, DestinationPickerProps>(({
  onPlanTrip
}, ref) => {
  const [selectedDestination, setSelectedDestination] = useState<Option | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isAnimating, setIsAnimating] = useState(false);

  useImperativeHandle(ref, () => ({
    setDestination: (option: Option) => {
      setSelectedDestination(option);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }));

  // Convert destinations to options for autocomplete
  const destinationOptions: Option[] = destinations.map(dest => ({
    value: dest.id.toString(),
    label: dest.title,
    location: dest.location
  }));

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  return (
    <div className="relative z-10">
      {/* Destination, Date, and Button in one row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Destination Selection */}
        <div className={`relative md:col-span-5 ${isAnimating ? 'animate-bounce-gentle' : ''}`}>
          <label className="text-xs text-muted-foreground mb-1.5 block">Destination</label>
          <AutoComplete
            options={destinationOptions}
            placeholder="Search for a destination..."
            emptyMessage="No destinations found"
            value={selectedDestination}
            onValueChange={setSelectedDestination}
          />
        </div>

        {/* Date Range Selection */}
        <div className="relative md:col-span-5">
          <label className="text-xs text-muted-foreground mb-1.5 block">Depart - Return</label>
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          />
        </div>

        {/* Plan Trip Button */}
        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs text-muted-foreground mb-1.5 block">&nbsp;</label>
          <Button 
            onClick={() => onPlanTrip?.({
              destination: selectedDestination,
              departDate: dateRange?.from?.toISOString().split('T')[0] || '',
              returnDate: dateRange?.to?.toISOString().split('T')[0] || ''
            })}
            className="w-full h-12 text-base"
            disabled={!selectedDestination || !dateRange?.from || !dateRange?.to}
          >
            <Plane className="mr-2 h-5 w-5" />
            Plan Trip
          </Button>
        </div>
      </div>
    </div>
  );
});

DestinationPicker.displayName = 'DestinationPicker';

