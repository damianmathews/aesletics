// Core type definitions for IRLXP

export type Difficulty = 'easy' | 'medium' | 'hard' | 'elite' | 'legendary';
export type ProofType = 'check' | 'photo' | 'timer' | 'counter' | 'text';
export type RecurrenceType = 'once' | 'daily' | 'weekly' | 'program';
export type Units = 'metric' | 'imperial';
export type Theme = 'light' | 'dark' | 'system';

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description?: string;
}

export interface QuestTemplate {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  description: string;
  durationMinutes: number;
  proof: ProofType;
  recurrence: RecurrenceType;
  equipment: string[];
  tags: string[];
  baseXP: number;
  safety?: string;
  metrics?: {
    reps?: number;
    timeSec?: number;
    distanceKm?: number;
  };
}

export interface UserQuest {
  id: string;
  templateId?: string;
  custom: boolean;
  title: string;
  category: string;
  difficulty: Difficulty;
  description: string;
  durationMinutes: number;
  proof: ProofType;
  baseXP: number;
  schedule: {
    type: RecurrenceType;
    daysOfWeek?: number[]; // 0-6, Sunday = 0
  };
  startAt?: string; // ISO date
  endAt?: string; // ISO date
  reminders?: boolean;
  equipment: string[];
  tags: string[];
  safety?: string;
  active: boolean;
  createdAt: string;
}

export interface CompletionMetrics {
  reps?: number;
  timeSec?: number;
  distanceKm?: number;
  weight?: number;
  notes?: string;
}

export interface CompletionProof {
  type: ProofType;
  text?: string;
  photoId?: string;
  timerSeconds?: number;
  counterValue?: number;
}

export interface Completion {
  id: string;
  userQuestId: string;
  questTitle: string;
  category: string;
  difficulty: Difficulty;
  at: string; // ISO date-time
  xp: number;
  metrics?: CompletionMetrics;
  proof?: CompletionProof;
  streakDay?: number;
  streakBonus?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp: number;
  rule: string; // 'first', 'streak7', 'streak30', '1kxp', '10kxp', etc.
  earned?: boolean;
  earnedAt?: string;
}

export interface Season {
  id: string;
  title: string;
  start: string; // ISO date
  end: string; // ISO date
  xpMultiplier: number;
  active: boolean;
}

export interface QuestPack {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  durationDays: number;
  difficulty: Difficulty;
  quests: Array<{
    templateId: string;
    day: number;
    notes?: string;
  }>;
  locked: boolean;
  icon: string;
  tags: string[];
}

export interface UserProfile {
  nickname: string;
  avatar?: string;
  joinedAt: string;
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  completedQuests: number;
  badges: string[]; // badge IDs
}

export interface Settings {
  theme: Theme;
  units: Units;
  notifications: boolean;
  soundEffects: boolean;
  weekStartsOn: number; // 0-6, Sunday = 0
}

export interface AppState {
  profile: UserProfile;
  settings: Settings;
  userQuests: UserQuest[];
  completions: Completion[];
  activePacks: string[]; // pack IDs
  currentSeason?: Season;
  initialized: boolean;
  onboardingComplete: boolean;
}

// Filters for quest library
export interface QuestFilters {
  search: string;
  categories: string[];
  difficulties: Difficulty[];
  durations: string[]; // '0-10', '10-30', '30-60', '60+'
  equipment: string[];
  proofTypes: ProofType[];
  tags: string[];
  sortBy: 'recommended' | 'popular' | 'difficulty' | 'duration' | 'newest';
}

// Stats for analytics
export interface UserStats {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  completedQuests: number;
  completedToday: number;
  completedThisWeek: number;
  completedThisMonth: number;
  xpToday: number;
  xpThisWeek: number;
  xpThisMonth: number;
  averageDifficulty: number;
  favoriteCategory?: string;
  last14DaysXP: number[];
  completionRate: number;
}

// Local leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  xp: number;
  level: number;
  streak: number;
  isYou: boolean;
}
