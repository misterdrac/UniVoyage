import { useMemo } from 'react';
import { Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import type { User } from '@/types/user';

interface ProfileCompletionCardProps {
  user: User;
}

export const ProfileCompletionCard = ({ user }: ProfileCompletionCardProps) => {
  const { profileCompletion, completedFields, totalFields } = useMemo(() => {
    const profileFields = [
      user.name,
      user.surname,
      user.countryOfOrigin,
      user.profileImage,
      (user.languages?.length ?? 0) > 0,
      (user.visitedCountries?.length ?? 0) > 0,
      (user.hobbies?.length ?? 0) > 0,
    ];
    const completed = profileFields.filter(Boolean).length;
    const total = profileFields.length;
    return {
      profileCompletion: Math.round((completed / total) * 100),
      completedFields: completed,
      totalFields: total,
    };
  }, [
    user.name,
    user.surname,
    user.countryOfOrigin,
    user.profileImage,
    user.languages,
    user.visitedCountries,
    user.hobbies,
  ]);

  return (
    <Card className="mb-6 border-2 border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Profile Completion
          </span>
          <span className="text-2xl font-bold text-primary">{profileCompletion}%</span>
        </CardTitle>
        <CardDescription>
          Complete your profile so we can give you personalized suggestions and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary to-primary/80 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {completedFields} of {totalFields} fields completed
        </p>
      </CardContent>
    </Card>
  );
};

