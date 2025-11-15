import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useState } from 'react';
import { questPacks, questTemplatesExtended } from '../data/seed';
import { Flame, Package, Target, Trophy, Zap, Brain, Users, Backpack, Sparkles, Activity, TrendingUp, List, Lock, ChevronDown, ChevronUp } from 'lucide-react';

export default function QuestPacks() {
  const { profile, activePacks, activatePack, deactivatePack } = useStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedPack, setExpandedPack] = useState<string | null>(null);

  // Icon mapping for pack icons (emoji to Lucide)
  const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string; style?: any }>> = {
    '🔥': Flame,
    '⚡': Zap,
    '🧠': Brain,
    '👥': Users,
    '🎒': Backpack,
    '✨': Sparkles,
    '🤸': Activity,
    '🏃': TrendingUp,
  };

  const handleTogglePack = (packId: string) => {
    if (activePacks.includes(packId)) {
      deactivatePack(packId);
    } else {
      activatePack(packId);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#38e28c';
      case 'medium': return '#06B6D4';
      case 'hard': return '#EC4899';
      default: return 'var(--color-text-secondary)';
    }
  };

  return (
    <div className="min-h-screen bg-pattern-grid" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Aesletics" className="h-12 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/app" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Dashboard</Link>
            <Link to="/app/quests" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Quests</Link>
            <Link to="/app/leaderboard" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Leaderboard</Link>
            <Link to="/app/history" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>History</Link>
            <Link to="/app/packs" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text)' }}>Packs</Link>
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
      <main className="max-w-7xl mx-auto px-6 py-6 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)'
        }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mb-5">
          <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Quest Packs</h1>
          <p className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>{questPacks.length} programs • Structured progression</p>
        </motion.div>

        {/* Active Packs */}
        {activePacks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5 relative">
            <h2 className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>ACTIVE PACKS</h2>
            <div className="glass rounded-lg p-4 border" style={{ borderColor: 'var(--color-accent)', backgroundColor: 'rgba(167, 139, 250, 0.05)' }}>
              <div className="flex items-center gap-3">
                <Flame size={24} className="text-orange-500" />
                <div>
                  <div className="font-semibold font-mono text-sm" style={{ color: 'var(--color-text)' }}>
                    {activePacks.length} PACK{activePacks.length > 1 ? 'S' : ''} ACTIVE
                  </div>
                  <div className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                    Keep going! Consistency is everything.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Available Packs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xs font-medium mb-3 font-mono" style={{ color: 'var(--color-text-secondary)' }}>AVAILABLE PROGRAMS</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {questPacks.map((pack, index) => {
              const isActive = activePacks.includes(pack.id);

              return (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.05 }}
                  className={`glass rounded-lg p-4 border transition-all hover:scale-[1.01] ${isActive ? 'ring-2' : ''}`}
                  style={{
                    borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                    ...(isActive && { '--tw-ring-color': 'var(--color-accent)' } as any)
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded" style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)' }}>
                        {(() => {
                          const IconComponent = iconMap[pack.icon] || Package;
                          return <IconComponent size={20} style={{ color: 'var(--color-accent)' }} />;
                        })()}
                      </div>
                      <div>
                        <h3 className="font-display text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                          {pack.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded text-xs font-mono font-medium uppercase" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', color: 'var(--color-text-secondary)' }}>
                            {pack.difficulty}
                          </span>
                          <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                            {pack.durationDays}d
                          </span>
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-0.5 rounded text-xs font-mono font-semibold"
                        style={{ background: 'var(--gradient-primary)', color: 'white' }}
                      >
                        ACTIVE
                      </motion.div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {pack.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {pack.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded text-xs font-mono"
                        style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)', color: 'var(--color-accent)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Quest Count & View Button */}
                  <button
                    onClick={() => setExpandedPack(expandedPack === pack.id ? null : pack.id)}
                    className="w-full flex items-center justify-between mb-3 text-xs p-2 rounded glass border transition-all hover:scale-[1.01] font-mono"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <List size={14} />
                      <span>{pack.quests.length} QUESTS</span>
                    </div>
                    {expandedPack === pack.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Quest List */}
                  <AnimatePresence>
                    {expandedPack === pack.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mb-3"
                      >
                        <div className="max-h-64 overflow-y-auto space-y-1.5 p-2 rounded glass border" style={{ borderColor: 'var(--color-border)' }}>
                          {pack.quests.map((packQuest) => {
                            const questTemplate = questTemplatesExtended.find(q => q.id === packQuest.templateId);
                            if (!questTemplate) return null;

                            return (
                              <div
                                key={packQuest.templateId}
                                className="p-2 rounded border transition-all hover:scale-[1.01]"
                                style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-xs truncate" style={{ color: 'var(--color-text)' }}>
                                      {questTemplate.title}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span
                                        className="px-1 py-0.5 rounded text-xs font-mono font-medium uppercase"
                                        style={{
                                          backgroundColor: `${getDifficultyColor(questTemplate.difficulty)}15`,
                                          color: getDifficultyColor(questTemplate.difficulty)
                                        }}
                                      >
                                        {questTemplate.difficulty}
                                      </span>
                                      <span className="text-xs font-mono tabular-nums font-bold" style={{ color: 'var(--color-accent)' }}>
                                        {questTemplate.baseXP}xp
                                      </span>
                                      {questTemplate.durationMinutes > 0 && (
                                        <span className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                                          • {questTemplate.durationMinutes}m
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Button */}
                  <button
                    onClick={() => handleTogglePack(pack.id)}
                    className={`w-full py-2 rounded font-mono font-semibold text-xs transition-all hover:scale-105 ${isActive ? 'hover:opacity-80' : ''}`}
                    style={{
                      background: isActive ? 'rgba(255, 255, 255, 0.03)' : 'var(--gradient-primary)',
                      color: isActive ? 'var(--color-text)' : 'white'
                    }}
                  >
                    {isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                  </button>

                  {pack.locked && (
                    <div className="mt-3 text-center text-xs flex items-center justify-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      <Lock size={12} /> Unlocks at Level {pack.id === 'pack-002' ? '5' : '10'}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* How Packs Work */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12 glass rounded-card p-8 border" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>How Quest Packs Work</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="mb-2">
                <Package size={40} style={{ color: 'var(--color-accent)' }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Structured Programs</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Each pack contains a carefully sequenced set of quests designed to achieve a specific goal.
              </p>
            </div>
            <div>
              <div className="mb-2">
                <Target size={40} style={{ color: 'var(--color-cyan)' }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Daily Guidance</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Follow the day-by-day plan. Each quest unlocks on its scheduled day to keep you on track.
              </p>
            </div>
            <div>
              <div className="mb-2">
                <Trophy size={40} style={{ color: 'var(--color-magenta)' }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Proven Results</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Complete the pack to earn bonus XP and unlock exclusive badges for your achievements.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
          <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Want to create your own quest? Build custom challenges tailored to your goals.
          </p>
          <Link
            to="/app/quests"
            className="inline-block px-6 py-3 rounded-button font-semibold transition-all hover:scale-105"
            style={{ background: 'var(--gradient-primary)', color: 'white' }}
          >
            Browse All Quests
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
