import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getLevelProgress } from '../lib/xp';
import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Target, Zap, Trophy, Calendar, Filter, Package, Menu, X } from 'lucide-react';
import { questPacks, categories } from '../data/seed';
import StreakDisplay from '../components/StreakDisplay';
import { getLocalDateString } from '../lib/dateUtils';

export default function Dashboard() {
  const { profile, getStats, getTodaysQuests, activePacks, completions } = useStore();
  const stats = getStats();
  const allTodaysQuests = getTodaysQuests();
  const levelProgress = getLevelProgress(profile.totalXP);

  // Get last completion date for streak display (in local timezone)
  const lastCompletionDate = completions.length > 0
    ? getLocalDateString(new Date(completions[completions.length - 1].at))
    : undefined;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const dateFilterRef = useRef<HTMLDivElement>(null);
  const categoryFilterRef = useRef<HTMLDivElement>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setShowDateFilter(false);
      }
      if (categoryFilterRef.current && !categoryFilterRef.current.contains(event.target as Node)) {
        setShowCategoryFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter quests based on date and category
  const todaysQuests = allTodaysQuests.filter(quest => {
    // Category filter
    if (selectedCategory && quest.category !== selectedCategory) {
      return false;
    }
    // Date filter is applied to "today's quests" which are already filtered by date
    // For now we'll keep the same quests, but in a real app you'd filter by createdAt/completedAt
    return true;
  });

  // Calculate weekly change
  const lastWeekXP = stats.last14DaysXP.slice(0, 7).reduce((a, b) => a + b, 0);
  const thisWeekXP = stats.last14DaysXP.slice(7, 14).reduce((a, b) => a + b, 0);
  const weeklyChange = lastWeekXP > 0 ? ((thisWeekXP - lastWeekXP) / lastWeekXP) * 100 : 0;

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
            <Link to="/app" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text)' }}>Dashboard</Link>
            <Link to="/app/quests" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Quests</Link>
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
                  <Link to="/app/settings" className="block px-4 py-2 rounded hover:bg-white/5 transition-colors" style={{ color: 'var(--color-text)' }}>Profile</Link>
                  <Link to="/app/history" className="block px-4 py-2 rounded hover:bg-white/5 transition-colors" style={{ color: 'var(--color-text)' }}>History</Link>
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
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Page Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                Welcome back
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative" ref={dateFilterRef}>
                <button
                  onClick={() => {
                    setShowDateFilter(!showDateFilter);
                    setShowCategoryFilter(false); // Close other dropdown
                  }}
                  className="px-2 sm:px-4 py-2 rounded-lg glass border transition-all hover:scale-105 flex items-center gap-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  <Calendar size={16} />
                  <span className="hidden sm:inline text-sm font-mono">{selectedDateRange === 'today' ? 'Today' : selectedDateRange === 'week' ? 'This Week' : selectedDateRange === 'month' ? 'This Month' : 'All Time'}</span>
                </button>
                {showDateFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onMouseLeave={() => setShowDateFilter(false)}
                    className="absolute right-0 mt-2 w-48 glass rounded-lg p-2 border z-10"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <Link to="/app/history" className="block px-4 py-2 rounded hover:bg-white/5 transition-colors text-sm" style={{ color: 'var(--color-text)' }}>View History</Link>
                    <button
                      onClick={() => { setSelectedDateRange('today'); setShowDateFilter(false); }}
                      className="w-full text-left px-4 py-2 rounded hover:bg-white/5 transition-colors text-sm font-mono"
                      style={{ color: selectedDateRange === 'today' ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => { setSelectedDateRange('week'); setShowDateFilter(false); }}
                      className="w-full text-left px-4 py-2 rounded hover:bg-white/5 transition-colors text-sm font-mono"
                      style={{ color: selectedDateRange === 'week' ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                    >
                      This Week
                    </button>
                    <button
                      onClick={() => { setSelectedDateRange('month'); setShowDateFilter(false); }}
                      className="w-full text-left px-4 py-2 rounded hover:bg-white/5 transition-colors text-sm font-mono"
                      style={{ color: selectedDateRange === 'month' ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                    >
                      This Month
                    </button>
                    <button
                      onClick={() => { setSelectedDateRange('all'); setShowDateFilter(false); }}
                      className="w-full text-left px-4 py-2 rounded hover:bg-white/5 transition-colors text-sm font-mono"
                      style={{ color: selectedDateRange === 'all' ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                    >
                      All Time
                    </button>
                  </motion.div>
                )}
              </div>
              <div className="relative" ref={categoryFilterRef}>
                <button
                  onClick={() => {
                    setShowCategoryFilter(!showCategoryFilter);
                    setShowDateFilter(false); // Close other dropdown
                  }}
                  className="px-2 sm:px-4 py-2 rounded-lg glass border transition-all hover:scale-105 flex items-center gap-2"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  <Filter size={16} />
                  <span className="hidden sm:inline text-sm font-mono">{selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'All Categories'}</span>
                </button>
                {showCategoryFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onMouseLeave={() => setShowCategoryFilter(false)}
                    className="absolute right-0 mt-2 w-52 glass rounded-lg p-2 border z-10"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <Link to="/app/quests" className="block px-4 py-2 rounded hover:bg-white/5 transition-colors text-sm" style={{ color: 'var(--color-text)' }}>View All Quests</Link>
                    <Link to="/app/packs" className="block px-4 py-2 rounded hover:bg-white/5 transition-colors text-sm" style={{ color: 'var(--color-text)' }}>Quest Packs</Link>
                    <div className="border-t my-2" style={{ borderColor: 'var(--color-border)' }} />
                    <button
                      onClick={() => { setSelectedCategory(null); setShowCategoryFilter(false); }}
                      className="w-full text-left px-4 py-2 rounded hover:bg-white/5 transition-colors text-sm font-mono"
                      style={{ color: !selectedCategory ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                    >
                      All Categories
                    </button>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => { setSelectedCategory(category.id); setShowCategoryFilter(false); }}
                        className="w-full text-left px-4 py-2 rounded hover:bg-white/5 transition-colors text-xs"
                        style={{ color: selectedCategory === category.id ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                      >
                        {category.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Level & XP - Compact */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4 glass rounded-lg p-4 border" style={{ borderColor: 'var(--color-border)' }} data-tutorial="xp-display">
          <div className="flex items-center justify-between mb-3">
            {/* Level Badge - Compact */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(167, 139, 250, 0.3)',
                    '0 0 25px rgba(167, 139, 250, 0.5)',
                    '0 0 15px rgba(167, 139, 250, 0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex items-center justify-center w-16 h-16 rounded-lg"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <Trophy size={20} color="white" className="absolute top-1" />
                <div className="text-center mt-1">
                  <div className="text-2xl font-bold text-white tabular-nums">{profile.level}</div>
                </div>
              </motion.div>

              {/* Compact Info */}
              <div>
                <h2 className="text-xl font-bold leading-tight mb-0.5" style={{ color: 'var(--color-text)' }}>
                  Level {profile.level}
                </h2>
                <p className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                  {profile.totalXP.toLocaleString()} XP • {Math.round(levelProgress.progress * 100)}% to Lv.{profile.level + 1}
                </p>
              </div>
            </div>

            {/* XP to Next Level */}
            <div className="text-right">
              <div className="text-lg font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>
                {levelProgress.xpToNextLevel.toLocaleString()}
              </div>
              <p className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>XP needed</p>
            </div>
          </div>

          {/* Compact Animated Progress Bar */}
          <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress.progress * 100}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full relative"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {/* Animated shine */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                className="absolute inset-0 w-1/3"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
              />
            </motion.div>
            {/* Progress text overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-mono font-bold text-white drop-shadow">
                {levelProgress.currentLevelXP.toLocaleString()} / {levelProgress.nextLevelXP.toLocaleString()} XP
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Stats Grid - 2x2 Balanced Layout */}
        <div className="grid md:grid-cols-2 md:grid-rows-2 gap-3 mb-4" style={{ gridTemplateRows: 'repeat(2, 1fr)' }}>
          {/* Row 1 Left: Streak + Milestones */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-full">
            <StreakDisplay
              currentStreak={profile.currentStreak}
              longestStreak={profile.longestStreak}
              streakFreezes={profile.streakFreezes}
              lastCompletionDate={lastCompletionDate}
            />
          </motion.div>

          {/* Row 1 Right: Weekly Performance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-lg p-4 border h-full flex flex-col" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>WEEKLY PERFORMANCE</p>

            <div className="flex items-center gap-3 mb-3">
              <div>
                <h3 className="text-4xl font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>{stats.xpThisWeek.toLocaleString()}</h3>
                <p className="text-xs font-mono mt-1" style={{ color: 'var(--color-text-secondary)' }}>XP This Week</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-mono px-2 py-1 rounded" style={{
                color: weeklyChange >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                backgroundColor: weeklyChange >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
              }}>
                {weeklyChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(weeklyChange).toFixed(0)}%
              </div>
            </div>

            <div className="flex items-end gap-1 h-16 mb-2">
              {stats.last14DaysXP.slice(7, 14).map((xp, i) => {
                const maxXP = Math.max(...stats.last14DaysXP);
                const height = maxXP > 0 ? (xp / maxXP) * 100 : 0;
                return (
                  <div key={i} className="flex-1 rounded-t transition-all hover:opacity-70" style={{
                    height: `${height}%`,
                    background: 'var(--gradient-primary)',
                    minHeight: '4px'
                  }} />
                );
              })}
            </div>

            <p className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
              {stats.completedThisWeek} quests completed this week
            </p>
          </motion.div>

          {/* Row 2 Left: Today's Progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-lg p-4 border h-full flex flex-col" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>TODAY'S PROGRESS</p>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-4xl font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>{stats.completedToday}</h3>
                <p className="text-xs font-mono mt-1" style={{ color: 'var(--color-text-secondary)' }}>Quests Completed</p>
              </div>
              <Target size={32} style={{ color: 'var(--color-accent)', opacity: 0.3 }} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>XP Today</span>
                <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{stats.xpToday}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>This Month</span>
                <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{stats.completedThisMonth} quests</span>
              </div>
            </div>
          </motion.div>

          {/* Row 2 Right: Level Progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-lg p-4 border h-full flex flex-col" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>LEVEL PROGRESS</p>

            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-4xl font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>{profile.level}</h3>
                <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Current Level</p>
              </div>
              <Trophy size={28} style={{ color: 'var(--color-accent)', opacity: 0.3 }} />
            </div>

            {/* Animated Purple Progress Bar */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-text)' }}>Level {profile.level} → {profile.level + 1}</span>
                <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-accent)' }}>{Math.round(levelProgress.progress * 100)}%</span>
              </div>
              <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress.progress * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full relative"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {/* Animated shine effect */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                    className="absolute inset-0 w-1/3"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                  />
                </motion.div>
              </div>
              <p className="text-xs font-mono mt-1 text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                {levelProgress.xpToNextLevel.toLocaleString()} XP to next level
              </p>
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
            <div className="grid md:grid-cols-2 gap-3" data-tutorial="quest-cards">
              {todaysQuests.map((quest, index) => {
                // Check if quest belongs to any active pack
                const questPack = questPacks.find(pack =>
                  activePacks.includes(pack.id) &&
                  pack.quests.some(pq => pq.templateId === quest.templateId)
                );
                const isPackQuest = !!questPack;

                return (
                  <motion.div key={quest.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }}>
                    <Link
                      to={`/app/quests/${quest.id}`}
                      className="block glass rounded-lg p-4 border hover:scale-[1.02] transition-all relative"
                      style={{
                        borderColor: isPackQuest ? 'var(--color-accent)' : 'var(--color-border)',
                        ...(isPackQuest && { backgroundColor: 'rgba(167, 139, 250, 0.03)' })
                      }}
                    >
                      {isPackQuest && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: 'rgba(167, 139, 250, 0.2)', color: 'var(--color-accent)' }}>
                          <Package size={12} />
                          <span>{questPack!.title}</span>
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div className="flex-1" style={{ paddingRight: isPackQuest ? '80px' : '0' }}>
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
                );
              })}
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
