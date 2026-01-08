import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

export function AuthLoadingOverlay() {
  const { isLoading } = useAuth();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-100 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

