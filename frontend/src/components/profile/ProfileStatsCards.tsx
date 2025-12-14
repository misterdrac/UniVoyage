import { useMemo } from 'react';
import { Globe, Languages, Award, Timer } from 'lucide-react';
import { StatCard } from './StatCard';
import type { User } from '@/types/user';

interface ProfileStatsCardsProps {
  user: User;
}

export const ProfileStatsCards = ({ user }: ProfileStatsCardsProps) => {
  const stats = useMemo(
    () => ({
      countriesVisited: user.visitedCountries?.length || 0,
      languagesSpoken: user.languages?.length || 0,
      interests: user.hobbies?.length || 0,
      memberFor: user.dateOfRegister
        ? Math.floor(
            (new Date().getTime() - new Date(user.dateOfRegister).getTime()) /
            (1000 * 60 * 60 * 24)
          )
        : 0,
    }),
    [user.visitedCountries, user.languages, user.hobbies, user.dateOfRegister]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Countries Visited"
        value={stats.countriesVisited}
        icon={Globe}
        iconBgFrom="var(--profile-stat-blue-bg-from)"
        iconBgTo="var(--profile-stat-blue-bg-to)"
        iconColor="var(--profile-stat-blue)"
      />
      <StatCard
        label="Languages Spoken"
        value={stats.languagesSpoken}
        icon={Languages}
        iconBgFrom="var(--profile-stat-purple-bg-from)"
        iconBgTo="var(--profile-stat-purple-bg-to)"
        iconColor="var(--profile-stat-purple)"
      />
      <StatCard
        label="Interests"
        value={stats.interests}
        icon={Award}
        iconBgFrom="var(--profile-stat-amber-bg-from)"
        iconBgTo="var(--profile-stat-amber-bg-to)"
        iconColor="var(--profile-stat-amber)"
      />
      <StatCard
        label="Member For"
        value={stats.memberFor}
        icon={Timer}
        iconBgFrom="var(--profile-stat-green-bg-from)"
        iconBgTo="var(--profile-stat-green-bg-to)"
        iconColor="var(--profile-stat-green)"
        suffix="days"
      />
    </div>
  );
};

