import { motion } from 'framer-motion';
import { Flame, Shield, AlertTriangle } from 'lucide-react';
import { getLocalDateString } from '../lib/dateUtils';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  lastCompletionDate?: string;
}

const MILESTONES = [7, 14, 30, 60, 100, 365];

export default function StreakDisplay({
  currentStreak,
  longestStreak,
  streakFreezes,
  lastCompletionDate
}: StreakDisplayProps) {
  // Check if streak is at risk (no completion today)
  const today = getLocalDateString();
  const isAtRisk = lastCompletionDate !== today && currentStreak > 0;

  // Find next milestone
  const nextMilestone = MILESTONES.find(m => m > currentStreak) || MILESTONES[MILESTONES.length - 1];
  const previousMilestone = MILESTONES.filter(m => m <= currentStreak).pop() || 0;
  const progress = previousMilestone === nextMilestone
    ? 100
    : ((currentStreak - previousMilestone) / (nextMilestone - previousMilestone)) * 100;

  // Glow intensity based on streak
  const glowIntensity = Math.min(currentStreak / 30, 1);

  return (
    <div className="glass rounded-lg p-4 border relative overflow-hidden h-full flex flex-col" style={{ borderColor: 'var(--color-border)' }}>
      {/* Warning banner if at risk */}
      {isAtRisk && currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 px-4 py-2 flex items-center justify-center gap-2 z-10"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(239, 68, 68, 0.3)' }}
        >
          <AlertTriangle size={16} color="#EF4444" />
          <span className="text-xs font-mono font-bold" style={{ color: '#EF4444' }}>
            STREAK AT RISK! Complete a quest today.
          </span>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col justify-center">
        {/* Main Streak Display */}
        <div className="flex items-center justify-between mb-3">
          {/* Left: Flame + Number */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                filter: `drop-shadow(0 0 ${12 + glowIntensity * 16}px rgba(167, 139, 250, ${0.4 + glowIntensity * 0.6}))`,
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Flame
                size={48}
                style={{ color: 'var(--color-accent)' }}
                fill="currentColor"
              />
            </motion.div>

            <div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold tabular-nums leading-none" style={{ color: 'var(--color-accent)' }}>
                  {currentStreak}
                </div>
                <div className="text-lg font-mono font-medium" style={{ color: 'var(--color-accent)' }}>
                  {currentStreak === 1 ? 'DAY' : 'DAYS'}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                  BEST:
                </span>
                <span className="text-xs font-bold font-mono tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                  {longestStreak}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Streak Freezes */}
          {streakFreezes > 0 && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)' }}>
                <Shield size={20} style={{ color: '#06B6D4' }} />
                <div className="text-right">
                  <div className="text-lg font-bold tabular-nums" style={{ color: '#06B6D4' }}>
                    {streakFreezes}
                  </div>
                  <div className="text-xs font-mono" style={{ color: '#06B6D4' }}>
                    FREEZES
                  </div>
                </div>
              </div>
              <p className="text-xs mt-2 text-right" style={{ color: 'var(--color-text-tertiary)' }}>
                Skip days without<br/>breaking streak
              </p>
            </div>
          )}
        </div>

      {/* Progress to next milestone */}
      {currentStreak < nextMilestone && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
              Next milestone: {nextMilestone} days
            </span>
            <span className="text-xs font-mono font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>
              {nextMilestone - currentStreak} to go
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: 'var(--gradient-primary)' }}
            />
          </div>
        </div>
      )}

        {/* Milestone celebration */}
        {MILESTONES.includes(currentStreak) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 rounded-lg text-center"
            style={{ backgroundColor: 'rgba(167, 139, 250, 0.15)', border: '1px solid var(--color-accent)' }}
          >
            <div className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
              🎉 MILESTONE REACHED!
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {currentStreak} day streak! Keep it going!
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
