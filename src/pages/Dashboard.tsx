import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getLevelProgress } from '../lib/xp';
import { useState } from 'react';

export default function Dashboard() {
  const { profile, getStats, getTodaysQuests } = useStore();
  const stats = getStats();
  const todaysQuests = getTodaysQuests();
  const levelProgress = getLevelProgress(profile.totalXP);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-pattern-dots" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <span className="text-3xl">Æ</span>
            <span>Aesletics</span>
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Welcome back, {profile.nickname}</h1>
          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>Level {profile.level} • {profile.currentStreak} day streak 🔥</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Level & XP Ring */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-card p-6 border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Level</div>
                <div className="text-4xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{profile.level}</div>
              </div>
              <div className="relative w-20 h-20">
                <svg className="transform -rotate-90" width="80" height="80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="var(--color-border)" strokeWidth="8"/>
                  <circle cx="40" cy="40" r="36" fill="none" stroke="url(#gradient)" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - levelProgress.progress)}`}
                    strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38E28C"/>
                      <stop offset="100%" stopColor="#2DD4BF"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>
                  {Math.round(levelProgress.progress * 100)}%
                </div>
              </div>
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {levelProgress.xpToNextLevel.toLocaleString()} XP to Level {profile.level + 1}
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-card p-6 border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Current Streak</span>
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl">🔥</motion.span>
            </div>
            <div className="text-4xl font-bold tabular-nums mb-2" style={{ color: 'var(--color-text)' }}>{profile.currentStreak}</div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Best: {profile.longestStreak} days</div>
          </motion.div>

          {/* Total XP */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-card p-6 border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-secondary)' }}>Total XP</div>
            <div className="text-4xl font-bold tabular-nums mb-2" style={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>{profile.totalXP.toLocaleString()}</div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              +{stats.xpToday} today
            </div>
          </motion.div>
        </div>

        {/* Today's Quests */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-card p-6 mb-8 border" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>Today's Quests</h2>
            <Link to="/app/quests" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-accent)' }}>
              View All →
            </Link>
          </div>

          {todaysQuests.length === 0 ? (
            <div className="text-center py-12">
              <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>No quests today. Add two. Keep it simple.</p>
              <Link to="/app/quests" className="inline-block px-4 py-2 rounded-button font-medium transition-all hover:scale-105" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                Browse Quests
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysQuests.map((quest, index) => (
                <motion.div key={quest.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }}>
                  <Link to={`/app/quests/${quest.id}`} className="block p-4 rounded-button glass border hover:scale-[1.01] transition-all" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{quest.title}</h3>
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'var(--color-border)' }}>{quest.difficulty}</span>
                          <span>{quest.durationMinutes}min</span>
                          <span>•</span>
                          <span style={{ color: 'var(--color-accent)' }}>{quest.baseXP} XP</span>
                        </div>
                      </div>
                      <div className="text-2xl">→</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass rounded-card p-6 border" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>This Week</h3>
            <div className="text-3xl font-bold tabular-nums mb-2" style={{ color: 'var(--color-text)' }}>{stats.xpThisWeek.toLocaleString()}</div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>XP earned</div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass rounded-card p-6 border" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Completed</h3>
            <div className="text-3xl font-bold tabular-nums mb-2" style={{ color: 'var(--color-text)' }}>{profile.completedQuests}</div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total quests</div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="glass rounded-card p-6 border" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Avg Difficulty</h3>
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>{stats.averageDifficulty.toFixed(1)}</div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Out of 5.0</div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
