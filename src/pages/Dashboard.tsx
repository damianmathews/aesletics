import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getLevelProgress } from '../lib/xp';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Zap, Flame, Trophy, Calendar, Filter, Package } from 'lucide-react';
import { questPacks } from '../data/seed';

export default function Dashboard() {
  const { profile, getStats, getTodaysQuests, activePacks } = useStore();
  const stats = getStats();
  const todaysQuests = getTodaysQuests();
  const levelProgress = getLevelProgress(profile.totalXP);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Calculate weekly change
  const lastWeekXP = stats.last14DaysXP.slice(0, 7).reduce((a, b) => a + b, 0);
  const thisWeekXP = stats.last14DaysXP.slice(7, 14).reduce((a, b) => a + b, 0);
  const weeklyChange = lastWeekXP > 0 ? ((thisWeekXP - lastWeekXP) / lastWeekXP) * 100 : 0;

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
            <Link to="/app/leaderboard" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Leaderboard</Link>
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
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Page Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <p className="text-xs font-medium mb-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>TOTAL XP</p>
          <div className="flex items-baseline gap-4">
            <h2 className="text-5xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>
              {profile.totalXP.toLocaleString()}
            </h2>
            <div className="text-sm font-mono" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="font-bold" style={{ color: 'var(--color-accent)' }}>Level {profile.level}</span> • {Math.round(levelProgress.progress * 100)}% to next
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - 4 Cards with Sparklines */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {/* XP This Week */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-lg p-4 border hover:scale-[1.02] transition-all" style={{ borderColor: 'var(--color-border)' }}>
            <div className="mb-3">
              <p className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>XP THIS WEEK</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{stats.xpThisWeek.toLocaleString()}</h3>
                <span className="flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded" style={{
                  color: weeklyChange >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                  backgroundColor: weeklyChange >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                }}>
                  {weeklyChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(weeklyChange).toFixed(0)}%
                </span>
              </div>
            </div>
            {/* Sparkline */}
            <div className="flex items-end gap-0.5 h-12">
              {stats.last14DaysXP.slice(7, 14).map((xp, i) => {
                const maxXP = Math.max(...stats.last14DaysXP);
                const height = maxXP > 0 ? (xp / maxXP) * 100 : 0;
                return (
                  <div key={i} className="flex-1 rounded-t" style={{
                    height: `${height}%`,
                    background: 'linear-gradient(180deg, #3A3A3A 0%, #2A2A2A 100%)',
                    minHeight: '4px'
                  }} />
                );
              })}
            </div>
          </motion.div>

          {/* Current Streak */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-lg p-4 border hover:scale-[1.02] transition-all" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>CURRENT STREAK</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{profile.currentStreak}</h3>
                  <span className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>days</span>
                </div>
                <p className="text-xs font-mono mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Best: {profile.longestStreak}</p>
              </div>
              <Flame size={20} className="text-orange-500" />
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-lg p-4 border hover:scale-[1.02] transition-all" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>QUESTS TODAY</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{stats.completedToday}</h3>
                  <span className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>/ {stats.completedThisWeek} week</span>
                </div>
                <p className="text-xs font-mono mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Month: {stats.completedThisMonth}</p>
              </div>
              <Target size={20} style={{ color: 'var(--color-text-secondary)' }} />
            </div>
            {/* Mini chart */}
            <div className="flex items-end gap-0.5 h-12">
              {stats.last14DaysXP.slice(7, 14).map((xp, i) => {
                const completionsForDay = Math.max(1, Math.floor(xp / 20));
                const maxCompletions = 10;
                const height = (completionsForDay / maxCompletions) * 100;
                return (
                  <div key={i} className="flex-1 rounded-t" style={{
                    height: `${Math.min(height, 100)}%`,
                    background: 'linear-gradient(180deg, #3A3A3A 0%, #2A2A2A 100%)',
                    minHeight: '4px'
                  }} />
                );
              })}
            </div>
          </motion.div>

          {/* New Metric: Average Daily XP */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass rounded-lg p-4 border hover:scale-[1.02] transition-all" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>AVG DAILY XP</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{Math.round(stats.xpThisWeek / 7)}</h3>
                  <span className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>per day</span>
                </div>
                <p className="text-xs font-mono mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Last 7 days</p>
              </div>
              <Zap size={20} style={{ color: 'var(--color-accent)' }} />
            </div>
            {/* Mini chart */}
            <div className="flex items-end gap-0.5 h-12">
              {stats.last14DaysXP.slice(7, 14).map((xp, i) => {
                const maxXP = Math.max(...stats.last14DaysXP);
                const height = maxXP > 0 ? (xp / maxXP) * 100 : 0;
                return (
                  <div key={i} className="flex-1 rounded-t" style={{
                    height: `${height}%`,
                    background: 'linear-gradient(180deg, rgba(167, 139, 250, 0.4) 0%, rgba(167, 139, 250, 0.2) 100%)',
                    minHeight: '4px'
                  }} />
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Active Packs - Prominent Section */}
        {activePacks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-6">
            <div className="glass rounded-lg p-6 border-2" style={{ borderColor: 'var(--color-accent)', background: 'rgba(167, 139, 250, 0.03)' }}>
              <div className="flex items-center gap-3 mb-4">
                <Package size={24} style={{ color: 'var(--color-accent)' }} />
                <div>
                  <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-text)' }}>Active Quest Packs</h2>
                  <p className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>{activePacks.length} program{activePacks.length > 1 ? 's' : ''} in progress</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {activePacks.map((packId, index) => {
                  const pack = questPacks.find(p => p.id === packId);
                  if (!pack) return null;

                  return (
                    <motion.div
                      key={packId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Link to="/app/packs" className="block glass rounded-lg p-3 border hover:scale-[1.02] transition-all" style={{ borderColor: 'var(--color-accent)' }}>
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{pack.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>{pack.title}</h3>
                            <div className="flex items-center gap-2 text-xs font-mono mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                              <span className="px-1.5 py-0.5 rounded capitalize text-xs" style={{ backgroundColor: 'var(--color-border)' }}>{pack.difficulty}</span>
                              <span>•</span>
                              <span>{pack.durationDays}d</span>
                            </div>
                            {/* Simple progress bar */}
                            <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                              <div className="h-full rounded-full" style={{ background: 'var(--gradient-primary)', width: '35%' }} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Today's Quests */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Today's Quests</h2>
            <Link to="/app/quests" className="text-sm font-mono transition-opacity hover:opacity-70 flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
              View All
              <span>→</span>
            </Link>
          </div>

          {todaysQuests.length === 0 ? (
            <div className="glass rounded-lg p-8 border text-center" style={{ borderColor: 'var(--color-border)' }}>
              <Trophy size={32} className="mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />
              <p className="text-base mb-2" style={{ color: 'var(--color-text)' }}>No quests today</p>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Add two quests to get started. Keep it simple.</p>
              <Link to="/app/quests" className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                Browse Quests
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {todaysQuests.map((quest, index) => (
                <motion.div key={quest.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }}>
                  <Link to={`/app/quests/${quest.id}`} className="block glass rounded-lg p-4 border hover:scale-[1.02] transition-all" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--color-text)' }}>{quest.title}</h3>
                        <div className="flex items-center gap-2.5 text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium capitalize" style={{ backgroundColor: 'var(--color-border)' }}>{quest.difficulty}</span>
                          <span>{quest.durationMinutes}min</span>
                          <span style={{ color: 'var(--color-accent)' }} className="font-bold">{quest.baseXP} XP</span>
                        </div>
                      </div>
                      <Zap size={20} style={{ color: 'var(--color-accent)' }} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Level Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-lg p-5 border" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Level Progress</h3>
              <p className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                {levelProgress.xpToNextLevel.toLocaleString()} XP to Level {profile.level + 1}
              </p>
            </div>
            <div className="text-3xl font-bold font-mono" style={{ color: 'var(--color-accent)' }}>
              {Math.round(levelProgress.progress * 100)}%
            </div>
          </div>
          <div className="w-full h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
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
