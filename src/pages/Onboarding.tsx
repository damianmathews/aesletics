import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import { syncToFirestore } from '../lib/firestore';
import { categories } from '../data/seed';
import {
  Dumbbell, Zap, Sparkles, Brain, Shield, Heart,
  Users, Mountain, Briefcase, Palette, ChevronLeft, ChevronRight, Ban, Star
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
    'avoidance-detox': <Ban size={size} />,
    'spirituality': <Star size={size} />,
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
  const [experienceLevels, setExperienceLevels] = useState<Record<string, string>>({});

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleNext = () => {
    if (step === 1 && nickname.trim() === '') return;
    if (step === 2 && selectedCategories.length < 2) return;
    if (step === 3 && selectedCategories.some(cat => !experienceLevels[cat])) return;

    if (step < 3) {
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
      experienceLevels,
    };
    saveOnboardingData(onboardingData);

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

  const setExperienceForCategory = (categoryId: string, level: string) => {
    setExperienceLevels({ ...experienceLevels, [categoryId]: level });
  };

  const canProceed = () => {
    if (step === 1) return nickname.trim() !== '';
    if (step === 2) return selectedCategories.length >= 2 && selectedCategories.length <= 4;
    if (step === 3) return selectedCategories.every(cat => experienceLevels[cat]);
    return true;
  };

  return (
    <div className="min-h-screen bg-pattern-dots flex items-center justify-center px-6 py-6" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Progress indicator */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="h-1 w-16 rounded-full transition-all"
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

          {/* Step 3: Experience Level Per Category */}
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
                What's your experience level?
              </h2>
              <p className="text-xs mb-4 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                SELECT YOUR LEVEL FOR EACH CATEGORY
              </p>

              <div className="space-y-4">
                {selectedCategories.map((categoryId) => {
                  const category = categories.find(c => c.id === categoryId);
                  if (!category) return null;

                  return (
                    <div key={categoryId}>
                      {/* Category header */}
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(categoryId, 18)}
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                          {category.name}
                        </span>
                      </div>

                      {/* Experience level buttons */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: 'just-starting', label: 'Just Starting', emoji: '🌱' },
                          { value: 'beginner', label: 'Beginner', emoji: '💪' },
                          { value: 'intermediate', label: 'Intermediate', emoji: '🔥' },
                          { value: 'advanced', label: 'Advanced', emoji: '⚡' },
                        ].map((level) => {
                          const isSelected = experienceLevels[categoryId] === level.value;
                          return (
                            <button
                              key={level.value}
                              onClick={() => setExperienceForCategory(categoryId, level.value)}
                              className={`px-2 py-2 rounded-lg border transition-all hover:scale-105 text-center ${
                                isSelected ? 'shadow-lg' : ''
                              }`}
                              style={{
                                background: isSelected ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.03)',
                                borderColor: isSelected ? 'transparent' : 'var(--color-border)',
                                color: isSelected ? 'white' : 'var(--color-text)',
                              }}
                            >
                              <div className="text-base mb-0.5">{level.emoji}</div>
                              <div className="text-[10px] font-medium leading-tight">{level.label}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
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
            {step === 3 ? 'Complete' : 'Next'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
