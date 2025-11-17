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
  OnboardingData,
} from '../types';
import { calculateLevel, calculateStreak } from '../lib/xp';
import { questTemplatesExtended } from '../data/seed';

interface QuestCompleteData {
  questTitle: string;
  xpEarned: number;
  streakBonus: number;
}

interface LevelUpData {
  newLevel: number;
  totalXP: number;
}

interface StoreState extends AppState {
  // Celebration modals
  showQuestCompleteModal: boolean;
  questCompleteData: QuestCompleteData | null;
  showLevelUpModal: boolean;
  levelUpData: LevelUpData | null;

  // Actions
  initialize: () => void;
  initializeFromAuth: (displayName: string | null, email: string | null) => void;
  loadFromFirestore: (data: any) => void;
  completeOnboarding: () => void;
  saveOnboardingData: (data: OnboardingData) => void;
  setShowTutorial: (show: boolean) => void;
  addUserQuest: (quest: UserQuest) => void;
  removeUserQuest: (questId: string) => void;
  toggleQuestActive: (questId: string) => void;
  addCompletion: (completion: Omit<Completion, 'id'>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  activatePack: (packId: string) => void;
  deactivatePack: (packId: string) => void;
  closeQuestCompleteModal: () => void;
  closeLevelUpModal: () => void;

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
      onboardingData: null,
      showTutorial: false,
      showQuestCompleteModal: false,
      questCompleteData: null,
      showLevelUpModal: false,
      levelUpData: null,

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
                schedule: {
                  type: template.recurrence,
                  // For weekly quests, default to all days so they always show
                  ...(template.recurrence === 'weekly' && { daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }),
                },
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
          onboardingComplete: data.onboardingComplete !== undefined ? data.onboardingComplete : false,
          onboardingData: data.onboardingData || null,
          showTutorial: data.showTutorial || false,
          initialized: true,
        });
      },

      completeOnboarding: () => set({ onboardingComplete: true }),

      saveOnboardingData: (data) => set({ onboardingData: data }),

      setShowTutorial: (show) => set({ showTutorial: show }),

      addUserQuest: (quest) =>
        set((state) => ({
          userQuests: [quest, ...state.userQuests],
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
          const oldLevel = state.profile.level;
          const newTotalXP = state.profile.totalXP + completion.xp;
          const newLevel = calculateLevel(newTotalXP);
          const streakData = calculateStreak(newCompletions);
          const didLevelUp = newLevel > oldLevel;

          // Calculate streak bonus amount if applicable
          const streakBonusAmount = completion.streakBonus && state.profile.currentStreak > 0
            ? Math.floor(completion.xp * (Math.min(state.profile.currentStreak * 0.02, 0.3) / (1 + Math.min(state.profile.currentStreak * 0.02, 0.3))))
            : 0;

          // Show quest complete modal
          setTimeout(() => {
            set({
              showQuestCompleteModal: true,
              questCompleteData: {
                questTitle: completion.questTitle,
                xpEarned: completion.xp - streakBonusAmount,
                streakBonus: streakBonusAmount,
              },
            });

            // If leveled up, show level up modal after quest complete modal closes
            if (didLevelUp) {
              setTimeout(() => {
                set({
                  showLevelUpModal: true,
                  levelUpData: {
                    newLevel,
                    totalXP: newTotalXP,
                  },
                });
              }, 3200); // Show after quest complete modal (3s) + small delay
            }
          }, 100);

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

      closeQuestCompleteModal: () =>
        set({
          showQuestCompleteModal: false,
          questCompleteData: null,
        }),

      closeLevelUpModal: () =>
        set({
          showLevelUpModal: false,
          levelUpData: null,
        }),

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
          if (q.schedule.type === 'once') return true; // One-time quests always show
          if (q.schedule.type === 'program') return true; // Program quests always show
          if (q.schedule.type === 'weekly') {
            // If no daysOfWeek specified, show every day
            if (!q.schedule.daysOfWeek || q.schedule.daysOfWeek.length === 0) {
              return true;
            }
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
