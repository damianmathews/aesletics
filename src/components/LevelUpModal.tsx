import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, Award } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  totalXP: number;
  onClose: () => void;
}

// Particle component with more variety
const Particle = ({ delay, duration, x, y, size, color }: { delay: number; duration: number; x: number; y: number; size: number; color: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0, 1.5, 1, 0],
      x: x,
      y: y,
      rotate: [0, 180, 360],
    }}
    transition={{
      duration,
      delay,
      ease: "easeOut"
    }}
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      background: color,
      left: '50%',
      top: '50%',
      boxShadow: `0 0 20px ${color}`,
    }}
  />
);

// Light ray component
const LightRay = ({ angle, delay }: { angle: number; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scaleY: 0 }}
    animate={{ opacity: [0, 0.3, 0], scaleY: [0, 1.5, 1] }}
    transition={{
      duration: 1.5,
      delay,
      ease: "easeOut"
    }}
    className="absolute"
    style={{
      width: '4px',
      height: '150%',
      background: 'linear-gradient(to bottom, transparent, rgba(167, 139, 250, 0.6), transparent)',
      left: '50%',
      top: '50%',
      transformOrigin: 'center center',
      transform: `translateX(-50%) translateY(-50%) rotate(${angle}deg)`,
    }}
  />
);

export default function LevelUpModal({ isOpen, newLevel, totalXP, onClose }: LevelUpModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowContent(false);
      // Delay content to let backdrop animate in first
      setTimeout(() => setShowContent(true), 300);
    }
  }, [isOpen]);

  // Generate more particles with variety
  const particles = Array.from({ length: 60 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 60;
    const distance = 200 + Math.random() * 150;
    const colors = ['rgba(167, 139, 250, 0.8)', 'rgba(6, 182, 212, 0.6)', 'rgba(236, 72, 153, 0.6)'];
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      delay: Math.random() * 0.4,
      duration: 1.5 + Math.random() * 0.8,
      size: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });

  // Generate light rays
  const rays = Array.from({ length: 12 }, (_, i) => ({
    angle: (360 / 12) * i,
    delay: 0.2 + (i * 0.05),
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[250] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.98)' }}
          onClick={onClose}
        >
          {/* Light rays */}
          <div className="absolute inset-0 overflow-hidden">
            {rays.map((ray, i) => (
              <LightRay key={i} {...ray} />
            ))}
          </div>

          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle, i) => (
              <Particle key={i} {...particle} />
            ))}
          </div>

          {/* Multiple radial gradient glows */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 0.25, scale: 2.5 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(167, 139, 250, 0.3) 0%, transparent 60%)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.2, scale: 3 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
            }}
          />

          {/* Content */}
          {showContent && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: -50 }}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }} // Bounce easing
              className="relative z-10 text-center px-8 max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Trophy icon with glow */}
              <motion.div
                initial={{ scale: 0, rotate: -360 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.3, type: "spring", bounce: 0.6 }}
                className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-8 relative"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {/* Pulsing glow effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.15, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'var(--gradient-primary)', filter: 'blur(10px)' }}
                />
                <Award size={64} color="white" strokeWidth={2} className="relative z-10" />
              </motion.div>

              {/* "LEVEL UP!" text */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.h2
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-xl font-mono font-bold tracking-widest mb-4"
                  style={{
                    color: 'var(--color-accent)',
                    textShadow: '0 0 20px rgba(167, 139, 250, 0.8)',
                  }}
                >
                  LEVEL UP!
                </motion.h2>
              </motion.div>

              {/* New level number - BIG */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.7, type: "spring", bounce: 0.5 }}
                className="mb-8"
              >
                <motion.div
                  animate={{
                    textShadow: [
                      '0 0 10px rgba(167, 139, 250, 0.6)',
                      '0 0 15px rgba(167, 139, 250, 0.8)',
                      '0 0 10px rgba(167, 139, 250, 0.6)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="font-display font-bold"
                  style={{
                    fontSize: '200px',
                    lineHeight: 1,
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {newLevel}
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="flex items-center justify-center gap-8"
              >
                {/* Total XP */}
                <div className="flex items-center gap-3 px-6 py-3 rounded-button glass border"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <Zap size={24} style={{ color: 'var(--color-accent)' }} fill="currentColor" />
                  <div className="text-left">
                    <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>
                      {totalXP.toLocaleString()}
                    </div>
                    <div className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                      TOTAL XP
                    </div>
                  </div>
                </div>

                {/* XP Multiplier */}
                <div className="flex items-center gap-3 px-6 py-3 rounded-button glass border"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <TrendingUp size={24} style={{ color: 'var(--color-accent)' }} />
                  <div className="text-left">
                    <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>
                      {(1 + (newLevel - 1) * 0.02).toFixed(2)}x
                    </div>
                    <div className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                      MULTIPLIER
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="text-sm mt-8 mb-4"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                You're getting stronger. Keep pushing forward.
              </motion.p>

              {/* Tap to continue */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 0.5, delay: 1.4 }}
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
