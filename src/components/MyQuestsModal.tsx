import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Zap, Dumbbell, Sparkles, Brain, Heart, Users, Mountain, Briefcase, Palette, Shield, Ban, Star } from 'lucide-react';
import type { UserQuest } from '../types';

interface MyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: UserQuest[];
  completedTodayIds: Set<string>;
}

// Category icon mapping
const getCategoryIcon = (categoryId: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'fitness': <Dumbbell size={18} />,
    'body-wellness': <Sparkles size={18} />,
    'athletics-skill': <Zap size={18} />,
    'intelligence': <Brain size={18} />,
    'discipline': <Shield size={18} />,
    'mental': <Heart size={18} />,
    'social-leadership': <Users size={18} />,
    'adventure-outdoors': <Mountain size={18} />,
    'finance-career': <Briefcase size={18} />,
    'creativity': <Palette size={18} />,
    'avoidance-detox': <Ban size={18} />,
    'spirituality': <Star size={18} />,
  };
  return iconMap[categoryId] || <Zap size={18} />;
};

export default function MyQuestsModal({ isOpen, onClose, quests, completedTodayIds }: MyQuestsModalProps) {
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'once'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');

  // Filter quests by status
  const statusFilteredQuests = statusFilter === 'all'
    ? quests
    : quests.filter(q => statusFilter === 'active' ? q.active : !q.active);

  // Filter quests by schedule type
  const filteredQuests = filter === 'all'
    ? statusFilteredQuests
    : statusFilteredQuests.filter(q => q.schedule?.type === filter);

  // Count by status
  const activeCount = quests.filter(q => q.active).length;
  const inactiveCount = quests.filter(q => !q.active).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-xl border w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                  My Quests
                </h2>
                <p className="text-xs font-mono mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {filteredQuests.length} quest{filteredQuests.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filters */}
            <div className="p-4 border-b space-y-3" style={{ borderColor: 'var(--color-border)' }}>
              {/* Status filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('active')}
                  className="px-3 py-1.5 rounded text-xs font-mono transition-all"
                  style={{
                    background: statusFilter === 'active' ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: statusFilter === 'active' ? 'white' : 'var(--color-text-secondary)',
                  }}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setStatusFilter('inactive')}
                  className="px-3 py-1.5 rounded text-xs font-mono transition-all"
                  style={{
                    background: statusFilter === 'inactive' ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: statusFilter === 'inactive' ? 'white' : 'var(--color-text-secondary)',
                  }}
                >
                  Inactive ({inactiveCount})
                </button>
                <button
                  onClick={() => setStatusFilter('all')}
                  className="px-3 py-1.5 rounded text-xs font-mono transition-all"
                  style={{
                    background: statusFilter === 'all' ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: statusFilter === 'all' ? 'white' : 'var(--color-text-secondary)',
                  }}
                >
                  All ({quests.length})
                </button>
              </div>

              {/* Schedule filter */}
              <div className="flex gap-1 flex-wrap">
                {(['all', 'daily', 'weekly', 'monthly', 'once'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="px-2 py-1 rounded text-xs font-mono transition-all"
                    style={{
                      background: filter === f ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      color: filter === f ? 'var(--color-text)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Quest List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredQuests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    No quests found with current filters
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredQuests.map((quest) => {
                    const isCompletedToday = completedTodayIds.has(quest.id);
                    return (
                      <Link
                        key={quest.id}
                        to={`/app/quests/${quest.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all group"
                        style={{
                          opacity: !quest.active ? 0.5 : 1,
                          backgroundColor: isCompletedToday ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div style={{ color: isCompletedToday ? 'var(--color-success)' : 'var(--color-accent)' }} className="flex-shrink-0">
                            {getCategoryIcon(quest.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                                {quest.title}
                              </h4>
                              {isCompletedToday && (
                                <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                                  ✓
                                </span>
                              )}
                              {!quest.active && (
                                <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--color-text-secondary)' }}>
                                  Paused
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                              <span className="capitalize">{quest.schedule?.type || 'once'}</span>
                              {quest.custom && <span>• Custom</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="px-2 py-0.5 rounded text-xs font-medium capitalize" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--color-text-secondary)' }}>
                            {quest.difficulty}
                          </span>
                          <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                            {quest.durationMinutes}min
                          </span>
                          <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-accent)' }}>
                            {quest.baseXP} XP
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
              <Link
                to="/app/quests"
                onClick={onClose}
                className="text-xs font-mono transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-accent)' }}
              >
                Browse Quest Library →
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
