import { motion } from 'framer-motion';
import { Calendar, Flame, Shield, Zap } from 'lucide-react';

interface DailyLoginModalProps {
  isOpen: boolean;
  dayNumber: number; // 1-7 (day in cycle)
  xpBonus: number;
  totalLoginStreak: number;
  isNewStreak: boolean;
  streakFreezesEarned: number;
  onClose: () => void;
}

const weeklyRewards = [
  { day: 1, xp: 100, label: 'MON' },
  { day: 2, xp: 150, label: 'TUE' },
  { day: 3, xp: 200, label: 'WED' },
  { day: 4, xp: 300, label: 'THU' },
  { day: 5, xp: 400, label: 'FRI' },
  { day: 6, xp: 600, label: 'SAT' },
  { day: 7, xp: 1000, label: 'SUN' },
];

export default function DailyLoginModal({
  isOpen,
  dayNumber,
  xpBonus,
  totalLoginStreak,
  isNewStreak,
  streakFreezesEarned,
  onClose
}: DailyLoginModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
      onClick={onClose}
    >
      {/* Radial glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.2, scale: 2 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(167, 139, 250, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative z-10 max-w-md w-full mx-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main card */}
        <div className="glass rounded-lg p-6 border" style={{ borderColor: 'var(--color-border)' }}>
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Calendar size={32} color="white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Daily Login Bonus!
            </motion.h2>

            {isNewStreak ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Welcome back! Starting a new streak.
              </motion.p>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2"
              >
                <Flame size={18} style={{ color: 'var(--color-accent)' }} fill="currentColor" />
                <span className="text-sm font-mono font-bold" style={{ color: 'var(--color-accent)' }}>
                  {totalLoginStreak} DAY STREAK!
                </span>
              </motion.div>
            )}
          </div>

          {/* Weekly Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-7 gap-2 mb-6"
          >
            {weeklyRewards.map((reward) => {
              const isToday = reward.day === dayNumber;
              const isCompleted = reward.day < dayNumber;
              const isLocked = reward.day > dayNumber;

              return (
                <motion.div
                  key={reward.day}
                  initial={isToday ? { scale: 0 } : {}}
                  animate={isToday ? { scale: 1 } : {}}
                  transition={isToday ? { delay: 0.6 + reward.day * 0.05, type: "spring", bounce: 0.6 } : {}}
                  className={`relative flex flex-col items-center p-2 rounded-lg transition-all ${
                    isToday ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: isCompleted || isToday ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: isToday ? 'var(--color-accent)' : 'transparent',
                    border: isToday ? '2px solid' : 'none',
                    opacity: isLocked ? 0.4 : 1,
                  }}
                >
                  {/* Check mark for completed */}
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}

                  {/* Today indicator */}
                  {isToday && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                    />
                  )}

                  <div className="text-xs font-mono mb-1" style={{ color: isToday ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
                    {reward.label}
                  </div>
                  <div className={`text-sm font-bold font-mono tabular-nums ${isToday ? 'text-lg' : ''}`} style={{ color: isToday ? 'var(--color-accent)' : 'var(--color-text)' }}>
                    {reward.xp}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* XP Reward */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
            className="flex items-center justify-center gap-4 p-4 rounded-lg mb-6"
            style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)', border: '2px solid var(--color-accent)' }}
          >
            <Zap size={40} style={{ color: 'var(--color-accent)' }} fill="currentColor" />
            <div>
              <div className="text-4xl font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>
                +{xpBonus}
              </div>
              <div className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                XP EARNED
              </div>
            </div>
          </motion.div>

          {/* Streak Freeze Reward */}
          {streakFreezesEarned > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex items-center justify-center gap-3 p-3 rounded-lg mb-6"
              style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)' }}
            >
              <Shield size={24} style={{ color: '#06B6D4' }} />
              <div className="text-sm">
                <span className="font-bold" style={{ color: '#06B6D4' }}>+{streakFreezesEarned} Streak Freeze</span>
                <span className="text-xs ml-2" style={{ color: 'var(--color-text-secondary)' }}>
                  (Skip a day without breaking your streak!)
                </span>
              </div>
            </motion.div>
          )}

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-center text-xs mb-4"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <p>Log in daily for escalating rewards!</p>
            <p className="mt-1">Day 7 rewards reset the cycle with a huge bonus.</p>
          </motion.div>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            onClick={onClose}
            className="w-full py-3 rounded-lg font-semibold transition-all hover:scale-105"
            style={{ background: 'var(--gradient-primary)', color: 'white' }}
          >
            Claim Reward
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
