import { useMemo } from 'react';
import { Globe, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ChipSelect } from '@/components/ui/chip-select';
import { LANGUAGES, TRAVEL_INTERESTS, COUNTRIES } from '@/lib/constants';
import type { User } from '@/types/user';

interface TravelInformationCardProps {
  user: User;
  isEditing: boolean;
  isSaving: boolean;
  hobbies: string[];
  languages: string[];
  visited: string[];
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: { hobbies: string[]; languages: string[]; visited: string[] }) => Promise<void>;
  onHobbiesChange: (value: string[]) => void;
  onLanguagesChange: (value: string[]) => void;
  onVisitedChange: (value: string[]) => void;
}

export const TravelInformationCard = ({
  user,
  isEditing,
  isSaving,
  hobbies,
  languages,
  visited,
  onEdit,
  onCancel,
  onSave,
  onHobbiesChange,
  onLanguagesChange,
  onVisitedChange,
}: TravelInformationCardProps) => {
  const languageOptions = useMemo(
    () =>
      LANGUAGES.map((lang) => ({
        value: lang.value,
        label: lang.label,
      })),
    []
  );

  const hobbyOptions = useMemo(
    () =>
      TRAVEL_INTERESTS.map((interest) => ({
        value: interest.value,
        label: interest.label,
      })),
    []
  );

  const handleSave = async () => {
    await onSave({ hobbies, languages, visited });
  };

  return (
    <Card className="mb-6 hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Travel Information
            </CardTitle>
            <CardDescription>Your travel preferences and experiences</CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={onEdit} variant="outline" size="sm" className="flex items-center gap-2">
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Languages Spoken
              </label>
              <ChipSelect
                options={languageOptions}
                value={languages}
                onChange={onLanguagesChange}
                placeholder="Select languages..."
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Countries Visited
              </label>
              <ChipSelect
                options={COUNTRIES}
                value={visited}
                onChange={onVisitedChange}
                placeholder="Select countries you've visited..."
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Hobbies & Interests
              </label>
              <ChipSelect
                options={hobbyOptions}
                value={hobbies}
                onChange={onHobbiesChange}
                placeholder="Select your interests..."
                disabled={isSaving}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
                disabled={isSaving}
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground mb-2">Languages Spoken:</p>
              <div className="flex flex-wrap gap-2">
                {user.languages && user.languages.length > 0 ? (
                  user.languages.map((lang, index) => {
                    const language = LANGUAGES.find((l) => l.value === lang.langCode);
                    return (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                      >
                        {language?.label || lang.langName || lang.langCode}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground">No languages specified</span>
                )}
              </div>
            </div>

            <div>
              <p className="font-medium text-foreground mb-2">Countries Visited:</p>
              <div className="flex flex-wrap gap-2">
                {user.visitedCountries && user.visitedCountries.length > 0 ? (
                  user.visitedCountries.map((vc, index) => {
                    const countryCode = vc.isoCode;
                    const countryName = vc.countryName;
                    const country = countryCode ? COUNTRIES.find((c) => c.value === countryCode) : undefined;
                    return (
                      <span
                        key={index}
                        className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded-md text-sm"
                      >
                        {country?.label || countryName || countryCode || 'Unknown country'}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground">No countries visited yet</span>
                )}
              </div>
            </div>

            <div>
              <p className="font-medium text-foreground mb-2">Hobbies & Interests:</p>
              <div className="flex flex-wrap gap-2">
                {user.hobbies && user.hobbies.length > 0 ? (
                  user.hobbies.map((hobby, index) => {
                    const hobbyOption = TRAVEL_INTERESTS.find((h) => Number(h.value) === hobby.id);
                    return (
                      <span
                        key={index}
                        className="bg-accent/10 text-accent-foreground px-2 py-1 rounded-md text-sm"
                      >
                        {hobbyOption?.label || hobby.hobbyName || `Hobby ${hobby.id}`}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground">No hobbies specified</span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

