import { Languages, Globe, Sparkles, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Achievement tier definitions
export const LANGUAGE_TIERS = [
  { name: 'Bilingual', threshold: 2, description: 'Speak 2 languages' },
  { name: 'Polyglot', threshold: 3, description: 'Speak 3 languages' },
  { name: 'Linguist', threshold: 5, description: 'Speak 5+ languages' },
  { name: 'Master Linguist', threshold: 10, description: 'Speak 10+ languages' },
];

export const COUNTRY_TIERS = [
  { name: 'Wanderer', threshold: 5, description: 'Visit 5 countries' },
  { name: 'Explorer', threshold: 10, description: 'Visit 10 countries' },
  { name: 'World Traveler', threshold: 20, description: 'Visit 20 countries' },
  { name: 'Globetrotter', threshold: 50, description: 'Visit 50 countries' },
  { name: 'Master Traveler', threshold: 100, description: 'Visit 100 countries' },
  { name: 'Legendary Explorer', threshold: 150, description: 'Visit 150 countries' },
  { name: 'UN Ambassador', threshold: 193, description: 'Visit all 193 UN member countries' },
];

export const INTEREST_TIERS = [
  { name: 'Curious', threshold: 2, description: 'Have 2 interests' },
  { name: 'Enthusiast', threshold: 5, description: 'Have 5+ interests' },
  { name: 'Passionate', threshold: 10, description: 'Have 10+ interests' },
];

export const MEMBER_TIERS = [
  { name: 'Newcomer', threshold: 30, description: 'Member for 1 month' },
  { name: 'Loyal', threshold: 365, description: 'Member for 1 year' },
  { name: 'Dedicated', threshold: 730, description: 'Member for 2 years' },
  { name: 'Veteran', threshold: 1825, description: 'Member for 5 years' },
  { name: 'Champion', threshold: 3650, description: 'Member for 10 years' },
  { name: 'Legend', threshold: 18250, description: 'Member for 50 years' },
  { name: 'SixSeven', threshold: 24455, description: 'Member for 67 years' },
  { name: 'Immortal', threshold: 365000, description: 'Member for 1000 years (How is this possible?)' },
];

// Tier color definitions
export interface TierColor {
  name: string;
  bg: string;
  border: string;
  icon: string;
  star: string;
}

const TIER_COLORS: TierColor[] = [
  { name: 'Silver', bg: 'from-slate-400/20 to-slate-500/10', border: 'border-slate-400', icon: 'text-slate-400', star: 'text-slate-300' },
  { name: 'Gold', bg: 'from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-500', icon: 'text-yellow-500', star: 'text-yellow-400' },
  { name: 'Emerald', bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500', icon: 'text-emerald-500', star: 'text-emerald-400' },
  { name: 'Ruby', bg: 'from-red-500/20 to-red-600/10', border: 'border-red-500', icon: 'text-red-500', star: 'text-red-400' },
  { name: 'Sapphire', bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500', icon: 'text-blue-500', star: 'text-blue-400' },
  { name: 'Amethyst', bg: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500', icon: 'text-purple-500', star: 'text-purple-400' },
  { name: 'Diamond', bg: 'from-cyan-400/20 to-cyan-500/10', border: 'border-cyan-400', icon: 'text-cyan-400', star: 'text-cyan-300' },
  { name: 'Cosmic', bg: 'from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500', icon: 'text-indigo-500', star: 'text-indigo-400' },
];

// Achievement type definition
export interface Achievement {
  name: string;
  icon: LucideIcon;
  unlocked: boolean;
  description: string;
  tier: number;
  type: 'language' | 'country' | 'interest' | 'member';
}

// Helper functions
export const getAchievementTier = (value: number, thresholds: number[]): number => {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (value >= thresholds[i]) {
      return i;
    }
  }
  return -1;
};

export const getTierColor = (tier: number): TierColor => {
  return TIER_COLORS[Math.min(tier, TIER_COLORS.length - 1)] || TIER_COLORS[TIER_COLORS.length - 1];
};

// Calculate achievements from user stats
export const calculateAchievements = (
  stats: {
    languagesSpoken: number;
    countriesVisited: number;
    interests: number;
    memberFor: number;
  }
): Achievement[] => {
  const languageTier = getAchievementTier(stats.languagesSpoken, LANGUAGE_TIERS.map(t => t.threshold));
  const countryTier = getAchievementTier(stats.countriesVisited, COUNTRY_TIERS.map(t => t.threshold));
  const interestTier = getAchievementTier(stats.interests, INTEREST_TIERS.map(t => t.threshold));
  const memberTier = getAchievementTier(stats.memberFor, MEMBER_TIERS.map(t => t.threshold));

  return [
    {
      name: languageTier >= 0 ? LANGUAGE_TIERS[languageTier].name : 'Bilingual',
      icon: Languages,
      unlocked: languageTier >= 0,
      description: languageTier >= 0 ? LANGUAGE_TIERS[languageTier].description : 'Speak 2 languages',
      tier: languageTier,
      type: 'language',
    },
    {
      name: countryTier >= 0 ? COUNTRY_TIERS[countryTier].name : 'Wanderer',
      icon: Globe,
      unlocked: countryTier >= 0,
      description: countryTier >= 0 ? COUNTRY_TIERS[countryTier].description : 'Visit 5 countries',
      tier: countryTier,
      type: 'country',
    },
    {
      name: interestTier >= 0 ? INTEREST_TIERS[interestTier].name : 'Curious',
      icon: Sparkles,
      unlocked: interestTier >= 0,
      description: interestTier >= 0 ? INTEREST_TIERS[interestTier].description : 'Have 2 interests',
      tier: interestTier,
      type: 'interest',
    },
    {
      name: memberTier >= 0 ? MEMBER_TIERS[memberTier].name : 'Newcomer',
      icon: Trophy,
      unlocked: memberTier >= 0,
      description: memberTier >= 0 ? MEMBER_TIERS[memberTier].description : 'Member for 1 month',
      tier: memberTier,
      type: 'member',
    },
  ];
};

