import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useState } from 'react';
import { Flame, Camera, Menu, X, TrendingUp, BarChart3 } from 'lucide-react';
import { getLocalDateString } from '../lib/dateUtils';
import { categories } from '../data/seed';

export default function Stats() {
  const { profile, completions, getStats } = useStore();
  const stats = getStats();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Calculate actual totalXP from completions if profile.totalXP is invalid
  const actualTotalXP = (profile.totalXP && !isNaN(profile.totalXP))
    ? profile.totalXP
    : completions.reduce((sum, c) => sum + (c.xp || 0), 0);

  // Generate XP over time data (last 14 days)
  const generateXPOverTime = () => {
    const days = 14;
    const today = new Date();
    const xpData: { date: string; xp: number; label: string }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = getLocalDateString(date);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayCompletions = completions.filter(
        (c) => c.at.split('T')[0] === dateStr
      );
      // Handle NaN/undefined xp values
      const xp = dayCompletions.reduce((sum, c) => sum + (c.xp || 0), 0);

      xpData.push({ date: dateStr, xp: isNaN(xp) ? 0 : xp, label });
    }

    return xpData;
  };

  const xpOverTime = generateXPOverTime();
  const maxXP = Math.max(...xpOverTime.map(d => d.xp), 1);
  // Use a reasonable fixed scale for bar chart (500 XP or highest value + 20%)
  const chartScale = Math.max(500, Math.ceil(maxXP * 1.2 / 100) * 100);

  // Category breakdown
  // Bug #17 fix: Skip completions with undefined/null category
  const categoryData: Record<string, { xp: number; count: number }> = {};
  completions.forEach(c => {
    const category = c.category || 'uncategorized';
    if (!categoryData[category]) {
      categoryData[category] = { xp: 0, count: 0 };
    }
    // Handle NaN/undefined xp values
    const xpValue = c.xp || 0;
    categoryData[category].xp += isNaN(xpValue) ? 0 : xpValue;
    categoryData[category].count += 1;
  });

  const categoryBreakdown = Object.entries(categoryData)
    .map(([categoryId, data]) => ({
      categoryId,
      categoryName: categories.find(c => c.id === categoryId)?.name || categoryId,
      xp: data.xp,
      count: data.count,
    }))
    .sort((a, b) => b.xp - a.xp);

  // Generate calendar heatmap data (last 12 weeks)
  const generateHeatmapData = () => {
    const weeks = 12;
    const days = weeks * 7;
    const today = new Date();
    const heatmapData: { date: string; xp: number; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = getLocalDateString(date);

      const dayCompletions = completions.filter(
        (c) => c.at.split('T')[0] === dateStr
      );
      // Handle NaN/undefined xp values
      const xp = dayCompletions.reduce((sum, c) => sum + (c.xp || 0), 0);

      heatmapData.push({
        date: dateStr,
        xp: isNaN(xp) ? 0 : xp,
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
          <Link to="/app" className="flex items-center gap-3">
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
            <Link to="/app/stats" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text)' }}>Stats</Link>
            <Link to="/app/leaderboard" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Leaderboard</Link>
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
                  className="absolute right-0 mt-2 w-48 rounded-lg p-2 border shadow-2xl"
                  style={{
                    borderColor: 'var(--color-accent)',
                    backgroundColor: 'rgba(17, 17, 24, 0.98)',
                    backdropFilter: 'blur(20px)'
                  }}
                >
                  <Link to="/app/stats" className="block px-4 py-2 rounded hover:bg-white/5 transition-colors" style={{ color: 'var(--color-text)' }}>Stats</Link>
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
              to="/app/stats"
              onClick={() => setShowMobileMenu(false)}
              className="text-lg font-medium py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              Stats
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
      <main className="max-w-7xl mx-auto px-6 py-6 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)'
        }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Stats & History</h1>
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
            <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{actualTotalXP.toLocaleString()}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-lg p-4 border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>THIS MONTH</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{stats.completedThisMonth}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-lg p-4 border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>AVG DIFFICULTY</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{(stats.averageDifficulty || 0).toFixed(1)}</div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* XP Over Time Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-lg p-5 border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} style={{ color: 'var(--color-accent)' }} />
                <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-text)' }}>XP Last 14 Days</h2>
              </div>
              <div className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                Scale: 0 - {chartScale}
              </div>
            </div>

            <div className="space-y-2">
              {xpOverTime.map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.02 * index }}
                  className="flex items-center gap-2"
                >
                  <div className="text-xs font-mono w-16 text-right" style={{ color: 'var(--color-text-secondary)' }}>
                    {day.label.split(' ')[0]} {day.label.split(' ')[1]}
                  </div>
                  <div className="flex-1 h-6 rounded overflow-hidden relative" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <div
                      className="h-full transition-all hover:opacity-80 flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.min((day.xp / chartScale) * 100, 100)}%`,
                        backgroundColor: 'var(--color-accent)',
                      }}
                    >
                      {day.xp > 0 && (
                        <span className="text-[10px] font-bold text-white">{Math.round((day.xp / chartScale) * 100)}%</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-mono font-bold w-12" style={{ color: 'var(--color-accent)' }}>
                    {day.xp}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Category Breakdown Pie Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-lg p-5 border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} style={{ color: 'var(--color-accent)' }} />
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Category Breakdown</h2>
            </div>

            {categoryBreakdown.length > 0 ? (
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Pie Chart */}
                <div className="relative w-48 h-48 flex-shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: (() => {
                        const totalXP = categoryBreakdown.reduce((sum, c) => sum + (c.xp || 0), 0);
                        // If no XP data, show a gray circle
                        if (totalXP === 0 || isNaN(totalXP)) {
                          return 'var(--color-border)';
                        }
                        const colors = [
                          'rgba(167, 139, 250, 1)',
                          'rgba(6, 182, 212, 1)',
                          'rgba(236, 72, 153, 1)',
                          'rgba(251, 191, 36, 1)',
                          'rgba(34, 197, 94, 1)',
                          'rgba(249, 115, 22, 1)',
                        ];
                        return `conic-gradient(${categoryBreakdown.slice(0, 6).map((cat, idx) => {
                          const prevPercent = categoryBreakdown.slice(0, idx).reduce((sum, c) => sum + ((c.xp || 0) / totalXP * 100), 0);
                          const currentPercent = (cat.xp || 0) / totalXP * 100;
                          return `${colors[idx]} ${prevPercent}% ${prevPercent + currentPercent}%`;
                        }).join(', ')})`;
                      })(),
                    }}
                  />
                  {/* Center hole for donut effect */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
                      <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>
                        {categoryBreakdown.length}
                      </div>
                      <div className="text-[10px] font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                        CATEGORIES
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2">
                  {categoryBreakdown.slice(0, 6).map((category, index) => {
                    const colors = [
                      'rgba(167, 139, 250, 1)',
                      'rgba(6, 182, 212, 1)',
                      'rgba(236, 72, 153, 1)',
                      'rgba(251, 191, 36, 1)',
                      'rgba(34, 197, 94, 1)',
                      'rgba(249, 115, 22, 1)',
                    ];
                    const totalXP = categoryBreakdown.reduce((sum, c) => sum + (c.xp || 0), 0);
                    const percent = totalXP > 0 ? (((category.xp || 0) / totalXP) * 100).toFixed(1) : '0.0';

                    return (
                      <motion.div
                        key={category.categoryId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.02 * index }}
                        className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colors[index] }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                            {category.categoryName}
                          </div>
                          <div className="text-[10px] font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                            {category.count} quests
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-bold tabular-nums" style={{ color: colors[index] }}>
                            {percent}%
                          </div>
                          <div className="text-[10px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                            {category.xp || 0} XP
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                No data yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Calendar Heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-lg p-5 mb-6 border overflow-visible" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Activity</h2>

          <div className="overflow-x-auto overflow-y-visible pb-12">
            <div className="inline-flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => {
                    const date = new Date(day.date);
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    return (
                      <div
                        key={dayIdx}
                        className="w-3 h-3 rounded-sm transition-all hover:scale-150 relative group"
                        style={{ backgroundColor: getIntensityColor(day.xp), zIndex: 10 }}
                        title={`${dateStr}: ${day.count} quests, ${day.xp} XP`}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium shadow-xl border" style={{
                          color: 'var(--color-text)',
                          backgroundColor: 'rgba(17, 17, 24, 0.98)',
                          backdropFilter: 'blur(20px)',
                          borderColor: 'var(--color-accent)',
                          zIndex: 9999
                        }}>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass rounded-lg p-5 border" style={{ borderColor: 'var(--color-border)' }}>
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
                          <span className="font-medium" style={{ color: 'var(--color-accent)' }}>+{completion.xp || 0} XP</span>
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
