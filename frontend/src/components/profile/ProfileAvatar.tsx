import { User, Camera, Loader2 } from 'lucide-react';
import { UI_CONSTANTS } from '@/lib/constants';

interface ProfileAvatarProps {
  imageUrl?: string | null;
  imagePreview?: string | null;
  isUploading: boolean;
  isEditing: boolean;
  isLoading: boolean;
  onImageClick: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  altText: string;
}

export const ProfileAvatar = ({
  imageUrl,
  imagePreview,
  isUploading,
  isEditing,
  isLoading,
  onImageClick,
  onImageChange,
  fileInputRef,
  altText,
}: ProfileAvatarProps) => {
  const displayImage = imagePreview || imageUrl;

  return (
    <div className="shrink-0 relative">
      <div className="relative group">
        {displayImage ? (
          <img
            src={displayImage}
            alt={altText}
            className="rounded-full object-cover border-2 border-border"
            style={{ width: UI_CONSTANTS.PROFILE_PICTURE_SIZE.LARGE, height: UI_CONSTANTS.PROFILE_PICTURE_SIZE.LARGE }}
          />
        ) : (
          <div
            className="rounded-full bg-muted flex items-center justify-center border-2 border-border"
            style={{ width: UI_CONSTANTS.PROFILE_PICTURE_SIZE.LARGE, height: UI_CONSTANTS.PROFILE_PICTURE_SIZE.LARGE }}
          >
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-background/80 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        {isEditing && (
          <button
            type="button"
            onClick={onImageClick}
            disabled={isUploading || isLoading}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageChange}
        className="hidden"
        disabled={isUploading || isLoading || !isEditing}
      />
      {isEditing && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Click to upload
        </p>
      )}
    </div>
  );
};

