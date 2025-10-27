import { useRef } from 'react';
import type { DestinationPickerRef } from '@/components/DestinationPicker';
import type { Option } from '@/components/ui/autocomplete';

interface Destination {
  id: number;
  title: string;
  location: string;
}

export const useDestinationPicker = () => {
  const pickerRef = useRef<DestinationPickerRef>(null);

  const selectDestination = (destination: Destination) => {
    // Convert destination to option format
    const option: Option = {
      value: destination.id.toString(),
      label: destination.title,
      location: destination.location
    };
    
    // Scroll to top first
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // After scroll completes, populate the picker (triggers bounce animation)
    setTimeout(() => pickerRef.current?.setDestination(option), 600);
  };

  return { pickerRef, selectDestination };
};

