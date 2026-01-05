import { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from './Avatar';

const AVATAR_BASE_URL = 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-';
const AVATAR_COUNT = 20;

interface AvatarPickerProps {
  currentAvatarPath?: string;
  onAvatarChange: (avatarPath: string) => void;
  disabled?: boolean;
}

/**
 * Extracts avatar number from URL or returns null if not found
 */
const getAvatarNumberFromPath = (path?: string): number | null => {
  if (!path) return null;
  const match = path.match(/avatar-(\d+)\.png/);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Generates avatar URL from number
 */
const getAvatarUrl = (number: number): string => {
  return `${AVATAR_BASE_URL}${number}.png`;
};

export const AvatarPicker = ({
  currentAvatarPath,
  onAvatarChange,
  disabled = false,
}: AvatarPickerProps) => {
  // Initialize with user's current avatar, or default to 1 if they don't have one
  const [currentAvatar, setCurrentAvatar] = useState<number>(() => {
    const avatarNum = getAvatarNumberFromPath(currentAvatarPath);
    return avatarNum ?? 1;
  });

  // Update current avatar when prop changes (when user's avatar changes)
  useEffect(() => {
    const avatarNum = getAvatarNumberFromPath(currentAvatarPath);
    if (avatarNum !== null) {
      setCurrentAvatar(avatarNum);
    } else if (!currentAvatarPath) {
      // If user doesn't have an avatar, default to 1 for preview only
      setCurrentAvatar(1);
    }
  }, [currentAvatarPath]);

  const handlePrevious = useCallback(() => {
    const newAvatar = currentAvatar === 1 ? AVATAR_COUNT : currentAvatar - 1;
    setCurrentAvatar(newAvatar);
    onAvatarChange(getAvatarUrl(newAvatar));
  }, [currentAvatar, onAvatarChange]);

  const handleNext = useCallback(() => {
    const newAvatar = currentAvatar === AVATAR_COUNT ? 1 : currentAvatar + 1;
    setCurrentAvatar(newAvatar);
    onAvatarChange(getAvatarUrl(newAvatar));
  }, [currentAvatar, onAvatarChange]);

  const currentAvatarUrl = useMemo(() => getAvatarUrl(currentAvatar), [currentAvatar]);

  return (
    <div className="flex flex-col items-center gap-4">
      <label className="text-sm font-medium text-foreground">Profile Avatar</label>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={disabled}
          className="h-10 w-10 rounded-full"
          aria-label="Previous avatar"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="relative">
          <Avatar src={currentAvatarUrl} alt={`Avatar ${currentAvatar}`} size="lg" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
            {currentAvatar}/{AVATAR_COUNT}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={disabled}
          className="h-10 w-10 rounded-full"
          aria-label="Next avatar"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Use arrows to cycle through available avatars
      </p>
    </div>
  );
};

