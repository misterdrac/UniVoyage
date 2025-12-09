import { useCallback } from 'react';
import { User, Edit2, Save, X, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { AutoComplete, type Option } from '@/components/ui/autocomplete';
import { COUNTRIES } from '@/lib/constants';
import type { User as UserType } from '@/types/user';
import { toast } from 'sonner';

interface ProfileHeaderCardProps {
  user: UserType;
  isEditing: boolean;
  isSaving: boolean;
  name: string;
  surname: string;
  country: Option | undefined;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: { name: string; surname?: string; countryCode?: string }) => Promise<void>;
  onNameChange: (value: string) => void;
  onSurnameChange: (value: string) => void;
  onCountryChange: (value: Option | undefined) => void;
}

export const ProfileHeaderCard = ({
  user,
  isEditing,
  isSaving,
  name,
  surname,
  country,
  onEdit,
  onCancel,
  onSave,
  onNameChange,
  onSurnameChange,
  onCountryChange,
}: ProfileHeaderCardProps) => {
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
    });
  }, [name, surname, country, onSave]);

  return (
    <Card className="mb-6 hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
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

