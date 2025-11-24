import type { Quest, QuestCompletion, Profile } from '../types';

interface OnboardingData {
  selectedCategories: string[];
  experienceLevels?: Record<string, string>;
}

/**
 * Get personalized quest recommendations based on user behavior and onboarding
 */
export function getRecommendedQuests(
  allQuests: Quest[],
  completions: QuestCompletion[],
  profile: Profile,
  onboardingData?: OnboardingData,
  limit: number = 12
): Quest[] {
  const today = new Date().toISOString().split('T')[0];

  // Get IDs of quests completed today
  const completedTodayIds = new Set(
    completions
      .filter(c => c.at.split('T')[0] === today)
      .map(c => c.userQuestId)
  );

  // Get all completed quest IDs for history analysis
  const allCompletedIds = new Set(completions.map(c => c.userQuestId));

  // Calculate category frequency from history
  const categoryFrequency: Record<string, number> = {};
  const difficultyFrequency: Record<string, number> = {};

  completions.forEach(c => {
    categoryFrequency[c.category] = (categoryFrequency[c.category] || 0) + 1;
    difficultyFrequency[c.difficulty] = (difficultyFrequency[c.difficulty] || 0) + 1;
  });

  // Get top 3 categories from history
  const topCategories = Object.keys(categoryFrequency)
    .sort((a, b) => categoryFrequency[b] - categoryFrequency[a])
    .slice(0, 3);

  // Get most common difficulty
  const topDifficulty = Object.keys(difficultyFrequency)
    .sort((a, b) => difficultyFrequency[b] - difficultyFrequency[a])[0] || 'easy';

  // Determine suggested difficulty based on level
  let suggestedDifficulties: string[];
  if (profile.level < 5) {
    suggestedDifficulties = ['easy'];
  } else if (profile.level < 10) {
    suggestedDifficulties = ['easy', 'medium'];
  } else if (profile.level < 20) {
    suggestedDifficulties = ['medium', 'hard'];
  } else {
    suggestedDifficulties = ['hard', 'elite'];
  }

  // Score and filter quests
  const scoredQuests = allQuests
    .filter(quest => {
      // Don't recommend completed today
      if (completedTodayIds.has(quest.id)) return false;

      // Don't recommend tutorial quest after it's completed
      if (quest.id === 'q367' && allCompletedIds.has(quest.id)) return false;

      return true;
    })
    .map(quest => {
      let score = 0;

      // NEW USERS: Recommend tutorial quest first
      if (quest.id === 'q367' && completions.length === 0) {
        return { quest, score: 1000 }; // Highest priority
      }

      // ONBOARDING MATCH (30% weight)
      if (onboardingData?.selectedCategories?.includes(quest.category)) {
        score += 30;
      }

      // HISTORY MATCH (40% weight)
      if (topCategories.includes(quest.category)) {
        const rank = topCategories.indexOf(quest.category);
        score += (40 - rank * 10); // 40, 30, 20
      }

      if (quest.difficulty === topDifficulty) {
        score += 15;
      }

      // LEVEL-APPROPRIATE (30% weight)
      if (suggestedDifficulties.includes(quest.difficulty)) {
        score += 30;
      }

      // BONUS: Quick wins (under 10 min)
      if (quest.durationMinutes <= 10) {
        score += 10;
      }

      // BONUS: Not completed ever (encourage variety)
      if (!allCompletedIds.has(quest.id)) {
        score += 5;
      }

      return { quest, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.quest);

  return scoredQuests;
}

/**
 * Get starter quests for brand new users (first time experience)
 */
export function getStarterQuests(onboardingData?: OnboardingData): string[] {
  const starterQuestIds: string[] = ['q367']; // Tutorial quest always first

  // Add 2-3 easy quests from selected categories
  if (onboardingData?.selectedCategories) {
    const easyQuestsByCategory: Record<string, string[]> = {
      'fitness': ['q001', 'q128'], // 10 Push-ups, Walk 12k steps
      'body-wellness': ['q125', 'q140'], // Drink water, Floss teeth
      'intelligence': ['q153', 'q162'], // Read 30min, Listen & take notes
      'mental': ['q202', 'q204'], // Meditate 20min, Breathing exercise
      'discipline': ['q180', 'q182'], // Make bed, Plan your day
      'social-leadership': ['q234', 'q241'], // Active listening, Give compliments
      'finance-career': ['q197', 'q280'], // Track expenses, Side hustle
      'creativity': ['q302', 'q304'], // Drawing, Music practice
      'adventure-outdoors': ['q252', 'q205'], // Hike trail, Nature walk
      'athletics-skill': ['q106', 'q122'], // Handstand, Balance board
      'avoidance-detox': ['q331', 'q334'], // No phone at meals, Skip coffee out
      'spirituality': ['q347', 'q350'], // Morning gratitude, Mindful breathing
    };

    onboardingData.selectedCategories.slice(0, 2).forEach(category => {
      const quests = easyQuestsByCategory[category] || [];
      starterQuestIds.push(... quests.slice(0, 1)); // Add 1 quest per category
    });
  }

  return starterQuestIds;
}
