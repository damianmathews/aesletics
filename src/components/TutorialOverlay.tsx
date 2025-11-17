import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';

interface TutorialStep {
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  navigateTo?: string; // Path to navigate to before showing this step
  buttonText?: string; // Custom button text
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to your Dashboard!',
    description: 'This is your command center. Track your total XP, current level, and streak all in one place.',
    target: '[data-tutorial="xp-display"]',
    position: 'bottom',
    navigateTo: '/app',
  },
  {
    title: 'Your active quests',
    description: 'These are the quests in your queue. Tap any card to view details and submit proof when complete.',
    target: '[data-tutorial="quest-cards"]',
    position: 'top',
    navigateTo: '/app',
  },
  {
    title: 'Quest Library - 320+ Quests',
    description: 'Browse hundreds of quests across 12 categories. Use filters to find exactly what you\'re looking for, then tap + to add to your queue.',
    target: '[data-tutorial="quest-grid"]',
    position: 'top',
    navigateTo: '/app/quests',
  },
  {
    title: 'Quest Details',
    description: 'When you\'re ready to complete a quest, tap on it to view full details. You can submit proof (photo, timer, counter, or text) and earn XP instantly.',
    position: 'center',
    navigateTo: '/app/quests',
    buttonText: 'Got it',
  },
  {
    title: 'Track Your Progress',
    description: 'The History page shows every quest you\'ve completed with a visual heatmap. See your consistency and build momentum over time.',
    target: '[data-tutorial="history-container"]',
    position: 'top',
    navigateTo: '/app/history',
  },
  {
    title: 'Compete With Yourself',
    description: 'The Leaderboard compares you against yourself over time. Track your rank, milestones, and personal records.',
    target: '[data-tutorial="leaderboard-container"]',
    position: 'top',
    navigateTo: '/app/leaderboard',
  },
  {
    title: 'Quest Packs - Structured Programs',
    description: 'Quest Packs are curated programs with multiple quests. Activate a pack to add all its quests to your queue at once.',
    target: '[data-tutorial="packs-container"]',
    position: 'top',
    navigateTo: '/app/packs',
  },
  {
    title: 'You\'re all set!',
    description: 'Explore Settings to customize your experience, or head back to your Dashboard to start completing quests and earning XP. Let\'s level up! 🚀',
    position: 'center',
    navigateTo: '/app',
    buttonText: 'Start Leveling Up',
  },
];

