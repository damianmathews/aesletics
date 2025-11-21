import { Link, useSearchParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { questTemplatesExtended, categories } from '../data/seed';
import { useStore } from '../store/useStore';
import Toast from '../components/Toast';
import PaywallBanner from '../components/PaywallBanner';
import PaywallModal from '../components/PaywallModal';
import { Menu, X, Dumbbell, Zap, Sparkles, Brain, Shield, Heart, Users, Mountain, Briefcase, Palette, Plus, Check, ChevronDown } from 'lucide-react';

const getCategoryIcon = (categoryId: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'fitness': <Dumbbell size={14} />,
    'body-wellness': <Sparkles size={14} />,
    'athletics-skill': <Zap size={14} />,
    'intelligence': <Brain size={14} />,
    'discipline': <Shield size={14} />,
    'mental': <Heart size={14} />,
    'social-leadership': <Users size={14} />,
    'adventure-outdoors': <Mountain size={14} />,
    'finance-career': <Briefcase size={14} />,
    'creativity': <Palette size={14} />,
    'avoidance-detox': <X size={14} />,
  };
  return iconMap[categoryId] || null;
};

// Quick duration tag for "Make it Easy" - highlights low-friction quests
const getQuickDurationTag = (durationMinutes: number): string | null => {
  if (durationMinutes <= 1) return '<1 min';
  if (durationMinutes <= 2) return '<2 min';
  if (durationMinutes <= 5) return '<5 min';
  return null;
};

