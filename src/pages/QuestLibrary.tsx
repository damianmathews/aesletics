import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { questTemplatesExtended, categories } from '../data/seed';
import { useStore } from '../store/useStore';
import Toast from '../components/Toast';

export default function QuestLibrary() {
  const { profile, addUserQuest } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', subtitle: '' });

  const filteredQuests = questTemplatesExtended.filter((quest) => {
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || quest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      schedule: { type: template.recurrence },
      equipment: template.equipment,
      tags: template.tags,
      safety: template.safety,
      active: true,
      createdAt: new Date().toISOString(),
    };

    addUserQuest(newQuest);

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
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Aesletics" className="h-12 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/app" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Dashboard</Link>
            <Link to="/app/quests" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text)' }}>Quests</Link>
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
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Quest Library</h1>
          <p className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>{questTemplatesExtended.length} quests • 12 categories</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-medium mb-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>TOTAL QUESTS</p>
            <h3 className="text-xl font-bold tabular-nums font-mono" style={{ color: 'var(--color-text)' }}>{questTemplatesExtended.length}</h3>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-medium mb-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>CATEGORIES</p>
            <h3 className="text-xl font-bold tabular-nums font-mono" style={{ color: 'var(--color-text)' }}>{categories.length}</h3>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-medium mb-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>AVG XP</p>
            <h3 className="text-xl font-bold tabular-nums font-mono" style={{ color: 'var(--color-text)' }}>{Math.round(questTemplatesExtended.reduce((sum, q) => sum + q.baseXP, 0) / questTemplatesExtended.length)}</h3>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-medium mb-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>FILTERED</p>
            <h3 className="text-xl font-bold tabular-nums font-mono" style={{ color: 'var(--color-text)' }}>{filteredQuests.length}</h3>
          </motion.div>
        </div>

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

        {/* Category Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-5">
          <p className="text-xs font-medium mb-2 font-mono" style={{ color: 'var(--color-text-secondary)' }}>FILTER BY CATEGORY</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all hover:scale-105 ${!selectedCategory ? 'shadow-lg' : ''}`}
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
                className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all hover:scale-105 ${selectedCategory === category.id ? 'shadow-lg' : ''}`}
                style={{
                  background: selectedCategory === category.id ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.03)',
                  color: selectedCategory === category.id ? 'white' : 'var(--color-text)',
                }}
              >
                {category.name.toUpperCase()}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Quest Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuests.map((quest, index) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.02 * (index % 12) }}
              className="glass rounded-lg p-4 border hover:scale-[1.01] transition-all"
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

              <div className="flex items-center gap-2 text-xs mb-3 font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                <span>{quest.durationMinutes}m</span>
                <span>•</span>
                <span className="uppercase">{quest.proof}</span>
              </div>

              <button
                onClick={() => handleAddQuest(quest.id)}
                className="w-full py-2 rounded font-semibold text-xs transition-all hover:scale-105"
                style={{ background: 'var(--gradient-primary)', color: 'white' }}
              >
                Add to Queue
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
    </div>
  );
}
