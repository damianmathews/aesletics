import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import { syncToFirestore } from '../lib/firestore';
import { generateRecommendedQuests } from '../lib/questRecommendations';
import { categories } from '../data/seed';
import {
  Dumbbell, Zap, Sparkles, Brain, Shield, Heart,
  Users, Mountain, Briefcase, Palette, ChevronLeft, ChevronRight,
  Weight, BookOpen, Smile, Pizza, TrendingUp, Lightbulb
} from 'lucide-react';
import type { OnboardingData } from '../types';

const getCategoryIcon = (categoryId: string, size = 24) => {
  const iconMap: Record<string, React.ReactNode> = {
    'fitness': <Dumbbell size={size} />,
    'body-wellness': <Sparkles size={size} />,
    'athletics-skill': <Zap size={size} />,
    'intelligence': <Brain size={size} />,
    'discipline': <Shield size={size} />,
    'mental': <Heart size={size} />,
    'social-leadership': <Users size={size} />,
    'adventure-outdoors': <Mountain size={size} />,
    'finance-career': <Briefcase size={size} />,
    'creativity': <Palette size={size} />,
  };
  return iconMap[categoryId] || null;
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, updateProfile, saveOnboardingData, completeOnboarding, setShowTutorial } = useStore();

  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState(profile.nickname === 'Athlete' ? '' : profile.nickname);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [timeCommitment, setTimeCommitment] = useState<'15-30' | '30-60' | '60+'>('30-60');
  const [questPreferences, setQuestPreferences] = useState<string[]>([]);

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleNext = () => {
    if (step === 1 && nickname.trim() === '') return;
    if (step === 2 && selectedCategories.length < 2) return;
    if (step === 5 && questPreferences.length < 2) return;

    if (step < 5) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    // Save nickname
    if (nickname.trim()) {
      updateProfile({ nickname: nickname.trim() });
    }

    // Save onboarding data
    const onboardingData: OnboardingData = {
      selectedCategories,
      experienceLevel,
      timeCommitment,
      questPreferences,
    };
    saveOnboardingData(onboardingData);

    // Generate and add recommended quests
    const recommendedQuests = generateRecommendedQuests(onboardingData);
    const { addUserQuest } = useStore.getState();
    recommendedQuests.forEach((quest) => addUserQuest(quest));

    // Mark onboarding complete and show tutorial
    completeOnboarding();
    setShowTutorial(true);

    // Immediately sync to Firestore before navigating
    if (user) {
      const state = useStore.getState();
      try {
        await syncToFirestore(user.uid, {
          profile: state.profile,
          userQuests: state.userQuests,
          completions: state.completions,
          activePacks: state.activePacks,
          settings: state.settings,
          onboardingComplete: state.onboardingComplete,
          onboardingData: state.onboardingData,
          showTutorial: state.showTutorial,
        });
        console.log('Onboarding synced to Firestore');
      } catch (error) {
        console.error('Error syncing onboarding:', error);
      }
    }

    navigate('/app');
  };

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryId));
    } else if (selectedCategories.length < 4) {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const togglePreference = (pref: string) => {
    if (questPreferences.includes(pref)) {
      setQuestPreferences(questPreferences.filter((p) => p !== pref));
    } else if (questPreferences.length < 4) {
      setQuestPreferences([...questPreferences, pref]);
    }
  };

  const canProceed = () => {
    if (step === 1) return nickname.trim() !== '';
    if (step === 2) return selectedCategories.length >= 2 && selectedCategories.length <= 4;
    if (step === 5) return questPreferences.length >= 2 && questPreferences.length <= 4;
    return true;
  };

  return (
    <div className="min-h-screen bg-pattern-dots flex items-center justify-center px-6 py-6" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Progress indicator */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className="h-1 w-12 rounded-full transition-all"
            style={{
              background: s <= step ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.2)',
              boxShadow: s <= step ? '0 0 8px rgba(167, 139, 250, 0.5)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="glass rounded-lg p-5 border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h1 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                Welcome to IRLXP
              </h1>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                Level up your life across 12 categories
              </p>

              <div className="mb-4">
                <label className="block text-xs font-medium mb-1.5 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                  YOUR NAME
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname"
                  className="w-full px-3 py-2 rounded-lg glass border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  autoFocus
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Categories */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="glass rounded-lg p-5 border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                What do you want to level up?
              </h2>
              <p className="text-xs mb-4 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                SELECT 2-4 CATEGORIES
              </p>

              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`p-3 rounded-lg border transition-all hover:scale-105 flex flex-col items-center gap-1.5 text-center ${
                        isSelected ? 'shadow-lg' : ''
                      }`}
                      style={{
                        background: isSelected ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.03)',
                        borderColor: isSelected ? 'transparent' : 'var(--color-border)',
                        color: isSelected ? 'white' : 'var(--color-text)',
                      }}
                    >
                      {getCategoryIcon(category.id, 22)}
                      <span className="text-xs font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs mt-3 text-center font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                {selectedCategories.length}/4 selected
              </p>
            </motion.div>
          )}

          {/* Step 3: Experience Level */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="glass rounded-lg p-5 border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                What's your current level?
              </h2>
              <p className="text-xs mb-4 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                CHOOSE ONE
              </p>

              <div className="space-y-2">
                {[
                  { value: 'beginner' as const, label: 'Beginner', desc: 'Just getting started' },
                  { value: 'intermediate' as const, label: 'Intermediate', desc: 'Consistent but want to level up' },
                  { value: 'advanced' as const, label: 'Advanced', desc: 'Experienced and ready for challenges' },
                ].map((option) => {
                  const isSelected = experienceLevel === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setExperienceLevel(option.value)}
                      className={`w-full p-3 rounded-lg border transition-all hover:scale-[1.02] text-left ${
                        isSelected ? 'shadow-lg' : ''
                      }`}
                      style={{
                        background: isSelected ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.03)',
                        borderColor: isSelected ? 'transparent' : 'var(--color-border)',
                        color: isSelected ? 'white' : 'var(--color-text)',
                      }}
                    >
                      <div className="font-semibold text-base">{option.label}</div>
                      <div className="text-xs opacity-80">{option.desc}</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 4: Time Commitment */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="glass rounded-lg p-5 border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                How much time can you dedicate daily?
              </h2>
              <p className="text-xs mb-4 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                CHOOSE ONE
              </p>

              <div className="space-y-2">
                {[
                  { value: '15-30' as const, label: '15-30 minutes', desc: 'Quick daily habits' },
                  { value: '30-60' as const, label: '30-60 minutes', desc: 'Balanced approach' },
                  { value: '60+' as const, label: '60+ minutes', desc: 'Ready to grind' },
                ].map((option) => {
                  const isSelected = timeCommitment === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTimeCommitment(option.value)}
                      className={`w-full p-3 rounded-lg border transition-all hover:scale-[1.02] text-left ${
                        isSelected ? 'shadow-lg' : ''
                      }`}
                      style={{
                        background: isSelected ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.03)',
                        borderColor: isSelected ? 'transparent' : 'var(--color-border)',
                        color: isSelected ? 'white' : 'var(--color-text)',
                      }}
                    >
                      <div className="font-semibold text-base">{option.label}</div>
                      <div className="text-xs opacity-80">{option.desc}</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 5: Quest Preferences */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="glass rounded-lg p-5 border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                What types of challenges excite you?
              </h2>
              <p className="text-xs mb-4 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                SELECT 2-4 PREFERENCES
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'Bodyweight Training', label: 'Bodyweight Training', icon: <Dumbbell size={22} /> },
                  { value: 'Gym Workouts', label: 'Gym Workouts', icon: <Weight size={22} /> },
                  { value: 'Learning & Reading', label: 'Learning & Reading', icon: <BookOpen size={22} /> },
                  { value: 'Mindfulness', label: 'Mindfulness', icon: <Smile size={22} /> },
                  { value: 'Cardio & Endurance', label: 'Cardio & Endurance', icon: <Dumbbell size={22} /> },
                  { value: 'Nutrition & Health', label: 'Nutrition & Health', icon: <Pizza size={22} /> },
                  { value: 'Career & Finance', label: 'Career & Finance', icon: <TrendingUp size={22} /> },
                  { value: 'Creative Projects', label: 'Creative Projects', icon: <Lightbulb size={22} /> },
                ].map((option) => {
                  const isSelected = questPreferences.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => togglePreference(option.value)}
                      className={`p-3 rounded-lg border transition-all hover:scale-105 flex flex-col items-center gap-1.5 text-center ${
                        isSelected ? 'shadow-lg' : ''
                      }`}
                      style={{
                        background: isSelected ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.03)',
                        borderColor: isSelected ? 'transparent' : 'var(--color-border)',
                        color: isSelected ? 'white' : 'var(--color-text)',
                      }}
                    >
                      {option.icon}
                      <div className="text-xs font-medium">{option.label}</div>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs mt-3 text-center font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                {questPreferences.length}/4 selected
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-4 gap-4">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-lg glass border transition-all hover:scale-105 flex items-center gap-2 text-sm"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <ChevronLeft size={18} />
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            style={{ background: 'var(--gradient-primary)', color: 'white' }}
          >
            {step === 5 ? 'Complete' : 'Next'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
