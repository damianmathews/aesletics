// XP, Level, and Streak calculations

import type { Difficulty, ProofType, Completion } from '../types';

// Base XP by difficulty
export const BASE_XP: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 40,
  elite: 80,
  legendary: 160,
};

// Proof type multipliers
export const PROOF_MULTIPLIERS: Record<ProofType, number> = {
  check: 1.0,
  text: 1.0,
  counter: 1.05,
  timer: 1.1,
  photo: 1.1,
};

// Calculate XP for a quest completion
export function calculateXP(
  baseXP: number,
  proofType: ProofType,
  streakDays: number
): number {
  // Apply proof multiplier
  let xp = baseXP * PROOF_MULTIPLIERS[proofType];

  // Apply streak bonus (2% per day, max 30%)
  const streakBonus = Math.min(streakDays * 0.02, 0.3);
  xp = xp * (1 + streakBonus);

  return Math.floor(xp);
}

// Calculate level from total XP
export function calculateLevel(totalXP: number): number {
  let level = 1;
  while (totalXP >= getXPForLevel(level + 1)) {
    level++;
  }
  return level;
}

// Calculate total XP required for a given level
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 1.6));
}

// Calculate XP progress in current level
export function getLevelProgress(totalXP: number): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number; // 0-1
  xpToNextLevel: number;
} {
  const level = calculateLevel(totalXP);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const xpInLevel = totalXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const progress = xpNeededForLevel > 0 ? xpInLevel / xpNeededForLevel : 0;
  const xpToNextLevel = nextLevelXP - totalXP;

  return {
    level,
    currentLevelXP: xpInLevel,
    nextLevelXP: xpNeededForLevel,
    progress,
    xpToNextLevel,
  };
}

// Streak calculations
export function calculateStreak(completions: Completion[]): {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
} {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCompletionDate: null };
  }

  // Sort completions by date (most recent first)
  const sorted = [...completions].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  const lastCompletionDate = sorted[0].at;
  const now = new Date();

  // Get unique completion days (YYYY-MM-DD format)
  const uniqueDays = new Set(
    sorted.map((c) => new Date(c.at).toISOString().split('T')[0])
  );
  const days = Array.from(uniqueDays).sort().reverse();

  // Calculate current streak
  let currentStreak = 0;

  // Check if streak is still active (completed today or yesterday with grace period)
  const lastDay = days[0];
  const hoursSinceLastCompletion =
    (now.getTime() - new Date(lastCompletionDate).getTime()) / (1000 * 60 * 60);

  if (hoursSinceLastCompletion > 36) {
    // Streak broken (grace period expired)
    currentStreak = 0;
  } else {
    // Count consecutive days
    let expectedDate = new Date(lastDay);
    for (const day of days) {
      const dayDate = new Date(day);
      const diffDays = Math.floor(
        (expectedDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        currentStreak++;
        expectedDate = new Date(dayDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 0; i < days.length - 1; i++) {
    const current = new Date(days[i]);
    const next = new Date(days[i + 1]);
    const diffDays = Math.floor(
      (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { currentStreak, longestStreak, lastCompletionDate };
}

// Check if a badge rule is satisfied
export function checkBadgeRule(
  rule: string,
  completions: Completion[],
  totalXP: number,
  streak: { currentStreak: number; longestStreak: number }
): boolean {
  switch (rule) {
    case 'first':
      return completions.length >= 1;
    case 'streak7':
      return streak.currentStreak >= 7 || streak.longestStreak >= 7;
    case 'streak30':
      return streak.currentStreak >= 30 || streak.longestStreak >= 30;
    case '1kxp':
      return totalXP >= 1000;
    case '10kxp':
      return totalXP >= 10000;
    case '50kxp':
      return totalXP >= 50000;
    case '100kxp':
      return totalXP >= 100000;
    case 'discipline10':
      return completions.filter((c) => c.category === 'discipline').length >= 10;
    case 'fitness50':
      return completions.filter((c) => c.category === 'fitness-strength').length >= 50;
    case 'creator':
      return completions.filter((c) => c.category === 'creativity').length >= 1;
    case 'marathoner':
      return completions.some((c) => c.questTitle.toLowerCase().includes('marathon'));
    case 'early-riser':
      return completions.filter((c) => c.questTitle.toLowerCase().includes('wake')).length >= 7;
    default:
      return false;
  }
}

// Calculate average difficulty
export function calculateAverageDifficulty(completions: Completion[]): number {
  if (completions.length === 0) return 0;

  const difficultyValues: Record<Difficulty, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
    elite: 4,
    legendary: 5,
  };

  const sum = completions.reduce(
    (acc, c) => acc + (difficultyValues[c.difficulty] || 0),
    0
  );
  return sum / completions.length;
}
