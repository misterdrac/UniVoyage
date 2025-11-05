import { Star } from 'lucide-react';
import { getTierColor, type Achievement } from './utils/achievements';

interface AchievementBadgeProps {
  achievement: Achievement;
}

export const AchievementBadge = ({ achievement }: AchievementBadgeProps) => {
  const tierColor = achievement.unlocked ? getTierColor(achievement.tier) : null;
  const Icon = achievement.icon;

  return (
    <div
      className={`relative group cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
        achievement.unlocked
          ? `bg-linear-to-br ${tierColor?.bg} ${tierColor?.border} shadow-lg hover:shadow-2xl hover:scale-105`
          : 'bg-muted/50 border-muted opacity-60 hover:opacity-80'
      }`}
    >
      {/* Glow effect for unlocked achievements */}
      {achievement.unlocked && tierColor && (
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-40 blur-2xl transition-opacity duration-300 pointer-events-none"
          style={{
            background: tierColor.border.includes('amber')
              ? 'rgba(217, 119, 6, 0.3)'
              : tierColor.border.includes('slate')
              ? 'rgba(148, 163, 184, 0.3)'
              : tierColor.border.includes('yellow')
              ? 'rgba(234, 179, 8, 0.3)'
              : tierColor.border.includes('emerald')
              ? 'rgba(16, 185, 129, 0.3)'
              : tierColor.border.includes('red')
              ? 'rgba(239, 68, 68, 0.3)'
              : tierColor.border.includes('blue')
              ? 'rgba(59, 130, 246, 0.3)'
              : tierColor.border.includes('purple')
              ? 'rgba(168, 85, 247, 0.3)'
              : tierColor.border.includes('cyan')
              ? 'rgba(34, 211, 238, 0.3)'
              : 'rgba(99, 102, 241, 0.3)', // Default for Cosmic (indigo)
          }}
        />
      )}

      <div className={`relative flex flex-col items-center text-center ${achievement.unlocked ? '' : 'grayscale'}`}>
        {/* Icon Badge */}
        <div
          className={`relative mb-4 p-4 rounded-full transition-all duration-300 ${
            achievement.unlocked
              ? `bg-linear-to-br ${tierColor?.bg} ${tierColor?.border} border-2 shadow-lg group-hover:scale-110`
              : 'bg-muted border-2 border-muted'
          }`}
        >
          <Icon
            className={`w-10 h-10 transition-transform duration-300 group-hover:rotate-12 ${
              achievement.unlocked && tierColor ? tierColor.icon : 'text-muted-foreground'
            }`}
          />
          {achievement.unlocked && tierColor && (
            <div className="absolute -top-1 -right-1">
              <Star className={`w-5 h-5 ${tierColor.star} fill-current drop-shadow-lg`} />
            </div>
          )}
        </div>

        {/* Achievement Name */}
        <h3
          className={`text-lg font-bold mb-2 ${
            achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {achievement.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 min-h-10">{achievement.description}</p>

        {/* Tier Badge */}
        {achievement.unlocked && tierColor && (
          <div
            className={`mt-auto px-3 py-1 rounded-full text-xs font-semibold ${tierColor.border} border ${tierColor.icon} bg-background/50`}
          >
            {tierColor.name} Tier
          </div>
        )}

        {/* Locked State */}
        {!achievement.unlocked && (
          <div className="mt-auto px-3 py-1 rounded-full text-xs font-semibold text-muted-foreground bg-muted border border-muted">
            Locked
          </div>
        )}
      </div>

      {/* Hover Effect Border */}
      {achievement.unlocked && (
        <div
          className={`absolute inset-0 rounded-xl border-2 ${tierColor?.border} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
        />
      )}
    </div>
  );
};

