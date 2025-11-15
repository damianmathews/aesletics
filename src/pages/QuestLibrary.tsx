import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { questTemplatesExtended, categories } from '../data/seed';
import { useStore } from '../store/useStore';
import Toast from '../components/Toast';
import { Zap } from 'lucide-react';

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
          <Link to="/" className="font-display text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <span className="text-3xl">Æ</span>
            <span>Aesletics</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/app" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Dashboard</Link>
            <Link to="/app/quests" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text)' }}>Quests</Link>
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
          <h1 className="font-display text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Quest Library</h1>
          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>Browse 150+ quests across all categories</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <input
            type="text"
            placeholder="Search quests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 rounded-button glass border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </motion.div>

        {/* Category Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${!selectedCategory ? 'shadow-lg' : ''}`}
            style={{
              background: !selectedCategory ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.05)',
              color: !selectedCategory ? 'white' : 'var(--color-text)',
            }}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${selectedCategory === category.id ? 'shadow-lg' : ''}`}
              style={{
                background: selectedCategory === category.id ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === category.id ? 'white' : 'var(--color-text)',
              }}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Quest Count */}
        <div className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Showing {filteredQuests.length} quest{filteredQuests.length !== 1 ? 's' : ''}
        </div>

        {/* Quest Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map((quest, index) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (index % 12) }}
              className="glass rounded-card p-6 border hover:scale-[1.02] transition-all"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-medium px-2 py-1 rounded capitalize" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    {quest.difficulty}
                  </span>
                </div>
                <Zap size={28} style={{ color: 'var(--color-accent)' }} />
              </div>

              <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{quest.title}</h3>
              <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                {quest.description}
              </p>

              <div className="flex items-center justify-between text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                <span>{quest.durationMinutes}min</span>
                <span>·</span>
                <span className="capitalize">{quest.proof}</span>
                <span>·</span>
                <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>{quest.baseXP} XP</span>
              </div>

              <button
                onClick={() => handleAddQuest(quest.id)}
                className="w-full py-3 rounded-button font-semibold transition-all hover:scale-105 hover:shadow-lg"
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
