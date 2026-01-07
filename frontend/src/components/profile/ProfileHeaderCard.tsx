import { useCallback, useMemo } from 'react';
import { Edit2, Save, X, Mail, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { AutoComplete, type Option } from '@/components/ui/autocomplete';
import { COUNTRIES } from '@/lib/constants';
import type { User as UserType } from '@/types/user';
import { toast } from 'sonner';
import { AvatarPicker } from './AvatarPicker';
import { Avatar } from './Avatar';

interface ProfileHeaderCardProps {
  user: UserType;
  isEditing: boolean;
  isSaving: boolean;
  name: string;
  surname: string;
  country: Option | undefined;
  profileImagePath?: string;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: { name: string; surname?: string; countryCode?: string; profileImagePath?: string }) => Promise<void>;
  onNameChange: (value: string) => void;
  onSurnameChange: (value: string) => void;
  onCountryChange: (value: Option | undefined) => void;
  onProfileImagePathChange: (value: string) => void;
}

export const ProfileHeaderCard = ({
  user,
  isEditing,
  isSaving,
  name,
  surname,
  country,
  profileImagePath,
  onEdit,
  onCancel,
  onSave,
  onNameChange,
  onSurnameChange,
  onCountryChange,
  onProfileImagePathChange,
}: ProfileHeaderCardProps) => {
  // Check if profile is incomplete (missing avatar, surname, or country)
  const isProfileIncomplete = useMemo(() => {
    const missingFields = [
      !user.profileImagePath,
      !user.surname,
      !user.countryOfOrigin,
    ].filter(Boolean).length;
    return missingFields > 0;
  }, [user.profileImagePath, user.surname, user.countryOfOrigin]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    await onSave({
      name: name.trim(),
      surname: surname.trim() || undefined,
      countryCode: country?.value || undefined,
      // Send empty string to remove avatar, undefined to not update, or the URL to set it
      profileImagePath: profileImagePath === undefined ? undefined : (profileImagePath?.trim() || ""),
    });
  }, [name, surname, country, profileImagePath, onSave]);

  return (
    <Card className="mb-6 hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar src={user.profileImagePath} alt="Profile" size="md" />
              {isProfileIncomplete && !isEditing && (
                <div 
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg group cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={onEdit}
                  title={"Complete your profile"}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Profile Information
              </CardTitle>
              <CardDescription>Your basic profile details</CardDescription>
            </div>
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
        <div className="flex-1 w-full">
          {isEditing ? (
            <div className="space-y-4">
              <AvatarPicker
                currentAvatarPath={profileImagePath}
                onAvatarChange={onProfileImagePathChange}
                disabled={isSaving}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Enter your name"
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
                {user.name} {user.surname || ''}
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="space-y-2">
                {user.countryOfOrigin && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">Country:</span>{' '}
                      {user.countryOfOrigin.countryName}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
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
              disabled={isSaving || !name.trim()}
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

