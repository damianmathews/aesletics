import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getLevelProgress } from '../lib/xp';
import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Target, Zap, Trophy, Calendar, Filter, Package, Menu, X, Flame, Shield, Dumbbell, Sparkles, Brain, Heart, Users, Mountain, Briefcase, Palette } from 'lucide-react';
import { questPacks, categories } from '../data/seed';

// Category icon mapping
const getCategoryIcon = (categoryId: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'fitness': <Dumbbell size={20} />,
    'body-wellness': <Sparkles size={20} />,
    'athletics-skill': <Zap size={20} />,
    'intelligence': <Brain size={20} />,
    'discipline': <Shield size={20} />,
    'mental': <Heart size={20} />,
    'social-leadership': <Users size={20} />,
    'adventure-outdoors': <Mountain size={20} />,
    'finance-career': <Briefcase size={20} />,
    'creativity': <Palette size={20} />,
  };
  return iconMap[categoryId] || <Zap size={20} />;
};

export default function Dashboard() {
  const { profile, getStats, getTodaysQuests, activePacks } = useStore();
  const stats = getStats();
  const allTodaysQuests = getTodaysQuests();
  const levelProgress = getLevelProgress(profile.totalXP);

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

  // Split quests into pack quests and regular quests
  const packQuests = todaysQuests.filter(quest =>
    activePacks.some(packId =>
      questPacks.find(p => p.id === packId)?.quests
        .some(pq => pq.templateId === quest.templateId)
    )
  );
  const regularQuests = todaysQuests.filter(quest => !packQuests.includes(quest));

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
      <main className="max-w-7xl mx-auto px-6 py-4">
        {/* Page Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
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

        {/* Compact Single Row - 4 Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-3">
          <div className="flex gap-3 overflow-x-auto">
            {/* Card 1: Level & XP */}
            <div className="glass rounded-lg p-3 border flex-shrink-0" style={{ borderColor: 'var(--color-border)', minWidth: '220px' }} data-tutorial="xp-display">
              <p className="text-xs font-mono font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>LEVEL & XP</p>

              <div className="flex items-center gap-3 mb-3">
                {/* 80x80 Level Badge */}
                <div
                  className="flex flex-col items-center justify-center rounded-lg flex-shrink-0"
                  style={{ background: 'var(--gradient-primary)', width: '80px', height: '80px' }}
                >
                  <div className="text-xs font-mono font-bold text-white opacity-70 mb-0.5">LEVEL</div>
                  <div className="text-3xl font-bold text-white tabular-nums">{profile.level}</div>
                </div>

                {/* Info with better hierarchy */}
                <div className="flex-1">
                  <div className="mb-2">
                    <div className="text-lg font-bold tabular-nums leading-none" style={{ color: 'var(--color-text)' }}>
                      {profile.totalXP.toLocaleString()}
                    </div>
                    <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                      Total XP
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded" style={{ backgroundColor: 'rgba(167, 139, 250, 0.15)' }}>
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-accent)' }}>
                      {Math.round(levelProgress.progress * 100)}%
                    </span>
                    <span className="text-xs font-mono" style={{ color: 'var(--color-accent)' }}>
                      to Lv.{profile.level + 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${levelProgress.progress * 100}%`,
                    background: 'var(--gradient-primary)'
                  }}
                />
              </div>
              <p className="text-xs font-mono mt-1.5 text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                {levelProgress.xpToNextLevel.toLocaleString()} XP needed
              </p>
            </div>

            {/* Card 2: Streak */}
            <div className="glass rounded-lg p-3 border flex-shrink-0 flex flex-col" style={{ borderColor: 'var(--color-border)', minWidth: '200px' }}>
              <p className="text-xs font-mono font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>STREAK</p>

              <div className="flex items-center gap-3 flex-1">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    filter: `drop-shadow(0 0 12px rgba(167, 139, 250, 0.6))`,
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Flame
                    size={40}
                    style={{ color: 'var(--color-accent)' }}
                    fill="currentColor"
                  />
                </motion.div>

                <div className="flex-1">
                  <div className="text-3xl font-bold tabular-nums leading-none" style={{ color: 'var(--color-accent)' }}>
                    {profile.currentStreak}
                  </div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    {profile.currentStreak === 1 ? 'DAY' : 'DAYS'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>BEST:</span>
                    <span className="text-xs font-bold font-mono tabular-nums" style={{ color: 'var(--color-text)' }}>
                      {profile.longestStreak}
                    </span>
                  </div>
                </div>
              </div>

              {profile.streakFreezes > 0 && (
                <div className="flex items-center gap-2 mt-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)' }}>
                  <Shield size={16} style={{ color: '#06B6D4' }} />
                  <span className="text-xs font-mono font-bold" style={{ color: '#06B6D4' }}>
                    {profile.streakFreezes} FREEZES
                  </span>
                </div>
              )}
            </div>

            {/* Card 3: Weekly Performance */}
            <div className="glass rounded-lg p-3 border flex-shrink-0 flex flex-col" style={{ borderColor: 'var(--color-border)', minWidth: '200px' }}>
              <p className="text-xs font-mono font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>WEEKLY XP</p>

              <div className="flex items-center gap-2 mb-2">
                <div>
                  <div className="text-3xl font-bold tabular-nums leading-none" style={{ color: 'var(--color-accent)' }}>
                    {stats.xpThisWeek.toLocaleString()}
                  </div>
                  <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>This Week</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded" style={{
                  color: weeklyChange >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                  backgroundColor: weeklyChange >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                }}>
                  {weeklyChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(weeklyChange).toFixed(0)}%
                </div>
              </div>

              <div className="flex items-end gap-1 h-12 flex-1">
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

              <p className="text-xs font-mono mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                {stats.completedThisWeek} quests
              </p>
            </div>

            {/* Card 4: Today's Progress */}
            <div className="glass rounded-lg p-3 border flex-shrink-0 flex flex-col" style={{ borderColor: 'var(--color-border)', minWidth: '180px' }}>
              <p className="text-xs font-mono font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>TODAY</p>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-3xl font-bold tabular-nums leading-none" style={{ color: 'var(--color-accent)' }}>
                    {stats.completedToday}
                  </div>
                  <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Quests</p>
                </div>
                <Target size={28} style={{ color: 'var(--color-accent)', opacity: 0.3 }} />
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>XP</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{stats.xpToday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>Month</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{stats.completedThisMonth}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Packs - Prominent Section */}
        {activePacks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-3">
            <div className="glass rounded-lg p-4 border-2" style={{ borderColor: 'var(--color-accent)', background: 'rgba(167, 139, 250, 0.03)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Package size={24} style={{ color: 'var(--color-accent)' }} />
                <div>
                  <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-text)' }}>Active Quest Packs</h2>
                  <p className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>{activePacks.length} program{activePacks.length > 1 ? 's' : ''} in progress</p>
                </div>
              </div>
              {activePacks.map((packId, index) => {
                const pack = questPacks.find(p => p.id === packId);
                if (!pack) return null;

                // Get quests for this specific pack
                const thisPackQuests = packQuests.filter(quest =>
                  pack.quests.some(pq => pq.templateId === quest.templateId)
                );

                return (
                  <div key={packId} className={index > 0 ? 'mt-4 pt-4 border-t' : ''} style={{ borderColor: 'var(--color-border)' }}>
                    {/* Pack Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-2xl">{pack.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>{pack.title}</h3>
                          <Link to="/app/packs" className="text-xs font-mono transition-opacity hover:opacity-70" style={{ color: 'var(--color-accent)' }}>
                            View Pack →
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                          <span className="px-1.5 py-0.5 rounded capitalize text-xs" style={{ backgroundColor: 'var(--color-border)' }}>{pack.difficulty}</span>
                          <span>•</span>
                          <span>{pack.durationDays}d program</span>
                          <span>•</span>
                          <span>{thisPackQuests.length} quests</span>
                        </div>
                      </div>
                    </div>

                    {/* Pack Quests Grid */}
                    {thisPackQuests.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-3">
                        {thisPackQuests.map((quest, qIndex) => (
                          <motion.div
                            key={quest.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * qIndex }}
                          >
                            <Link
                              to={`/app/quests/${quest.id}`}
                              className="block glass rounded-lg p-3 border hover:scale-[1.02] transition-all relative"
                              style={{ borderColor: 'var(--color-accent)', backgroundColor: 'rgba(167, 139, 250, 0.05)' }}
                            >
                              {/* Small pack badge */}
                              <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: 'rgba(167, 139, 250, 0.3)', color: 'white' }}>
                                <Package size={8} />
                              </div>

                              <div className="flex items-start justify-between" style={{ marginTop: '20px' }}>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm mb-1.5" style={{ color: 'var(--color-text)' }}>{quest.title}</h4>
                                  <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                                    <span className="px-1.5 py-0.5 rounded text-xs capitalize" style={{ backgroundColor: 'var(--color-border)' }}>{quest.difficulty}</span>
                                    <span>{quest.durationMinutes}min</span>
                                    <span style={{ color: 'var(--color-accent)' }} className="font-bold">{quest.baseXP} XP</span>
                                  </div>
                                </div>
                                <div style={{ color: 'var(--color-accent)' }}>
                                  {getCategoryIcon(quest.category)}
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-secondary)' }}>
                        No quests from this pack available today
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Today's Quests */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Today's Quests</h2>
            <Link to="/app/quests" className="text-sm font-mono transition-opacity hover:opacity-70 flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
              View All
              <span>→</span>
            </Link>
          </div>

          {regularQuests.length === 0 ? (
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
              {regularQuests.map((quest, index) => (
                <motion.div key={quest.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }}>
                  <Link
                    to={`/app/quests/${quest.id}`}
                    className="block glass rounded-lg p-4 border hover:scale-[1.02] transition-all relative"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--color-text)' }}>{quest.title}</h3>
                        <div className="flex items-center gap-2.5 text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium capitalize" style={{ backgroundColor: 'var(--color-border)' }}>{quest.difficulty}</span>
                          <span>{quest.durationMinutes}min</span>
                          <span style={{ color: 'var(--color-accent)' }} className="font-bold">{quest.baseXP} XP</span>
                        </div>
                      </div>
                      <div style={{ color: 'var(--color-accent)' }}>
                        {getCategoryIcon(quest.category)}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
