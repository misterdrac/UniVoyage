import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseProfileImageProps {
  uploadProfilePicture: (file: File) => Promise<{ success: boolean; error?: string }>;
}

export const useProfileImage = ({ uploadProfilePicture }: UseProfileImageProps) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    setIsUploadingImage(true);
    try {
      const result = await uploadProfilePicture(file);
      if (result.success) {
        toast.success('Profile picture updated successfully!');
        setImagePreview(null);
      } else {
        toast.error(result.error || 'Failed to upload profile picture');
        setImagePreview(null);
      }
    } catch (error) {
      toast.error('An error occurred while uploading your profile picture');
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [uploadProfilePicture]);

  const clearImagePreview = useCallback(() => {
    setImagePreview(null);
  }, []);

  return {
    isUploadingImage,
    imagePreview,
    fileInputRef,
    handleImageClick,
    handleImageChange,
    clearImagePreview,
  };
};

