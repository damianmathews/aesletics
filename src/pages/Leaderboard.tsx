import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useState } from 'react';
import { Zap, Trophy, Flame, Calendar, CheckCircle, Circle, Check } from 'lucide-react';

export default function Leaderboard() {
  const { profile, completions, getStats } = useStore();
  const stats = getStats();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Calculate category stats
  const categoryStats = completions.reduce((acc, completion) => {
    if (!acc[completion.category]) {
      acc[completion.category] = {
        count: 0,
        xp: 0,
        avgDifficulty: 0,
        difficulties: [] as string[],
      };
    }
    acc[completion.category].count += 1;
    acc[completion.category].xp += completion.xp;
    acc[completion.category].difficulties.push(completion.difficulty);
    return acc;
  }, {} as Record<string, { count: number; xp: number; avgDifficulty: number; difficulties: string[] }>);

  // Calculate average difficulty for each category
  const difficultyMap = { easy: 1, medium: 2, hard: 3, elite: 4, legendary: 5 };
  Object.keys(categoryStats).forEach((category) => {
    const cat = categoryStats[category];
    const sum = cat.difficulties.reduce((s, d) => s + (difficultyMap[d as keyof typeof difficultyMap] || 0), 0);
    cat.avgDifficulty = sum / cat.difficulties.length;
  });

  // Sort categories by XP
  const sortedCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b.xp - a.xp)
    .slice(0, 12);

  // Personal records
  const records = [
    { title: 'Total XP', value: profile.totalXP.toLocaleString(), Icon: Zap, color: 'var(--gradient-primary)' },
    { title: 'Level Reached', value: profile.level.toString(), Icon: Trophy, color: 'var(--gradient-primary)' },
    { title: 'Longest Streak', value: `${profile.longestStreak} days`, Icon: Flame, color: 'var(--gradient-secondary)' },
    { title: 'Current Streak', value: `${profile.currentStreak} days`, Icon: Zap, color: 'var(--gradient-primary)' },
    { title: 'Total Quests', value: completions.length.toString(), Icon: CheckCircle, color: 'var(--gradient-primary)' },
    { title: 'This Month', value: stats.completedThisMonth.toString(), Icon: Calendar, color: 'var(--gradient-secondary)' },
  ];

  // Milestones
  const milestones = [
    { title: 'First Quest', achieved: completions.length >= 1, threshold: 1 },
    { title: '10 Quests', achieved: completions.length >= 10, threshold: 10 },
    { title: '50 Quests', achieved: completions.length >= 50, threshold: 50 },
    { title: '100 Quests', achieved: completions.length >= 100, threshold: 100 },
    { title: 'Level 5', achieved: profile.level >= 5, threshold: 5 },
    { title: 'Level 10', achieved: profile.level >= 10, threshold: 10 },
    { title: '7-Day Streak', achieved: profile.longestStreak >= 7, threshold: 7 },
    { title: '30-Day Streak', achieved: profile.longestStreak >= 30, threshold: 30 },
    { title: '1,000 XP', achieved: profile.totalXP >= 1000, threshold: 1000 },
    { title: '10,000 XP', achieved: profile.totalXP >= 10000, threshold: 10000 },
  ];

  const achievedCount = milestones.filter(m => m.achieved).length;

  return (
    <div className="min-h-screen bg-pattern-dots" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Aesletics" className="h-12 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/app" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Dashboard</Link>
            <Link to="/app/quests" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Quests</Link>
            <Link to="/app/history" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>History</Link>
            <Link to="/app/packs" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Packs</Link>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all hover:scale-105"
                style={{ background: 'var(--gradient-primary)', color: 'white' }}
              >
                {profile.nickname.charAt(0).toUpperCase()}
              </button>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 glass rounded-button p-2 border"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <Link to="/app/settings" className="block px-4 py-2 rounded hover:bg-white/5 transition-colors" style={{ color: 'var(--color-text)' }}>Settings</Link>
                  <Link to="/app/history" className="block px-4 py-2 rounded hover:bg-white/5 transition-colors" style={{ color: 'var(--color-text)' }}>History</Link>
                  <Link to="/app/leaderboard" className="block px-4 py-2 rounded hover:bg-white/5 transition-colors" style={{ color: 'var(--color-text)' }}>Leaderboard</Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)'
        }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <h1 className="font-display text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>You vs. You</h1>
          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>Track your personal records and category performance</p>
        </motion.div>

        {/* Personal Records */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
          <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Personal Records</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {records.map((record, index) => {
              const IconComponent = record.Icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="glass rounded-card p-6 border"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{record.title}</span>
                    <IconComponent size={32} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div className="text-4xl font-bold tabular-nums" style={{
                    background: record.color,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {record.value}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Category Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 relative">
          <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Category Performance</h2>
          <div className="glass rounded-card p-6 border" style={{ borderColor: 'var(--color-border)' }}>
            {sortedCategories.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
                <p className="mb-4">No category data yet. Complete your first quest to see stats!</p>
                <Link to="/app/quests" className="inline-block px-4 py-2 rounded-button font-medium transition-all hover:scale-105" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                  Browse Quests
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedCategories.map(([category, data], index) => {
                  const maxXP = sortedCategories[0][1].xp;
                  const percentage = (data.xp / maxXP) * 100;

                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                            #{index + 1}
                          </span>
                          <span className="font-medium capitalize" style={{ color: 'var(--color-text)' }}>
                            {category.replace(/-/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          <span>{data.count} quests</span>
                          <span className="font-bold" style={{ color: 'var(--color-accent)' }}>{data.xp.toLocaleString()} XP</span>
                          <span>Avg: {data.avgDifficulty.toFixed(1)}/5</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                          className="h-full rounded-full"
                          style={{ background: 'var(--gradient-primary)' }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>Milestones</h2>
            <span className="text-sm font-medium px-3 py-1 rounded-full glass" style={{ color: 'var(--color-accent)' }}>
              {achievedCount}/{milestones.length} achieved
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                className="p-4 rounded-card glass border"
                style={{ borderColor: milestone.achieved ? 'var(--color-accent)' : 'var(--color-border)' }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${milestone.achieved ? '' : 'bg-white/5'}`} style={{ backgroundColor: milestone.achieved ? 'var(--color-accent)' : undefined }}>
                    {milestone.achieved ? <Check size={16} color="white" /> : <Circle size={16} style={{ color: 'var(--color-text-secondary)' }} />}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: milestone.achieved ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
                      {milestone.title}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