export default function QuestLibrary() {
  const { profile, addUserQuest } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'none' | 'xp-low' | 'xp-high' | 'difficulty-low' | 'difficulty-high'>('none');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', subtitle: '' });
  const [addedQuests, setAddedQuests] = useState<Set<string>>(new Set());
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Check if user was blocked from accessing premium features
  useEffect(() => {
    if (searchParams.get('blocked') === 'true') {
      setShowPaywall(true);
      searchParams.delete('blocked');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get display label for current sort
  const getSortLabel = () => {
    switch (sortBy) {
      case 'xp-low': return 'XP: Low → High';
      case 'xp-high': return 'XP: High → Low';
      case 'difficulty-low': return 'Difficulty: Easy → Hard';
      case 'difficulty-high': return 'Difficulty: Hard → Easy';
      default: return 'Default';
    }
  };

  let filteredQuests = questTemplatesExtended.filter((quest) => {
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || quest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Apply sorting
  const difficultyOrder: Record<string, number> = { easy: 1, medium: 2, hard: 3, extreme: 4 };

  if (sortBy === 'xp-low') {
    filteredQuests = [...filteredQuests].sort((a, b) => a.baseXP - b.baseXP);
  } else if (sortBy === 'xp-high') {
    filteredQuests = [...filteredQuests].sort((a, b) => b.baseXP - a.baseXP);
  } else if (sortBy === 'difficulty-low') {
    filteredQuests = [...filteredQuests].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
  } else if (sortBy === 'difficulty-high') {
    filteredQuests = [...filteredQuests].sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]);
  }

  const handleAddQuest = (templateId: string) => {
    const template = questTemplatesExtended.find(q => q.id === templateId);
    if (!template) return;

    const newQuest = {
      id: `uq-${Date.now()}-${Math.random()}`,
      templateId: template.id,
      custom: false,
      title: template.title,
      category: template.category,
      difficulty: template.difficulty,
      description: template.description,
      durationMinutes: template.durationMinutes,
      proof: template.proof,
      baseXP: template.baseXP,
      schedule: {
        type: template.recurrence,
        // For weekly quests, default to all days so they always show
        ...(template.recurrence === 'weekly' && { daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }),
      },
      equipment: template.equipment,
      tags: template.tags,
      safety: template.safety,
      active: true,
      createdAt: new Date().toISOString(),
    };

    addUserQuest(newQuest);

    // Show checkmark animation
    setAddedQuests(prev => new Set(prev).add(templateId));
    setTimeout(() => {
      setAddedQuests(prev => {
        const next = new Set(prev);
        next.delete(templateId);
        return next;
      });
    }, 1500);

    // Show satisfying confirmation with benefit-focused messaging
    setToastMessage({
      title: 'Quest added to your path',
      subtitle: `Start building momentum with ${template.title}`
    });
    setShowToast(true);
  };

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
            <Link to="/app/quests" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text)' }}>Quests</Link>
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
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Quest Library</h1>
          <p className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>{questTemplatesExtended.length} quests • {categories.length} categories</p>
        </motion.div>

        {/* Paywall Banner */}
        <PaywallBanner />

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-4">
          <input
            type="text"
            placeholder="Search quests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg glass border focus:outline-none focus:ring-2 transition-all text-sm"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </motion.div>

        {/* Sort Dropdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="mb-4">
          <p className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>SORT BY</p>
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="px-4 py-2.5 rounded-lg glass border transition-all hover:scale-[1.02] flex items-center gap-2 min-w-[200px] justify-between"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <span className="text-xs font-mono font-medium">{getSortLabel()}</span>
              <ChevronDown size={16} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showSortDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 mt-2 w-full glass rounded-lg p-2 border z-10"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <button
                  onClick={() => { setSortBy('none'); setShowSortDropdown(false); }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/5 transition-colors text-xs font-mono font-medium"
                  style={{ color: sortBy === 'none' ? 'var(--color-accent)' : 'var(--color-text)' }}
                >
                  Default
                </button>
                <button
                  onClick={() => { setSortBy('xp-low'); setShowSortDropdown(false); }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/5 transition-colors text-xs font-mono font-medium"
                  style={{ color: sortBy === 'xp-low' ? 'var(--color-accent)' : 'var(--color-text)' }}
                >
                  XP: Low → High
                </button>
                <button
                  onClick={() => { setSortBy('xp-high'); setShowSortDropdown(false); }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/5 transition-colors text-xs font-mono font-medium"
                  style={{ color: sortBy === 'xp-high' ? 'var(--color-accent)' : 'var(--color-text)' }}
                >
                  XP: High → Low
                </button>
                <button
                  onClick={() => { setSortBy('difficulty-low'); setShowSortDropdown(false); }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/5 transition-colors text-xs font-mono font-medium"
                  style={{ color: sortBy === 'difficulty-low' ? 'var(--color-accent)' : 'var(--color-text)' }}
                >
                  Difficulty: Easy → Hard
                </button>
                <button
                  onClick={() => { setSortBy('difficulty-high'); setShowSortDropdown(false); }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/5 transition-colors text-xs font-mono font-medium"
                  style={{ color: sortBy === 'difficulty-high' ? 'var(--color-accent)' : 'var(--color-text)' }}
                >
                  Difficulty: Hard → Easy
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-5">
          <p className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>FILTER BY CATEGORY</p>
          <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all hover:scale-105 flex items-center gap-1.5 ${!selectedCategory ? 'shadow-lg' : ''}`}
              style={{
                background: !selectedCategory ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.03)',
                color: !selectedCategory ? 'white' : 'var(--color-text)',
              }}
            >
              ALL
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all hover:scale-105 flex items-center gap-1.5 ${selectedCategory === category.id ? 'shadow-lg' : ''}`}
                style={{
                  background: selectedCategory === category.id ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.03)',
                  color: selectedCategory === category.id ? 'white' : 'var(--color-text)',
                }}
              >
                {getCategoryIcon(category.id)}
                {category.name.toUpperCase()}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Quest Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" data-tutorial="quest-grid">
          {filteredQuests.map((quest, index) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.02 * (index % 12) }}
              className="glass rounded-lg p-4 border hover:scale-[1.01] transition-all relative"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium font-mono px-2 py-0.5 rounded uppercase" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', color: 'var(--color-text-secondary)' }}>
                  {quest.difficulty}
                </span>
                <span className="text-xs font-mono font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>{quest.baseXP} XP</span>
              </div>

              <h3 className="font-display text-base font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>{quest.title}</h3>
              <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                {quest.description}
              </p>

              <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                {getQuickDurationTag(quest.durationMinutes) && (
                  <>
                    <span className="px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-success)' }}>
                      {getQuickDurationTag(quest.durationMinutes)}
                    </span>
                    <span>•</span>
                  </>
                )}
                <span>{quest.durationMinutes}m</span>
                <span>•</span>
                <span className="uppercase">{quest.proof}</span>
              </div>

              <button
                onClick={() => handleAddQuest(quest.id)}
                disabled={addedQuests.has(quest.id)}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 disabled:cursor-default"
                style={{ background: 'var(--gradient-primary)', color: 'white' }}
              >
                <AnimatePresence mode="wait">
                  {addedQuests.has(quest.id) ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.3, type: "spring" }}
                    >
                      <Check size={18} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="plus"
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -180 }}
                      transition={{ duration: 0.3, type: "spring" }}
                    >
                      <Plus size={18} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>

        {filteredQuests.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20" style={{ color: 'var(--color-text-secondary)' }}>
            <p className="text-lg mb-4">No quests found matching your search</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
              }}
              className="px-6 py-3 rounded-button font-semibold transition-all hover:scale-105"
              style={{ background: 'var(--gradient-primary)', color: 'white' }}
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </main>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage.title}
          subMessage={toastMessage.subtitle}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="Pro Features"
      />
    </div>
  );
}
