import { Link } from 'react-router-dom';
import { useState } from 'react';
import { questTemplatesExtended, categories } from '../data/seed';
import { useStore } from '../store/useStore';

export default function QuestLibrary() {
  const { addUserQuest } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    alert(`Added "${template.title}" to your quests!`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/app" className="font-display text-2xl font-bold">Æ</Link>
          <div className="flex items-center gap-4">
            <Link to="/app" className="text-sm font-medium hover:opacity-70">Dashboard</Link>
            <Link to="/app/settings" className="text-sm font-medium hover:opacity-70">Settings</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-4xl font-bold mb-8">Quest Library</h1>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search quests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-button border focus:outline-none focus:ring-2"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: !selectedCategory ? 'var(--color-accent)' : 'var(--color-border)',
              color: !selectedCategory ? 'white' : 'var(--color-text)',
            }}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: selectedCategory === category.id ? 'var(--color-accent)' : 'var(--color-border)',
                color: selectedCategory === category.id ? 'white' : 'var(--color-text)',
              }}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* Quest Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map((quest) => (
            <div
              key={quest.id}
              className="rounded-card p-6 shadow-soft hover:shadow-lift transition-all"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-border)' }}>
                    {quest.difficulty}
                  </span>
                </div>
                <span className="text-2xl">
                  {categories.find(c => c.id === quest.category)?.icon || '⚡'}
                </span>
              </div>

              <h3 className="font-display text-lg font-semibold mb-2">{quest.title}</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                {quest.description}
              </p>

              <div className="flex items-center justify-between text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                <span>{quest.durationMinutes}min</span>
                <span>·</span>
                <span>{quest.proof}</span>
                <span>·</span>
                <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>{quest.baseXP} XP</span>
              </div>

              <button
                onClick={() => handleAddQuest(quest.id)}
                className="w-full py-2 rounded-button font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
              >
                Add Quest
              </button>
            </div>
          ))}
        </div>

        {filteredQuests.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--color-text-secondary)' }}>
            <p>No quests found. Try adjusting your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