export default function TutorialOverlay() {
  const { showTutorial, setShowTutorial } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Navigate when step changes and has navigateTo
  useEffect(() => {
    if (showTutorial && tutorialSteps[currentStep]?.navigateTo) {
      const targetPath = tutorialSteps[currentStep].navigateTo;
      if (location.pathname !== targetPath) {
        setIsNavigating(true);
        navigate(targetPath!);
        // Wait longer for navigation and layout to complete
        setTimeout(() => {
          setIsNavigating(false);
          // Multiple recalculation attempts to ensure accurate positioning
          updateTargetPosition();
          setTimeout(updateTargetPosition, 100);
          setTimeout(updateTargetPosition, 300);
        }, 500);
      } else {
        // Even on same page, recalculate with delays
        updateTargetPosition();
        setTimeout(updateTargetPosition, 100);
        setTimeout(updateTargetPosition, 300);
      }
    }
  }, [currentStep, showTutorial, navigate, location]);

  useEffect(() => {
    if (showTutorial && !isNavigating) {
      updateTargetPosition();

      // Recalculate on scroll and resize
      const handleRecalculate = () => {
        requestAnimationFrame(updateTargetPosition);
      };

      window.addEventListener('resize', handleRecalculate);
      window.addEventListener('scroll', handleRecalculate, true); // true = capture phase, catches all scrolls

      return () => {
        window.removeEventListener('resize', handleRecalculate);
        window.removeEventListener('scroll', handleRecalculate, true);
      };
    }
  }, [showTutorial, currentStep, isNavigating]);

  const updateTargetPosition = () => {
    const step = tutorialSteps[currentStep];
    if (step.target) {
      // Use requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        const element = document.querySelector(step.target!);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Only update if rect has actual dimensions (element is rendered)
          if (rect.width > 0 && rect.height > 0) {
            setTargetRect(rect);
          }
        }
      });
    } else {
      setTargetRect(null);
    }
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setShowTutorial(false);
    setCurrentStep(0);
  };

  if (!showTutorial) return null;

  const step = tutorialSteps[currentStep];

  // Calculate spotlight position
  const spotlightStyle = targetRect
    ? {
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
      }
    : null;

  // Calculate tooltip position (keep on screen)
  const getTooltipPosition = () => {
    if (!targetRect || step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '90vw',
      };
    }

    const padding = 20;
    const tooltipWidth = 448; // max-w-md = 448px
    const tooltipHeight = 200; // estimated height
    const margin = 16; // minimum margin from screen edge

    let position: any = {};

    switch (step.position) {
      case 'bottom':
        // Try to position below target
        const bottomSpace = window.innerHeight - targetRect.bottom - padding;
        if (bottomSpace < tooltipHeight) {
          // Not enough space below, position above instead
          position.bottom = window.innerHeight - targetRect.top + padding;
        } else {
          position.top = targetRect.bottom + padding;
        }

        // Center horizontally, but keep on screen
        let leftPos = targetRect.left + targetRect.width / 2;
        if (leftPos - tooltipWidth / 2 < margin) {
          leftPos = margin + tooltipWidth / 2;
        } else if (leftPos + tooltipWidth / 2 > window.innerWidth - margin) {
          leftPos = window.innerWidth - margin - tooltipWidth / 2;
        }
        position.left = leftPos;
        position.transform = 'translateX(-50%)';
        break;

      case 'top':
        // Try to position above target
        const topSpace = targetRect.top - padding;
        if (topSpace < tooltipHeight) {
          // Not enough space above, position below instead
          position.top = targetRect.bottom + padding;
        } else {
          position.bottom = window.innerHeight - targetRect.top + padding;
        }

        // Center horizontally, but keep on screen
        let leftPosTop = targetRect.left + targetRect.width / 2;
        if (leftPosTop - tooltipWidth / 2 < margin) {
          leftPosTop = margin + tooltipWidth / 2;
        } else if (leftPosTop + tooltipWidth / 2 > window.innerWidth - margin) {
          leftPosTop = window.innerWidth - margin - tooltipWidth / 2;
        }
        position.left = leftPosTop;
        position.transform = 'translateX(-50%)';
        break;

      case 'left':
        position.top = Math.max(margin, Math.min(targetRect.top + targetRect.height / 2, window.innerHeight - margin));
        position.right = window.innerWidth - targetRect.left + padding;
        position.transform = 'translateY(-50%)';
        break;

      case 'right':
        position.top = Math.max(margin, Math.min(targetRect.top + targetRect.height / 2, window.innerHeight - margin));
        position.left = targetRect.right + padding;
        position.transform = 'translateY(-50%)';
        break;

      default:
        position = {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }

    position.maxWidth = '90vw';
    return position;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
      >
        {/* Dark overlay with spotlight cutout */}
        <div className="absolute inset-0 pointer-events-none">
          {/* SVG mask for spotlight effect */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                {spotlightStyle && (
                  <rect
                    x={spotlightStyle.left - 8}
                    y={spotlightStyle.top - 8}
                    width={spotlightStyle.width + 16}
                    height={spotlightStyle.height + 16}
                    rx="12"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.8)"
              mask="url(#spotlight-mask)"
            />
          </svg>
        </div>

        {/* Spotlight border glow */}
        {spotlightStyle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute pointer-events-none"
            style={{
              left: spotlightStyle.left - 8,
              top: spotlightStyle.top - 8,
              width: spotlightStyle.width + 16,
              height: spotlightStyle.height + 16,
              borderRadius: '12px',
              boxShadow: '0 0 0 2px rgba(167, 139, 250, 0.5), 0 0 30px rgba(167, 139, 250, 0.3)',
              animation: 'pulse 2s infinite',
            }}
          />
        )}

        {/* Tooltip card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-[101] glass rounded-lg p-6 border max-w-md"
          style={{
            borderColor: 'var(--color-border)',
            ...getTooltipPosition(),
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <X size={18} />
          </button>

          {/* Content */}
          <h3 className="font-display text-xl font-bold mb-2 pr-6" style={{ color: 'var(--color-text)' }}>
            {step.title}
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            {step.description}
          </p>

          {/* Progress & Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className="h-1.5 w-8 rounded-full transition-all"
                  style={{
                    background: index === currentStep ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.2)',
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 flex items-center gap-1"
              style={{ background: 'var(--gradient-primary)', color: 'white' }}
            >
              {step.buttonText || (currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next')}
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Skip tutorial */}
          <button
            onClick={handleClose}
            className="mt-3 w-full text-center text-xs font-mono transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Skip tutorial
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
