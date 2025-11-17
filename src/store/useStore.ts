// Zustand store with persistence
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  UserQuest,
  Completion,
  UserProfile,
  Settings,
  UserStats,
} from '../types';
import { calculateLevel, calculateStreak } from '../lib/xp';
import { questTemplatesExtended } from '../data/seed';

interface StoreState extends AppState {
  // Actions
  initialize: () => void;
  initializeFromAuth: (displayName: string | null, email: string | null) => void;
  loadFromFirestore: (data: any) => void;
  completeOnboarding: () => void;
  addUserQuest: (quest: UserQuest) => void;
  removeUserQuest: (questId: string) => void;
  toggleQuestActive: (questId: string) => void;
  addCompletion: (completion: Omit<Completion, 'id'>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  activatePack: (packId: string) => void;
  deactivatePack: (packId: string) => void;

  // Computed
  getStats: () => UserStats;
  getTodaysQuests: () => UserQuest[];
  getQuestById: (id: string) => UserQuest | undefined;
}

const initialProfile: UserProfile = {
  nickname: 'Athlete',
  joinedAt: new Date().toISOString(),
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  completedQuests: 0,
  badges: [],
};

const initialSettings: Settings = {
  theme: 'dark',
  units: 'imperial',
  notifications: true,
  soundEffects: true,
  weekStartsOn: 0,
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      settings: initialSettings,
      userQuests: [],
      completions: [],
      activePacks: [],
      currentSeason: undefined,
      initialized: false,
      onboardingComplete: false,

      initialize: () => {
        const state = get();
        if (!state.initialized) {
          // Add some starter quests
          const starterQuestIds = ['q001', 'q046', 'q124', 'q127'];
          const starterQuests: UserQuest[] = starterQuestIds
            .map(id => {
              const template = questTemplatesExtended.find(q => q.id === id);
              if (!template) return null;
              return {
                id: `uq-${Date.now()}-${Math.random()}`,
                templateId: template.id,
                custom: false,
                title: template.title,
                category: template.category,
                difficulty: template.difficulty,
                description: template.description,
                durationMinutes: template.durationMinutes,
                proof: template.proof,
                baseXP: template.baseXP,
                schedule: { type: template.recurrence },
                equipment: template.equipment,
                tags: template.tags,
                safety: template.safety,
                active: true,
                createdAt: new Date().toISOString(),
              };
            })
            .filter(Boolean) as UserQuest[];

          set({ userQuests: starterQuests, initialized: true });
        }
      },

      initializeFromAuth: (displayName, _email) => {
        const state = get();
        // Only update nickname if it's still the default 'Athlete'
        if (state.profile.nickname === 'Athlete' && displayName) {
          set((state) => ({
            profile: {
              ...state.profile,
              nickname: displayName,
            },
          }));
        }
      },

      loadFromFirestore: (data) => {
        if (!data) return;
        set({
          profile: data.profile || initialProfile,
          userQuests: data.userQuests || [],
          completions: data.completions || [],
          activePacks: data.activePacks || [],
          settings: data.settings || initialSettings,
          initialized: true,
        });
      },

      completeOnboarding: () => set({ onboardingComplete: true }),

      addUserQuest: (quest) =>
        set((state) => ({
          userQuests: [...state.userQuests, quest],
        })),

      removeUserQuest: (questId) =>
        set((state) => ({
          userQuests: state.userQuests.filter((q) => q.id !== questId),
        })),

      toggleQuestActive: (questId) =>
        set((state) => ({
          userQuests: state.userQuests.map((q) =>
            q.id === questId ? { ...q, active: !q.active } : q
          ),
        })),

      addCompletion: (completion) => {
        const newCompletion: Completion = {
          ...completion,
          id: `c-${Date.now()}-${Math.random()}`,
        };

        set((state) => {
          const newCompletions = [...state.completions, newCompletion];
          const newTotalXP = state.profile.totalXP + completion.xp;
          const newLevel = calculateLevel(newTotalXP);
          const streakData = calculateStreak(newCompletions);

          return {
            completions: newCompletions,
            profile: {
              ...state.profile,
              totalXP: newTotalXP,
              level: newLevel,
              currentStreak: streakData.currentStreak,
              longestStreak: Math.max(
                state.profile.longestStreak,
                streakData.longestStreak
              ),
              completedQuests: newCompletions.length,
            },
          };
        });
      },

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      updateProfile: (profile) =>
        set((state) => ({
          profile: { ...state.profile, ...profile },
        })),

      activatePack: (packId) =>
        set((state) => ({
          activePacks: [...state.activePacks, packId],
        })),

      deactivatePack: (packId) =>
        set((state) => ({
          activePacks: state.activePacks.filter((id) => id !== packId),
        })),

      getStats: (): UserStats => {
        const state = get();
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const completedToday = state.completions.filter(
          (c) => c.at.split('T')[0] === today
        ).length;

        const completedThisWeek = state.completions.filter(
          (c) => new Date(c.at) >= weekAgo
        ).length;

        const completedThisMonth = state.completions.filter(
          (c) => new Date(c.at) >= monthAgo
        ).length;

        const xpToday = state.completions
          .filter((c) => c.at.split('T')[0] === today)
          .reduce((sum, c) => sum + c.xp, 0);

        const xpThisWeek = state.completions
          .filter((c) => new Date(c.at) >= weekAgo)
          .reduce((sum, c) => sum + c.xp, 0);

        const xpThisMonth = state.completions
          .filter((c) => new Date(c.at) >= monthAgo)
          .reduce((sum, c) => sum + c.xp, 0);

        // Last 14 days XP
        const last14DaysXP: number[] = [];
        for (let i = 13; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dateStr = date.toISOString().split('T')[0];
          const xp = state.completions
            .filter((c) => c.at.split('T')[0] === dateStr)
            .reduce((sum, c) => sum + c.xp, 0);
          last14DaysXP.push(xp);
        }

        // Average difficulty
        const difficulties = { easy: 1, medium: 2, hard: 3, elite: 4, legendary: 5 };
        const averageDifficulty =
          state.completions.length > 0
            ? state.completions.reduce(
                (sum, c) => sum + (difficulties[c.difficulty] || 0),
                0
              ) / state.completions.length
            : 0;

        // Favorite category
        const categoryCount: Record<string, number> = {};
        state.completions.forEach((c) => {
          categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
        });
        const favoriteCategory = Object.entries(categoryCount).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0];

        return {
          totalXP: state.profile.totalXP,
          level: state.profile.level,
          currentStreak: state.profile.currentStreak,
          longestStreak: state.profile.longestStreak,
          completedQuests: state.profile.completedQuests,
          completedToday,
          completedThisWeek,
          completedThisMonth,
          xpToday,
          xpThisWeek,
          xpThisMonth,
          averageDifficulty,
          favoriteCategory,
          last14DaysXP,
          completionRate: 0, // TODO: Calculate based on scheduled quests
        };
      },

      getTodaysQuests: (): UserQuest[] => {
        const state = get();
        const today = new Date().getDay(); // 0-6
        return state.userQuests.filter((q) => {
          if (!q.active) return false;
          if (q.schedule.type === 'daily') return true;
          if (q.schedule.type === 'weekly' && q.schedule.daysOfWeek) {
            return q.schedule.daysOfWeek.includes(today);
          }
          return false;
        });
      },

      getQuestById: (id: string): UserQuest | undefined => {
        return get().userQuests.find((q) => q.id === id);
      },
    }),
    {
      name: 'irlxp-storage',
    }
  )
);
