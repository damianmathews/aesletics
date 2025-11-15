import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getLevelProgress } from '../lib/xp';
import { useState } from 'react';
import { TrendingUp, TrendingDown, Target, Zap, Flame, Trophy, Calendar, Filter } from 'lucide-react';

export default function Dashboard() {
  const { profile, getStats, getTodaysQuests } = useStore();
  const stats = getStats();
  const todaysQuests = getTodaysQuests();
  const levelProgress = getLevelProgress(profile.totalXP);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Calculate weekly change
  const lastWeekXP = stats.last14DaysXP.slice(0, 7).reduce((a, b) => a + b, 0);
  const thisWeekXP = stats.last14DaysXP.slice(7, 14).reduce((a, b) => a + b, 0);
  const weeklyChange = lastWeekXP > 0 ? ((thisWeekXP - lastWeekXP) / lastWeekXP) * 100 : 0;

  const streakChange = profile.currentStreak - (profile.longestStreak - profile.currentStreak);

  return (
    <div className="min-h-screen bg-pattern-dots" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Aesletics" className="h-12 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/app" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text)' }}>Dashboard</Link>
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
                  className="absolute right-0 mt-2 w-48 glass rounded-lg p-2 border"
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                Welcome back, {profile.nickname}
              </h1>
              <p className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Level {profile.level} • {profile.currentStreak} day streak
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg glass border transition-all hover:scale-105 flex items-center gap-2" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                <Calendar size={16} />
                <span className="text-sm font-mono">Select Dates</span>
              </button>
              <button className="px-4 py-2 rounded-lg glass border transition-all hover:scale-105 flex items-center gap-2" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                <Filter size={16} />
                <span className="text-sm font-mono">Filter</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Total XP - Large */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Your total XP</p>
          <h2 className="text-6xl font-bold tabular-nums mb-2" style={{
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {profile.totalXP.toLocaleString()}
          </h2>
        </motion.div>

        {/* Stats Grid - 3 Cards with Sparklines */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* XP This Week */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-6 border hover:scale-[1.02] transition-all" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>XP this week</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{stats.xpThisWeek.toLocaleString()}</h3>
                  <span className="flex items-center gap-1 text-sm font-mono" style={{ color: weeklyChange >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {weeklyChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(weeklyChange).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs font-mono mt-1" style={{ color: 'var(--color-text-tertiary)' }}>compared to last week</p>
              </div>
            </div>
            {/* Sparkline */}
            <div className="flex items-end gap-1 h-16">
              {stats.last14DaysXP.slice(7, 14).map((xp, i) => {
                const maxXP = Math.max(...stats.last14DaysXP);
                const height = maxXP > 0 ? (xp / maxXP) * 100 : 0;
                return (
                  <div key={i} className="flex-1 rounded-t" style={{
                    height: `${height}%`,
                    background: 'linear-gradient(180deg, #A78BFA 0%, #06B6D4 100%)',
                    minHeight: '4px'
                  }} />
                );
              })}
            </div>
          </motion.div>

          {/* Current Streak */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-xl p-6 border hover:scale-[1.02] transition-all" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Current streak</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{profile.currentStreak}</h3>
                  <span className="flex items-center gap-1 text-sm font-mono" style={{ color: streakChange >= 0 ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
                    {streakChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(streakChange)}
                  </span>
                </div>
                <p className="text-xs font-mono mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Best: {profile.longestStreak} days</p>
              </div>
              <div className="text-3xl">
                <Flame className="text-orange-500" />
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(profile.currentStreak / profile.longestStreak) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #F97316 0%, #EF4444 100%)' }}
              />
            </div>
          </motion.div>

          {/* Quests Completed */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-xl p-6 border hover:scale-[1.02] transition-all" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Quests completed</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{stats.completedToday}</h3>
                  <span className="flex items-center gap-1 text-sm font-mono" style={{ color: 'var(--color-success)' }}>
                    <TrendingUp size={14} />
                    {stats.completedThisWeek}
                  </span>
                </div>
                <p className="text-xs font-mono mt-1" style={{ color: 'var(--color-text-tertiary)' }}>today / this week</p>
              </div>
              <div className="text-3xl">
                <Target style={{ color: 'var(--color-cyan)' }} />
              </div>
            </div>
            {/* Mini chart */}
            <div className="flex items-end gap-1 h-16">
              {stats.last14DaysXP.slice(7, 14).map((xp, i) => {
                const completionsForDay = Math.max(1, Math.floor(xp / 20));
                const maxCompletions = 10;
                const height = (completionsForDay / maxCompletions) * 100;
                return (
                  <div key={i} className="flex-1 rounded-t" style={{
                    height: `${Math.min(height, 100)}%`,
                    background: 'linear-gradient(180deg, #EC4899 0%, #8B5CF6 100%)',
                    minHeight: '4px'
                  }} />
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Today's Quests */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>Today's Quests</h2>
            <Link to="/app/quests" className="text-sm font-mono transition-opacity hover:opacity-70 flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
              View All
              <span>→</span>
            </Link>
          </div>

          {todaysQuests.length === 0 ? (
            <div className="glass rounded-xl p-12 border text-center" style={{ borderColor: 'var(--color-border)' }}>
              <Trophy size={48} className="mx-auto mb-4" style={{ color: 'var(--color-accent)' }} />
              <p className="text-lg mb-4" style={{ color: 'var(--color-text)' }}>No quests today</p>
              <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>Add two quests to get started. Keep it simple.</p>
              <Link to="/app/quests" className="inline-block px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                Browse Quests
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {todaysQuests.map((quest, index) => (
                <motion.div key={quest.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }}>
                  <Link to={`/app/quests/${quest.id}`} className="block glass rounded-xl p-6 border hover:scale-[1.02] transition-all" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--color-text)' }}>{quest.title}</h3>
                        <div className="flex items-center gap-3 text-sm font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                          <span className="px-2 py-1 rounded text-xs font-medium capitalize" style={{ backgroundColor: 'var(--color-border)' }}>{quest.difficulty}</span>
                          <span>{quest.durationMinutes}min</span>
                          <span style={{ color: 'var(--color-accent)' }} className="font-bold">{quest.baseXP} XP</span>
                        </div>
                      </div>
                      <Zap size={24} style={{ color: 'var(--color-accent)' }} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Level Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-xl p-6 border" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Level Progress</h3>
              <p className="text-sm font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                {levelProgress.xpToNextLevel.toLocaleString()} XP to Level {profile.level + 1}
              </p>
            </div>
            <div className="text-4xl font-bold font-mono" style={{ color: 'var(--color-accent)' }}>
              {Math.round(levelProgress.progress * 100)}%
            </div>
          </div>
          <div className="w-full h-3 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress.progress * 100}%` }}
              transition={{ duration: 1, delay: 0.8 }}
              className="h-full rounded-full"
              style={{ background: 'var(--gradient-primary)' }}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
