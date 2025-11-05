import { useCallback } from 'react';
import { User, Edit2, Save, X, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { AutoComplete, type Option } from '@/components/ui/autocomplete';
import { COUNTRIES } from '@/lib/constants';
import { ProfileAvatar } from './ProfileAvatar';
import type { User as UserType } from '@/data/mockUsers';
import { toast } from 'sonner';

interface ProfileHeaderCardProps {
  user: UserType;
  isEditing: boolean;
  isSaving: boolean;
  isLoading: boolean;
  firstName: string;
  surname: string;
  country: Option | undefined;
  imagePreview: string | null;
  isUploadingImage: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: { firstName: string; surname?: string; country?: string }) => Promise<void>;
  onFirstNameChange: (value: string) => void;
  onSurnameChange: (value: string) => void;
  onCountryChange: (value: Option | undefined) => void;
  onImageClick: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeaderCard = ({
  user,
  isEditing,
  isSaving,
  isLoading,
  firstName,
  surname,
  country,
  imagePreview,
  isUploadingImage,
  fileInputRef,
  onEdit,
  onCancel,
  onSave,
  onFirstNameChange,
  onSurnameChange,
  onCountryChange,
  onImageClick,
  onImageChange,
}: ProfileHeaderCardProps) => {
  const handleSave = useCallback(async () => {
    // Validation
    if (!firstName.trim()) {
      toast.error('First name is required');
      return;
    }

    if (firstName.trim().length < 2) {
      toast.error('First name must be at least 2 characters');
      return;
    }

    await onSave({
      firstName: firstName.trim(),
      surname: surname.trim() || undefined,
      country: country?.value || undefined,
    });
  }, [firstName, surname, country, onSave]);

  const altText = `${user.firstName} ${user.surname || ''}`.trim() || 'Profile picture';

  return (
    <Card className="mb-6 hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>Your basic profile details</CardDescription>
          </div>
          {!isEditing && (
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <ProfileAvatar
            imageUrl={user.profileImage}
            imagePreview={imagePreview}
            isUploading={isUploadingImage}
            isEditing={isEditing}
            isLoading={isLoading}
            onImageClick={onImageClick}
            onImageChange={onImageChange}
            fileInputRef={fileInputRef}
            altText={altText}
          />
          <div className="flex-1 w-full">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      First Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={firstName}
                      onChange={(e) => onFirstNameChange(e.target.value)}
                      placeholder="Enter your first name"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Surname
                    </label>
                    <Input
                      value={surname}
                      onChange={(e) => onSurnameChange(e.target.value)}
                      placeholder="Enter your surname"
                      disabled={isSaving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Country of Origin
                  </label>
                  <AutoComplete
                    options={COUNTRIES}
                    value={country}
                    onValueChange={onCountryChange}
                    placeholder="Select your country..."
                    emptyMessage="No countries found"
                    disabled={isSaving}
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {user.firstName} {user.surname || ''}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="space-y-2">
                  {user.country && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">Country:</span>{' '}
                        {COUNTRIES.find((c) => c.value === user.country)?.label || user.country}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={isSaving}
              size="sm"
              className="flex items-center gap-2"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !firstName.trim()}
              size="sm"
              className="flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

