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
import { questTemplatesExtended, questPacks } from '../data/seed';
import { getLocalDateString, getLocalDateStringDaysAgo } from '../lib/dateUtils';
import { syncToLeaderboard } from '../lib/leaderboard';
import { auth } from '../lib/firebase';

interface QuestCompleteData {
  questTitle: string;
  xpEarned: number;
  streakBonus: number;
}

interface LevelUpData {
  newLevel: number;
  totalXP: number;
}

interface DailyLoginData {
  dayNumber: number;
  xpBonus: number;
  isNewStreak: boolean;
}

interface StoreState extends AppState {
  // Celebration modals
  showQuestCompleteModal: boolean;
  questCompleteData: QuestCompleteData | null;
  showLevelUpModal: boolean;
  levelUpData: LevelUpData | null;
  showDailyLoginModal: boolean;
  dailyLoginData: DailyLoginData | null;

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
  closeDailyLoginModal: () => void;
  checkDailyLogin: () => void;

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
  lastLoginDate: undefined,
  loginStreakDays: 0,
  longestLoginStreak: 0,
  streakFreezes: 0,
};

const initialSettings: Settings = {
  theme: 'dark',
  units: 'imperial',
  notifications: true,
  soundEffects: true,
  weekStartsOn: 0,
};

// Add hasHydrated to track when localStorage has been loaded
interface StoreState extends AppState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

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
      showDailyLoginModal: false,
      dailyLoginData: null,
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

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

      completeOnboarding: () => {
        console.log('🎯 completeOnboarding() called - setting onboardingComplete = true');
        set({ onboardingComplete: true });
        // Force immediate check
        const state = get();
        console.log('🎯 After set, onboardingComplete is:', state.onboardingComplete);
      },

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

        // Sync to leaderboard (fire and forget)
        const currentUser = auth.currentUser;
        if (currentUser) {
          const updatedState = get();
          syncToLeaderboard(
            currentUser.uid,
            updatedState.profile.nickname,
            updatedState.profile.totalXP,
            updatedState.profile.level
          ).catch(err => console.error('Failed to sync to leaderboard:', err));
        }
      },

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      updateProfile: (profile) =>
        set((state) => ({
          profile: { ...state.profile, ...profile },
        })),

      activatePack: (packId) => {
        const pack = questPacks.find(p => p.id === packId);
        if (!pack) return;

        set((state) => {
          // Add pack to active packs
          const activePacks = [...state.activePacks, packId];

          // Add all quests from the pack to userQuests (if not already added)
          const newUserQuests = [...state.userQuests];

          pack.quests.forEach(packQuest => {
            const template = questTemplatesExtended.find(q => q.id === packQuest.templateId);
            if (!template) return;

            // Check if this quest template is already in userQuests
            const alreadyExists = newUserQuests.some(uq => uq.templateId === template.id);
            if (alreadyExists) return;

            // Create new user quest
            const newQuest: UserQuest = {
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
                ...(template.recurrence === 'weekly' && { daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }),
              },
              equipment: template.equipment,
              tags: template.tags,
              safety: template.safety,
              active: true,
              createdAt: new Date().toISOString(),
            };

            newUserQuests.push(newQuest);
          });

          return {
            activePacks,
            userQuests: newUserQuests,
          };
        });
      },

      deactivatePack: (packId) => {
        const pack = questPacks.find(p => p.id === packId);
        if (!pack) return;

        set((state) => {
          // Remove pack from active packs
          const activePacks = state.activePacks.filter((id) => id !== packId);

          // Remove quests from this pack (but only if they haven't been completed)
          const packTemplateIds = pack.quests.map(pq => pq.templateId);
          const userQuests = state.userQuests.filter(uq => {
            // Keep the quest if:
            // 1. It's not from this pack, OR
            // 2. It has been completed at least once
            if (!uq.templateId) return true; // Keep quests without templateId
            const isFromThisPack = packTemplateIds.includes(uq.templateId);
            if (!isFromThisPack) return true;

            const hasCompletions = state.completions.some(c => c.userQuestId === uq.id);
            return hasCompletions;
          });

          return {
            activePacks,
            userQuests,
          };
        });
      },

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

      closeDailyLoginModal: () =>
        set({
          showDailyLoginModal: false,
          dailyLoginData: null,
        }),

      checkDailyLogin: () => {
        const state = get();
        const today = getLocalDateString(); // YYYY-MM-DD in local timezone

        // If already logged in today, don't show modal
        if (state.profile.lastLoginDate === today) {
          return;
        }

        const yesterday = getLocalDateStringDaysAgo(1);
        const lastLogin = state.profile.lastLoginDate;

        // Calculate new streak
        let newLoginStreak = 1;
        let isNewStreak = true;

        if (lastLogin === yesterday) {
          // Continued streak
          newLoginStreak = state.profile.loginStreakDays + 1;
          isNewStreak = false;
        } else if (lastLogin && lastLogin !== today) {
          // Streak broken, start over
          newLoginStreak = 1;
          isNewStreak = true;
        }

        // Calculate XP bonus based on ACTUAL day of the week
        // Get current day: 0 = Sunday, 1 = Monday, ... 6 = Saturday
        const currentDayOfWeek = new Date().getDay();
        // Convert to 1-7 where 1 = Monday, 7 = Sunday
        const dayInCycle = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;
        const xpBonuses = [100, 150, 200, 300, 400, 600, 1000]; // Mon-Sun
        const xpBonus = xpBonuses[dayInCycle - 1];

        // Award streak freeze every 7 days
        const streakFreezesEarned = Math.floor(newLoginStreak / 7) - Math.floor((state.profile.loginStreakDays || 0) / 7);

        // Update profile
        set((state) => ({
          profile: {
            ...state.profile,
            lastLoginDate: today,
            loginStreakDays: newLoginStreak,
            longestLoginStreak: Math.max(state.profile.longestLoginStreak || 0, newLoginStreak),
            totalXP: state.profile.totalXP + xpBonus,
            level: calculateLevel(state.profile.totalXP + xpBonus),
            streakFreezes: (state.profile.streakFreezes || 0) + streakFreezesEarned,
          },
        }));

        // Sync to leaderboard after daily login
        const currentUser = auth.currentUser;
        if (currentUser) {
          const updatedState = get();
          syncToLeaderboard(
            currentUser.uid,
            updatedState.profile.nickname,
            updatedState.profile.totalXP,
            updatedState.profile.level
          ).catch(err => console.error('Failed to sync to leaderboard:', err));
        }

        // Show daily login modal
        setTimeout(() => {
          set({
            showDailyLoginModal: true,
            dailyLoginData: {
              dayNumber: dayInCycle,
              xpBonus,
              isNewStreak,
            },
          });
        }, 500); // Small delay after page load
      },

      getStats: (): UserStats => {
        const state = get();
        const now = new Date();
        const today = getLocalDateString();
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
      // Don't persist hydration helpers
      partialize: (state) => {
        const { _hasHydrated, setHasHydrated, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('✗ Failed to rehydrate from localStorage:', error);
          } else {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✓ REHYDRATED from localStorage');
            console.log('  onboardingComplete:', state?.onboardingComplete);
            console.log('  initialized:', state?.initialized);
            console.log('  profile:', state?.profile);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            state?.setHasHydrated(true);
          }
        };
      },
    }
  )
);
