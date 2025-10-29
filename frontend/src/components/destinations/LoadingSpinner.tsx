import { Plane } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface LoadingSpinnerProps {
  loadingCountry: string;
}

export const LoadingSpinner = ({ loadingCountry }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-8">
      <div className="text-center space-y-6">
        <Plane className="size-16 text-primary animate-bounce mx-auto" />
        <h3 className="text-2xl font-semibold text-foreground">Flying to {loadingCountry}</h3>
        <div className="flex justify-center">
          <Spinner className="size-16 text-primary" />
        </div>
        <p className="text-muted-foreground">Discovering amazing destinations...</p>
      </div>
    </div>
  );
};

