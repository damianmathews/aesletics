import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useState } from 'react';
import { questPacks } from '../data/seed';
import { Flame, Package, Target, Trophy } from 'lucide-react';

export default function QuestPacks() {
  const { profile, activePacks, activatePack, deactivatePack } = useStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleTogglePack = (packId: string) => {
    if (activePacks.includes(packId)) {
      deactivatePack(packId);
    } else {
      activatePack(packId);
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
      <main className="max-w-7xl mx-auto px-6 py-8 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)'
        }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <h1 className="font-display text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Quest Packs</h1>
          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>Structured programs to accelerate your progress</p>
        </motion.div>

        {/* Active Packs */}
        {activePacks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 relative">
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Active Packs</h2>
            <div className="glass rounded-card p-6 border" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <Flame size={32} className="text-orange-500" />
                <div>
                  <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
                    {activePacks.length} pack{activePacks.length > 1 ? 's' : ''} active
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Keep going! Consistency is everything.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Available Packs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: 'var(--color-text)' }}>Available Programs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {questPacks.map((pack, index) => {
              const isActive = activePacks.includes(pack.id);

              return (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className={`glass rounded-card p-6 border transition-all hover:scale-[1.02] ${isActive ? 'ring-2' : ''}`}
                  style={{
                    borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                    ...(isActive && { '--tw-ring-color': 'var(--color-accent)' } as any)
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{pack.icon}</span>
                      <div>
                        <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                          {pack.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded text-xs font-medium capitalize" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                            {pack.difficulty}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {pack.durationDays} days
                          </span>
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{ background: 'var(--gradient-primary)', color: 'white' }}
                      >
                        Active
                      </motion.div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    {pack.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pack.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded text-xs"
                        style={{ backgroundColor: 'rgba(56, 226, 140, 0.1)', color: 'var(--color-accent)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Quest Count */}
                  <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span>📋</span>
                    <span>{pack.quests.length} quests included</span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleTogglePack(pack.id)}
                    className={`w-full py-3 rounded-button font-semibold transition-all hover:scale-105 ${isActive ? 'hover:opacity-80' : ''}`}
                    style={{
                      background: isActive ? 'var(--color-border)' : 'var(--gradient-primary)',
                      color: isActive ? 'var(--color-text)' : 'white'
                    }}
                  >
                    {isActive ? 'Deactivate Pack' : 'Activate Pack'}
                  </button>

                  {pack.locked && (
                    <div className="mt-3 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      🔒 Unlocks at Level {pack.id === 'pack-002' ? '5' : '10'}
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
