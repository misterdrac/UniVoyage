import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { calculateAchievements } from './utils/achievements';
import { AchievementBadge } from './AchievementBadge';
import type { User } from '@/data/mockUsers';

interface AchievementsSectionProps {
  user: User;
}

export const AchievementsSection = ({ user }: AchievementsSectionProps) => {
  const achievements = useMemo(() => {
    const stats = {
      languagesSpoken: user.languages?.length || 0,
      countriesVisited: user.visited?.length || 0,
      interests: user.hobbies?.length || 0,
      memberFor: Math.floor(
        (new Date().getTime() - new Date(user.dateOfRegister).getTime()) / (1000 * 60 * 60 * 24)
      ),
    };

    return calculateAchievements(stats);
  }, [user.languages, user.visited, user.hobbies, user.dateOfRegister]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" style={{ color: 'var(--profile-achievement-trophy)' }} />
          Achievements
        </CardTitle>
        <CardDescription>Unlock achievements by completing various milestones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <AchievementBadge key={`${achievement.type}-${index}`} achievement={achievement} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

