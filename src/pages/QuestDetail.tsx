import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useSubscription } from '../hooks/useSubscription';
import { calculateXP } from '../lib/xp';
import { Clock, Camera, AlertTriangle, Check, Flame, X, Award, TrendingUp, Trash2 } from 'lucide-react';
import PaywallModal from '../components/PaywallModal';
import QuestConfirmDialog from '../components/QuestConfirmDialog';
import { questTemplates } from '../data/seed';

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, getQuestById, addCompletion, addUserQuest, removeUserQuest } = useStore();
  const { hasAccess } = useSubscription();

  // Try to find as user quest first, then as template
  let quest = getQuestById(id!);
  let isTemplate = false;
  let questData: any = quest;

  if (!quest) {
    const template = questTemplates.find(t => t.id === id);
    if (template) {
      questData = template;
      isTemplate = true;
    }
  } else {
    questData = quest;
  }

  const [showPaywall, setShowPaywall] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [textValue, setTextValue] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Bug #12 fix: Use ref for timer interval to prevent memory leak
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []);

  if (!questData) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center glass rounded-card p-12 border"
            style={{ borderColor: 'var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xl mb-4" style={{ color: 'var(--color-text)' }}>Quest not found</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-block px-6 py-3 rounded-button font-semibold transition-all hover:scale-105"
              style={{ background: 'var(--gradient-primary)', color: 'white' }}
            >
              Go Back
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  const handleComplete = () => {
    // Check if user has subscription access
    if (!hasAccess) {
      setShowPaywall(true);
      return;
    }

    // If it's a template, auto-add it to user quests first
    if (isTemplate) {
      const userQuest = {
        id: `uq-${Date.now()}-${Math.random()}`,
        templateId: questData.id,
        custom: false,
        title: questData.title,
        category: questData.category,
        difficulty: questData.difficulty,
        description: questData.description,
        durationMinutes: questData.durationMinutes,
        proof: questData.proof,
        baseXP: questData.baseXP,
        schedule: {
          type: questData.recurrence,
        },
        equipment: questData.equipment || [],
        tags: questData.tags || [],
        safety: questData.safety,
        active: true,
        createdAt: new Date().toISOString(),
      };
      addUserQuest(userQuest);
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const confirmCompletion = () => {
    const xp = calculateXP(questData.baseXP, questData.proof, profile.currentStreak);

    // Bug #14 fix: Use user quest ID if available, otherwise use template ID
    // quest is the user quest (if exists), questData might be template
    const userQuestId = quest ? quest.id : questData.id;

    const completion = {
      userQuestId,
      questTitle: questData.title,
      category: questData.category || 'uncategorized', // Bug #17 fix: ensure category exists
      difficulty: questData.difficulty,
      at: new Date().toISOString(),
      xp,
      proof: {
        type: questData.proof,
        ...(questData.proof === 'timer' && { timerSeconds }),
        ...(questData.proof === 'text' && { text: textValue }),
      },
      streakBonus: profile.currentStreak >= 7,
    };

    addCompletion(completion);
    setShowConfirmDialog(false);
    navigate('/app');
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  const handleDelete = () => {
    if (quest) {
      removeUserQuest(quest.id);
      navigate('/app');
    }
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
        <div className="min-h-full flex items-center justify-center p-4 md:p-6">
          <main className="w-full max-w-md mx-auto pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="glass rounded-xl p-4 md:p-5 border relative shadow-2xl"
          style={{ borderColor: 'var(--color-accent)', borderWidth: '1px' }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-white/10"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Close (ESC)"
          >
            <X size={20} />
          </button>

          {/* Quest Info */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <span className="text-xs font-medium px-1.5 py-0.5 rounded capitalize" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                {questData.difficulty}
              </span>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded capitalize" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                {questData.category.replace(/-/g, ' ')}
              </span>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-1" style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)', color: 'var(--color-accent)' }}>
                <Award size={10} /> {questData.baseXP} XP
              </span>
            </div>

            <h1 className="font-display text-xl font-bold mb-2 pr-8" style={{ color: 'var(--color-text)' }}>{questData.title}</h1>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              {questData.description}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="glass rounded-lg p-2 border transition-all hover:border-purple-500/50" style={{ borderColor: 'var(--color-border)' }}>
                <div className="text-xs font-mono mb-1" style={{ color: 'var(--color-text-tertiary)' }}>DURATION</div>
                <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  <Clock size={12} /> {questData.durationMinutes}min
                </div>
              </div>
              <div className="glass rounded-lg p-2 border transition-all hover:border-purple-500/50" style={{ borderColor: 'var(--color-border)' }}>
                <div className="text-xs font-mono mb-1" style={{ color: 'var(--color-text-tertiary)' }}>PROOF</div>
                <div className="flex items-center gap-1 text-sm font-semibold capitalize" style={{ color: 'var(--color-text)' }}>
                  <Camera size={12} /> {questData.proof}
                </div>
              </div>
              <div className="glass rounded-lg p-2 border transition-all hover:border-purple-500/50" style={{ borderColor: 'var(--color-border)' }}>
                <div className="text-xs font-mono mb-1" style={{ color: 'var(--color-text-tertiary)' }}>BONUS</div>
                <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: profile.currentStreak >= 7 ? 'var(--color-success)' : 'var(--color-text)' }}>
                  <TrendingUp size={12} /> {profile.currentStreak >= 7 ? 'Active' : 'None'}
                </div>
              </div>
            </div>

            {/* Tags and Equipment */}
            {questData.tags && questData.tags.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-mono mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>TAGS</div>
                <div className="flex flex-wrap gap-1.5">
                  {questData.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-accent)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {questData.equipment && questData.equipment.length > 0 && (
              <div>
                <div className="text-xs font-mono mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>EQUIPMENT NEEDED</div>
                <div className="flex flex-wrap gap-1.5">
                  {questData.equipment.map((item: string) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 rounded text-xs capitalize"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
                    >
                      {item.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {questData.safety && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-3 p-2 rounded border border-yellow-500/30" style={{ backgroundColor: 'rgba(251, 191, 36, 0.05)' }}>
              <p className="text-xs font-medium flex items-center gap-2" style={{ color: 'var(--color-warning)' }}>
                <AlertTriangle size={12} /> {questData.safety}
              </p>
            </motion.div>
          )}

          {/* Proof Input */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-3">
            <h2 className="font-display text-base font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Complete Quest</h2>

            {questData.proof === 'check' && (
              <div className="text-center py-4">
                <div className="mb-2">
                  <Check size={40} style={{ color: 'var(--color-accent)' }} className="mx-auto" />
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                  Tap complete when finished
                </p>
              </div>
            )}

            {questData.proof === 'timer' && (
              <div className="text-center py-4">
                <div className="text-4xl font-bold tabular-nums mb-4" style={{ color: 'var(--color-text)' }}>
                  {formatTime(timerSeconds)}
                </div>
                {!isTimerRunning ? (
                  <button
                    onClick={startTimer}
                    className="px-6 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 shadow-lg"
                    style={{ backgroundColor: 'var(--color-success)', color: 'white' }}
                  >
                    ▶ Start Timer
                  </button>
                ) : (
                  <button
                    onClick={stopTimer}
                    className="px-6 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 shadow-lg"
                    style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
                  >
                    ⏸ Stop Timer
                  </button>
                )}
              </div>
            )}

            {questData.proof === 'text' && (
              <div className="py-2">
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="Share your notes or reflections..."
                  className="w-full p-3 rounded-lg glass border focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[80px] text-sm transition-all"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    lineHeight: '1.5',
                  }}
                />
              </div>
            )}

            {questData.proof === 'photo' && (
              <div className="text-center py-4">
                <Camera size={40} className="mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
                <p className="text-sm mb-1" style={{ color: 'var(--color-text)' }}>Photo proof coming soon</p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Complete without photo for now</p>
              </div>
            )}
          </motion.div>

          {/* Complete Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleComplete}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-lg font-display font-bold text-base transition-all shadow-lg hover:shadow-2xl"
            style={{ background: 'var(--gradient-primary)', color: 'white' }}
          >
            Complete Quest · +{questData.baseXP} XP
          </motion.button>

          {profile.currentStreak >= 7 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-xs mt-2 flex items-center justify-center gap-1" style={{ color: 'var(--color-accent)' }}>
              <Flame size={12} className="text-orange-500" /> Streak bonus active!
            </motion.p>
          )}

          {/* Remove Quest Button - Only show for user quests */}
          {quest && !isTemplate && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full mt-3 py-2 rounded-lg font-mono text-xs transition-all hover:bg-white/5 flex items-center justify-center gap-1.5"
              style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
            >
              <Trash2 size={12} />
              Remove from My Quests
            </motion.button>
          )}
        </motion.div>
          </main>
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="Complete Quests"
      />

      {/* Confirmation Dialog */}
      <QuestConfirmDialog
        isOpen={showConfirmDialog}
        questTitle={questData.title}
        xpAmount={questData.baseXP}
        onConfirm={confirmCompletion}
        onCancel={() => setShowConfirmDialog(false)}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-xl p-6 border max-w-sm w-full"
            style={{ borderColor: 'var(--color-error)', backgroundColor: 'var(--color-bg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
                <Trash2 size={24} style={{ color: 'var(--color-error)' }} />
              </div>
              <h3 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                Remove Quest?
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                This will permanently remove "{questData.title}" from your quests. Your completion history will be preserved.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-lg font-semibold transition-all hover:bg-white/10"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-text)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
              >
                Remove
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
