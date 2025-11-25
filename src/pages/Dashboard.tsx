import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useState, useEffect, useRef } from 'react';
import { Zap, Trophy, Calendar, Filter, Package, Menu, X, Shield, Dumbbell, Sparkles, Brain, Heart, Users, Mountain, Briefcase, Palette, Check, ChevronDown, Star, Ban } from 'lucide-react';
import { questPacks, categories, questTemplates } from '../data/seed';
import { getRecommendedQuests } from '../lib/recommendations';

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
    'avoidance-detox': <Ban size={20} />,
    'spirituality': <Star size={20} />,
  };
  return iconMap[categoryId] || <Zap size={20} />;
};

// Quick duration tag for "Make it Easy" - highlights low-friction quests
const getQuickDurationTag = (durationMinutes: number): string | null => {
  if (durationMinutes <= 1) return '<1 min';
  if (durationMinutes <= 2) return '<2 min';
  if (durationMinutes <= 5) return '<5 min';
  return null;
};

export default function Dashboard() {
  const { profile, getTodaysQuests, activePacks, completions, onboardingData, userQuests } = useStore();
  const allTodaysQuests = getTodaysQuests();

  // Check today's date for quest filtering
  const today = new Date().toISOString().split('T')[0];

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questFilter, setQuestFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'once'>('all');
  const [showValueProp, setShowValueProp] = useState(!localStorage.getItem('valuePropDismissed'));

  // Mobile UI toggles
  const [showAllQuests, setShowAllQuests] = useState(false);
  const [showCompletedToday, setShowCompletedToday] = useState(false);

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

  // Find "Next Quest" - easiest, shortest quest that hasn't been completed today
  const todayCompletedQuestIds = new Set(
    completions
      .filter(c => c.at.split('T')[0] === today)
      .map(c => c.userQuestId)
  );
  const incompleteQuests = todaysQuests.filter(quest => !todayCompletedQuestIds.has(quest.id));

  const difficultyOrder = { easy: 1, medium: 2, hard: 3, elite: 4, legendary: 5 };
  const nextQuest = [...incompleteQuests].sort((a, b) => {
    // Sort by difficulty first (easiest first)
    const diffA = difficultyOrder[a.difficulty];
    const diffB = difficultyOrder[b.difficulty];
    if (diffA !== diffB) return diffA - diffB;
    // Then by duration (shortest first)
    if (a.durationMinutes !== b.durationMinutes) return a.durationMinutes - b.durationMinutes;
    // Finally by XP (highest as tiebreaker)
    return b.baseXP - a.baseXP;
  })[0];

  // Get recommended quests for the user
  const recommendedQuests = getRecommendedQuests(
    questTemplates,
    completions,
    profile,
    onboardingData || undefined,
    6 // Show 6 recommendations
  );

  // Filter active user quests
  const activeQuests = userQuests.filter(q => q.active);
  const filteredQuests = questFilter === 'all'
    ? activeQuests
    : activeQuests.filter(q => q.schedule?.type === questFilter);

  // Get completed quests today
  const completedTodayData = todaysQuests
    .filter(quest => todayCompletedQuestIds.has(quest.id))
    .map(quest => {
      const completion = completions.find(
        c => c.userQuestId === quest.id && c.at.split('T')[0] === today
      );
      return {
        ...quest,
        completedAt: completion?.at,
        xpEarned: completion?.xp || quest.baseXP,
      };
    })
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()); // Most recent first

  // Split quests into pack quests and regular quests
  // Filter out the Next Quest from both lists to avoid duplication
  const packQuests = todaysQuests.filter(quest =>
    quest.id !== nextQuest?.id &&
    activePacks.some(packId =>
      questPacks.find(p => p.id === packId)?.quests
        .some(pq => pq.templateId === quest.templateId)
    )
  );
  const regularQuests = todaysQuests.filter(quest =>
    quest.id !== nextQuest?.id && !packQuests.includes(quest)
  );

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
            <Link to="/app/stats" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Stats</Link>
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
      <main className="max-w-7xl mx-auto px-6 py-4">
        {/* Page Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                Welcome back, {profile.nickname.split(' ')[0]}
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
                    <Link to="/app/stats" className="block px-4 py-2 rounded hover:bg-white/5 transition-colors text-sm" style={{ color: 'var(--color-text)' }}>View Stats</Link>
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

        {/* Value Prop Banner */}
        {showValueProp && completions.length < 10 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 relative">
            <div className="glass rounded-lg p-4 border-2" style={{ borderColor: 'var(--color-accent)', background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(6, 182, 212, 0.1))' }}>
              <button
                onClick={() => {
                  setShowValueProp(false);
                  localStorage.setItem('valuePropDismissed', 'true');
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={14} />
              </button>
              <div className="flex items-start gap-3">
                <Zap size={24} style={{ color: 'var(--color-accent)' }} className="flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-display font-bold text-lg mb-1" style={{ color: 'var(--color-text)' }}>
                    Level Up Your Real Life
                  </h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    IRLXP turns your life into a game. Complete quests → Earn XP → Level Up → Get Stronger 💪
                  </p>
                  <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--color-accent)' }}>
                    <span>Level {profile.level}</span>
                    <span>•</span>
                    <span>{profile.totalXP.toLocaleString()} XP</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* My Quests Section */}
        {activeQuests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="mb-3">
            <div className="glass rounded-lg p-4 border" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--color-text)' }}>My Quests</h2>
                <div className="flex gap-1">
                  {(['all', 'daily', 'weekly', 'monthly', 'once'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setQuestFilter(filter)}
                      className="px-2 py-1 rounded text-xs font-mono transition-all hover:scale-105"
                      style={{
                        background: questFilter === filter ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.05)',
                        color: questFilter === filter ? 'white' : 'var(--color-text-secondary)',
                      }}
                    >
                      {filter.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {filteredQuests.slice(0, 6).map((quest, index) => (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <Link
                      to={`/app/quests/${quest.id}`}
                      className="block glass rounded-lg p-3 border hover:scale-[1.02] transition-all"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm line-clamp-2 flex-1 pr-2" style={{ color: 'var(--color-text)' }}>
                          {quest.title}
                        </h4>
                        <div style={{ color: 'var(--color-accent)' }}>
                          {getCategoryIcon(quest.category)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                        <span className="px-1.5 py-0.5 rounded text-xs capitalize" style={{ backgroundColor: 'var(--color-border)' }}>
                          {quest.difficulty}
                        </span>
                        <span>{quest.durationMinutes}min</span>
                        <span style={{ color: 'var(--color-accent)' }} className="font-bold">{quest.baseXP} XP</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              {filteredQuests.length > 6 && (
                <div className="mt-3 text-center">
                  <Link to="/app/quests" className="text-xs font-mono transition-opacity hover:opacity-70" style={{ color: 'var(--color-accent)' }}>
                    View All {filteredQuests.length} Quests →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Next Quest Tile - Full width on mobile, first in row on desktop */}
        {nextQuest ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-3">
            <Link
              to={`/app/quests/${nextQuest.id}`}
              className="block glass rounded-lg p-4 border-2 hover:scale-[1.01] transition-all"
              style={{ borderColor: 'var(--color-accent)', background: 'rgba(167, 139, 250, 0.05)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-mono font-medium mb-2" style={{ color: 'var(--color-accent)' }}>NEXT QUEST</p>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--color-text)' }}>{nextQuest.title}</h3>
                  <div className="flex items-center gap-2.5 text-sm font-mono mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="px-2 py-1 rounded text-xs font-medium capitalize" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>{nextQuest.difficulty}</span>
                    <span>{nextQuest.durationMinutes}min</span>
                    <span style={{ color: 'var(--color-accent)' }} className="font-bold">{nextQuest.baseXP} XP</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                    <Zap size={16} fill="currentColor" />
                    Start Quest
                  </div>
                </div>
                <div style={{ color: 'var(--color-accent)' }}>
                  {getCategoryIcon(nextQuest.category)}
                </div>
              </div>
            </Link>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-3">
            <div className="glass rounded-lg p-4 border text-center" style={{ borderColor: 'var(--color-border)' }}>
              <Trophy size={28} className="mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>You're caught up for today! 🎉</p>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>All quests complete or no quests added yet</p>
              <Link to="/app/quests" className="inline-block px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                Browse Quests
              </Link>
            </div>
          </motion.div>
        )}

        {/* Recommended for You Section */}
        {recommendedQuests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-3">
            <div className="glass rounded-lg p-4 border" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} style={{ color: 'var(--color-accent)' }} />
                  <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                    Recommended for You
                  </h2>
                </div>
                <Link to="/app/quests" className="text-xs font-mono transition-opacity hover:opacity-70" style={{ color: 'var(--color-accent)' }}>
                  Browse All →
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                {recommendedQuests.slice(0, 6).map((quest, index) => (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <Link
                      to={`/app/quests/${quest.id}`}
                      className="block glass rounded-lg p-3 border hover:scale-[1.02] transition-all"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm line-clamp-2 flex-1 pr-2" style={{ color: 'var(--color-text)' }}>
                          {quest.title}
                        </h4>
                        <div style={{ color: 'var(--color-accent)' }}>
                          {getCategoryIcon(quest.category)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                        <span className="px-1.5 py-0.5 rounded text-xs capitalize" style={{ backgroundColor: 'var(--color-border)' }}>
                          {quest.difficulty}
                        </span>
                        {getQuickDurationTag(quest.durationMinutes) && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-success)' }}>
                            {getQuickDurationTag(quest.durationMinutes)}
                          </span>
                        )}
                        <span>{quest.durationMinutes}min</span>
                        <span style={{ color: 'var(--color-accent)' }} className="font-bold">{quest.baseXP} XP</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Completed Today Section */}
        {completedTodayData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-3">
            <div className="glass rounded-lg p-4 border" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => setShowCompletedToday(!showCompletedToday)}
                className="w-full flex items-center justify-between mb-3 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-success)' }}>
                    <Check size={16} color="white" strokeWidth={3} />
                  </div>
                  <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                    Completed Today ({completedTodayData.length})
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold" style={{ color: 'var(--color-success)' }}>
                    +{completedTodayData.reduce((sum, q) => sum + q.xpEarned, 0)} XP
                  </span>
                  <motion.div
                    animate={{ rotate: showCompletedToday ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={20} style={{ color: 'var(--color-text-secondary)' }} />
                  </motion.div>
                </div>
              </button>

              {showCompletedToday && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  {completedTodayData.map((quest, index) => (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-white/5"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-success)' }}>
                        <Check size={14} color="white" strokeWidth={3} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>
                          {quest.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-mono mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                          <span className="capitalize">{quest.difficulty}</span>
                          <span>•</span>
                          <span>{quest.durationMinutes}min</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-sm font-mono font-bold" style={{ color: 'var(--color-success)' }}>
                        +{quest.xpEarned} XP
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

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
                                    {getQuickDurationTag(quest.durationMinutes) && (
                                      <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-success)' }}>
                                        {getQuickDurationTag(quest.durationMinutes)}
                                      </span>
                                    )}
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
            <>
              {/* Mobile: Conditional rendering based on toggle */}
              <div className="md:hidden grid gap-3" data-tutorial="quest-cards">
                {(showAllQuests ? regularQuests : regularQuests.slice(0, 3)).map((quest, index) => (
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
                            {getQuickDurationTag(quest.durationMinutes) && (
                              <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-success)' }}>
                                {getQuickDurationTag(quest.durationMinutes)}
                              </span>
                            )}
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

              {/* Desktop: Always show all quests */}
              <div className="hidden md:grid md:grid-cols-2 gap-3" data-tutorial="quest-cards">
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
                            {getQuickDurationTag(quest.durationMinutes) && (
                              <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-success)' }}>
                                {getQuickDurationTag(quest.durationMinutes)}
                              </span>
                            )}
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

              {/* Show More/Less Button (Mobile Only, when more than 3 quests) */}
              {regularQuests.length > 3 && (
                <div className="md:hidden mt-3">
                  <button
                    onClick={() => setShowAllQuests(!showAllQuests)}
                    className="w-full py-2 px-4 rounded-lg text-xs font-mono font-medium transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-text-secondary)' }}
                  >
                    {showAllQuests ? 'Show less' : `View all ${regularQuests.length} quests`}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
