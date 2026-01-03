import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fallbackIcon?: React.ReactNode;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-24 h-24',
} as const;

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-12 h-12',
} as const;

const AvatarComponent = ({
  src,
  alt = 'Profile',
  size = 'md',
  className,
  fallbackIcon,
}: AvatarProps) => {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizeClass = sizeClasses[size];
  const iconSize = iconSizes[size];
  const defaultIcon = useMemo(
    () => fallbackIcon || <User className={cn(iconSize, 'text-primary')} />,
    [fallbackIcon, iconSize]
  );

  if (src && !hasError) {
    return (
      <div
        className={cn(
          sizeClass,
          'rounded-full overflow-hidden border-2 border-primary/20 bg-primary/5 flex-shrink-0',
          className
        )}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        sizeClass,
        'rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0',
        className
      )}
    >
      {defaultIcon}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders when props haven't changed
export const Avatar = memo(AvatarComponent);

