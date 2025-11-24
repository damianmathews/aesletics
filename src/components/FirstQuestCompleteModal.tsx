import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Flame, TrendingUp } from 'lucide-react';

interface FirstQuestCompleteModalProps {
  isOpen: boolean;
  questTitle: string;
  xpEarned: number;
  currentLevel: number;
  onClose: () => void;
}

// Enhanced particle component with more variety
const Particle = ({ delay, duration, x, y, color }: { delay: number; duration: number; x: number; y: number; color: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0, 2, 1.5, 0],
      x: x,
      y: y,
      rotate: [0, 360],
    }}
    transition={{
      duration,
      delay,
      ease: "easeOut"
    }}
    className="absolute w-3 h-3 rounded-full"
    style={{
      background: color,
      left: '50%',
      top: '50%',
      boxShadow: `0 0 20px ${color}`,
    }}
  />
);

export default function FirstQuestCompleteModal({ isOpen, questTitle, xpEarned, currentLevel, onClose }: FirstQuestCompleteModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowContent(false);
      setTimeout(() => setShowContent(true), 300);
    }
  }, [isOpen]);

  // Generate MORE particles with colorful variety
  const particles = Array.from({ length: 80 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 80;
    const distance = 200 + Math.random() * 150;
    const colors = ['rgba(167, 139, 250, 1)', 'rgba(6, 182, 212, 1)', 'rgba(236, 72, 153, 1)', 'rgba(251, 191, 36, 1)', 'rgba(34, 197, 94, 1)'];
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
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
            animate={{ opacity: 0.4, scale: 3 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(167, 139, 250, 0.4) 0%, transparent 70%)',
            }}
          />

          {/* Content */}
          {showContent && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative z-10 text-center px-8 max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Trophy icon with pulse */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.6 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 relative"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.2, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'var(--gradient-primary)', filter: 'blur(15px)' }}
                />
                <Trophy size={56} color="white" strokeWidth={2} className="relative z-10" />
              </motion.div>

              {/* Main message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h1 className="text-4xl font-display font-bold mb-2" style={{ color: 'var(--color-accent)' }}>
                  🎉 Your First Quest!
                </h1>
                <h2 className="text-2xl font-display font-bold mb-4 leading-tight" style={{ color: 'var(--color-text)' }}>
                  {questTitle}
                </h2>
              </motion.div>

              {/* Manifesto */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-6 p-4 rounded-lg glass border"
                style={{ borderColor: 'var(--color-accent)' }}
              >
                <p className="text-base leading-relaxed mb-3" style={{ color: 'var(--color-text)' }}>
                  <strong>You just leveled up in real life.</strong>
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Every quest makes you stronger. Every day you're building the person you want to become. This is your journey. Keep going.
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8, type: "spring", bounce: 0.6 }}
                className="grid grid-cols-3 gap-3 mb-6"
              >
                <div className="glass rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)' }}>
                  <Zap size={24} style={{ color: 'var(--color-accent)' }} fill="currentColor" className="mx-auto mb-1" />
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>+{xpEarned}</div>
                  <div className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>XP EARNED</div>
                </div>
                <div className="glass rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)' }}>
                  <TrendingUp size={24} style={{ color: 'var(--color-accent)' }} className="mx-auto mb-1" />
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>Level {currentLevel}</div>
                  <div className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>CURRENT</div>
                </div>
                <div className="glass rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)' }}>
                  <Flame size={24} style={{ color: 'rgba(251, 146, 60, 1)' }} fill="currentColor" className="mx-auto mb-1" />
                  <div className="text-2xl font-bold" style={{ color: 'rgba(251, 146, 60, 1)' }}>Day 1</div>
                  <div className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>STREAK</div>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                onClick={onClose}
                className="w-full py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 active:scale-95 mb-3"
                style={{ background: 'var(--gradient-primary)', color: 'white' }}
              >
                Keep Going →
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="text-xs font-mono"
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
