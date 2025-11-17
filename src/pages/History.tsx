import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useState } from 'react';
import { Flame, Camera, Menu, X } from 'lucide-react';

export default function History() {
  const { profile, completions, getStats } = useStore();
  const stats = getStats();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Generate calendar heatmap data (last 12 weeks)
  const generateHeatmapData = () => {
    const weeks = 12;
    const days = weeks * 7;
    const today = new Date();
    const heatmapData: { date: string; xp: number; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayCompletions = completions.filter(
        (c) => c.at.split('T')[0] === dateStr
      );
      const xp = dayCompletions.reduce((sum, c) => sum + c.xp, 0);

      heatmapData.push({
        date: dateStr,
        xp,
        count: dayCompletions.length,
      });
    }

    return heatmapData;
  };

  const heatmapData = generateHeatmapData();

  // Group heatmap data by weeks
  const weeks: typeof heatmapData[] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  // Get intensity color based on XP (grey gradient)
  const getIntensityColor = (xp: number) => {
    if (xp === 0) return 'var(--color-border)';
    if (xp < 50) return 'rgba(255, 255, 255, 0.1)';
    if (xp < 100) return 'rgba(255, 255, 255, 0.2)';
    if (xp < 200) return 'rgba(255, 255, 255, 0.3)';
    return 'rgba(255, 255, 255, 0.4)';
  };

  // Recent completions (last 30)
  const recentCompletions = [...completions]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 30);

  return (
    <div className="min-h-screen bg-pattern-dots" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="IRLXP" className="h-12 w-auto" />
          </Link>
          <div className="flex items-center gap-3 md:gap-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden w-10 h-10 flex items-center justify-center"
              style={{ color: 'var(--color-text)' }}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/app" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Dashboard</Link>
            <Link to="/app/quests" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Quests</Link>
            <Link to="/app/leaderboard" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Leaderboard</Link>
            <Link to="/app/history" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text)' }}>History</Link>
            <Link to="/app/packs" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Packs</Link>
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
                  <Link to="/app/settings" className="block px-4 py-2 rounded hover:bg-white/5 transition-colors" style={{ color: 'var(--color-text)' }}>Profile</Link>
                  <Link to="/app/settings" className="block px-4 py-2 rounded hover:bg-white/5 transition-colors" style={{ color: 'var(--color-text)' }}>Settings</Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="md:hidden fixed inset-0 z-30 glass"
          style={{ backgroundColor: 'var(--color-bg)', top: '80px' }}
        >
          <div className="flex flex-col p-6 gap-4">
            <Link
              to="/app"
              onClick={() => setShowMobileMenu(false)}
              className="text-lg font-medium py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              Dashboard
            </Link>
            <Link
              to="/app/quests"
              onClick={() => setShowMobileMenu(false)}
              className="text-lg font-medium py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              Quests
            </Link>
            <Link
              to="/app/leaderboard"
              onClick={() => setShowMobileMenu(false)}
              className="text-lg font-medium py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              Leaderboard
            </Link>
            <Link
              to="/app/history"
              onClick={() => setShowMobileMenu(false)}
              className="text-lg font-medium py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              History
            </Link>
            <Link
              to="/app/packs"
              onClick={() => setShowMobileMenu(false)}
              className="text-lg font-medium py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              Packs
            </Link>
            <Link
              to="/app/settings"
              onClick={() => setShowMobileMenu(false)}
              className="text-lg font-medium py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              Settings
            </Link>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6 relative" data-tutorial="history-container">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)'
        }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Quest History</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>Your complete journey of progress and achievements</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-lg p-4 border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>TOTAL COMPLETIONS</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{completions.length}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-lg p-4 border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>TOTAL XP EARNED</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{profile.totalXP.toLocaleString()}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-lg p-4 border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>THIS MONTH</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{stats.completedThisMonth}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-lg p-4 border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>AVG DIFFICULTY</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{stats.averageDifficulty.toFixed(1)}</div>
          </motion.div>
        </div>

        {/* Calendar Heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-lg p-5 mb-6 border" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Activity</h2>

          <div className="overflow-x-auto">
            <div className="inline-flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => {
                    const date = new Date(day.date);
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    return (
                      <div
                        key={dayIdx}
                        className="w-3 h-3 rounded-sm transition-all hover:scale-150 hover:z-10 relative group"
                        style={{ backgroundColor: getIntensityColor(day.xp) }}
                        title={`${dateStr}: ${day.count} quests, ${day.xp} XP`}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded glass opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50" style={{ color: 'var(--color-text)' }}>
                          {dateStr}<br />
                          {day.count} quests<br />
                          {day.xp} XP
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--color-border)' }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(56, 226, 140, 0.3)' }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(56, 226, 140, 0.5)' }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(56, 226, 140, 0.7)' }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(56, 226, 140, 1)' }} />
            </div>
            <span>More</span>
          </div>
        </motion.div>

        {/* Recent Completions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-lg p-5 border" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Recent Completions</h2>

          {recentCompletions.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
              <p className="mb-4">No completions yet. Start your first quest!</p>
              <Link to="/app/quests" className="inline-block px-4 py-2 rounded-button font-medium transition-all hover:scale-105" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                Browse Quests
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCompletions.map((completion, index) => {
                const date = new Date(completion.at);
                const timeAgo = getTimeAgo(date);

                return (
                  <motion.div
                    key={completion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="p-3 rounded-lg glass border hover:scale-[1.01] transition-all"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{completion.questTitle}</h3>
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                            {completion.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          <span>{timeAgo}</span>
                          <span>•</span>
                          <span className="font-medium" style={{ color: 'var(--color-accent)' }}>+{completion.xp} XP</span>
                          <span>•</span>
                          <span className="capitalize">{completion.difficulty}</span>
                          {completion.streakBonus && (
                            <>
                              <span>•</span>
                              <span className="text-orange-400 flex items-center gap-1">
                                <Flame size={14} /> Streak bonus
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {completion.proof?.type === 'photo' && (
                        <div className="w-10 h-10 rounded overflow-hidden ml-3">
                          <div className="w-full h-full glass flex items-center justify-center">
                            <Camera size={16} style={{ color: 'var(--color-text-secondary)' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

// Helper function to get relative time
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
