import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle } from 'lucide-react';

interface QuestCompleteModalProps {
  isOpen: boolean;
  questTitle: string;
  xpEarned: number;
  streakBonus?: number;
  onClose: () => void;
}

// Particle component for visual effects
const Particle = ({ delay, duration, x, y }: { delay: number; duration: number; x: number; y: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
      x: x,
      y: y,
    }}
    transition={{
      duration,
      delay,
      ease: "easeOut"
    }}
    className="absolute w-2 h-2 rounded-full"
    style={{
      background: 'var(--gradient-primary)',
      left: '50%',
      top: '50%',
      boxShadow: '0 0 10px rgba(167, 139, 250, 0.8)',
    }}
  />
);

export default function QuestCompleteModal({ isOpen, questTitle, xpEarned, streakBonus = 0, onClose }: QuestCompleteModalProps) {
  const [showContent, setShowContent] = useState(false);
  const totalXP = xpEarned + streakBonus;

  useEffect(() => {
    if (isOpen) {
      setShowContent(false);
      // Delay content to let backdrop animate in first
      setTimeout(() => setShowContent(true), 200);

      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Generate particles in a burst pattern
  const particles = Array.from({ length: 40 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 40;
    const distance = 150 + Math.random() * 100;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      delay: Math.random() * 0.3,
      duration: 1 + Math.random() * 0.5,
    };
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
          onClick={onClose}
        >
          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle, i) => (
              <Particle key={i} {...particle} />
            ))}
          </div>

          {/* Radial gradient glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.3, scale: 2 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(167, 139, 250, 0.3) 0%, transparent 70%)',
            }}
          />

          {/* Content */}
          {showContent && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }} // Bounce easing
              className="relative z-10 text-center px-8 max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Check icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.5 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <CheckCircle size={48} color="white" strokeWidth={2.5} />
              </motion.div>

              {/* "QUEST COMPLETE" text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h2 className="text-xs font-mono font-bold tracking-wider mb-3" style={{ color: 'var(--color-accent)' }}>
                  QUEST COMPLETE
                </h2>
                <h1 className="font-display text-3xl font-bold mb-8 leading-tight" style={{ color: 'var(--color-text)' }}>
                  {questTitle}
                </h1>
              </motion.div>

              {/* XP Earned */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6, type: "spring", bounce: 0.6 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-button glass border"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Zap size={32} style={{ color: 'var(--color-accent)' }} fill="currentColor" />
                <div className="text-left">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="text-4xl font-bold tabular-nums"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    +{totalXP}
                  </motion.div>
                  <div className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                    {streakBonus > 0 ? `${xpEarned} + ${streakBonus} STREAK` : 'EXPERIENCE'}
                  </div>
                </div>
              </motion.div>

              {/* Tap to continue */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="text-xs font-mono mt-8"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                TAP ANYWHERE TO CONTINUE
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
