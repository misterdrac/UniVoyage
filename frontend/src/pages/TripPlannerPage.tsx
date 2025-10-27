import React from 'react';
import { DestinationPicker } from '@/components';
import type { Option } from '@/components/ui/autocomplete';

const TripPlannerPage: React.FC = () => {
  const handleDestinationChange = (destination: Option | undefined) => {
    console.log('Destination selected:', destination);
  };

  const handleDateChange = (departDate: string, returnDate: string) => {
    console.log('Dates selected:', { departDate, returnDate });
  };

  const handlePlanTrip = (data: { 
    destination: Option | undefined; 
    departDate: string; 
    returnDate: string; 
  }) => {
    console.log('Planning trip with:', data);
    // TODO: Implement trip planning logic
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-8 px-8">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8">Trip Planner</h1>
        
        {/* Destination Picker */}
        <DestinationPicker 
          onDestinationChange={handleDestinationChange}
          onDateChange={handleDateChange}
          onPlanTrip={handlePlanTrip}
        />
        
        {/* TODO: Add interests selection */}
        {/* TODO: Add budget input and validation */}
        {/* TODO: Add trip duration selection */}
        {/* TODO: Add travel preferences (accommodation, transport, etc.) */}
        {/* TODO: Add trip generation and saving functionality */}
      </div>
    </div>
  );
};

export default TripPlannerPage;
