import type { OnboardingData, QuestTemplate, UserQuest } from '../types';
import { questTemplatesExtended } from '../data/seed';

/**
 * Generate quest recommendations based on onboarding data
 * Returns an array of UserQuest objects ready to be added to the user's queue
 */
export function generateRecommendedQuests(data: OnboardingData): UserQuest[] {
  const { selectedCategories, experienceLevel, timeCommitment, questPreferences } = data;

  // Step 1: Filter by selected categories
  let filteredQuests = questTemplatesExtended.filter((quest) =>
    selectedCategories.includes(quest.category)
  );

  // Step 2: Filter by experience level (difficulty)
  const difficultyMap: Record<string, string[]> = {
    beginner: ['easy', 'medium'],
    intermediate: ['easy', 'medium', 'hard'],
    advanced: ['easy', 'medium', 'hard', 'elite', 'legendary'],
  };
  filteredQuests = filteredQuests.filter((quest) =>
    difficultyMap[experienceLevel].includes(quest.difficulty)
  );

  // Step 3: Filter by time commitment
  const timeMap: Record<string, number> = {
    '15-30': 30,
    '30-60': 60,
    '60+': 999,
  };
  filteredQuests = filteredQuests.filter(
    (quest) => quest.durationMinutes <= timeMap[timeCommitment]
  );

  // Step 4: Score quests based on preferences
  const scoredQuests = filteredQuests.map((quest) => {
    let score = 0;

    // Prioritize daily quests for habit building
    if (quest.recurrence === 'daily') score += 5;

    // Boost quests matching preferences
    const preferenceBonus: Record<string, string[]> = {
      'Bodyweight Training': ['bodyweight'],
      'Gym Workouts': ['barbell', 'dumbbells', 'kettlebell'],
      'Learning & Reading': ['reading', 'learning', 'study'],
      'Mindfulness': ['meditation', 'mindfulness', 'breath'],
      'Cardio & Endurance': ['cardio', 'running', 'cycling'],
      'Nutrition & Health': ['nutrition', 'diet', 'sleep'],
      'Career & Finance': ['career', 'finance', 'business'],
      'Creative Projects': ['creativity', 'art', 'music'],
    };

    questPreferences.forEach((pref) => {
      const matchTags = preferenceBonus[pref] || [];
      const hasMatchingTag = quest.tags.some((tag) => matchTags.includes(tag));
      const hasMatchingEquipment = quest.equipment.some((eq) => matchTags.includes(eq));
      if (hasMatchingTag || hasMatchingEquipment) {
        score += 3;
      }
    });

    // Prefer easier quests for beginners
    if (experienceLevel === 'beginner' && quest.difficulty === 'easy') score += 2;

    // Prefer shorter quests for time-constrained users
    if (timeCommitment === '15-30' && quest.durationMinutes <= 20) score += 2;

    return { quest, score };
  });

  // Step 5: Sort by score and select top quests
  scoredQuests.sort((a, b) => b.score - a.score);

  // Select 6-8 quests total (2-3 from each category)
  const questsPerCategory = Math.ceil(8 / selectedCategories.length);
  const selectedQuests: QuestTemplate[] = [];

  selectedCategories.forEach((category) => {
    const categoryQuests = scoredQuests
      .filter((sq) => sq.quest.category === category)
      .slice(0, questsPerCategory)
      .map((sq) => sq.quest);
    selectedQuests.push(...categoryQuests);
  });

  // Step 6: Convert to UserQuest objects
  return selectedQuests.map((template) => ({
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
  }));
}
