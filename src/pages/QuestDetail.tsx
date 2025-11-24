import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useSubscription } from '../hooks/useSubscription';
import { calculateXP } from '../lib/xp';
import { Clock, Camera, AlertTriangle, Check, Flame, X, Award, TrendingUp, Menu } from 'lucide-react';
import PaywallModal from '../components/PaywallModal';
import QuestConfirmDialog from '../components/QuestConfirmDialog';
import { questTemplates } from '../data/seed';

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, getQuestById, addCompletion, addUserQuest } = useStore();
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

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [textValue, setTextValue] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  if (!questData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pattern-dots" style={{ backgroundColor: 'var(--color-bg)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center glass rounded-card p-12 border" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xl mb-4" style={{ color: 'var(--color-text)' }}>Quest not found</p>
          <Link to="/app/quests" className="inline-block px-6 py-3 rounded-button font-semibold transition-all hover:scale-105" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
            Back to Library
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleComplete = () => {
    // Check if user has subscription access
    if (!hasAccess) {
      setShowPaywall(true);
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const confirmCompletion = () => {
    const xp = calculateXP(questData.baseXP, questData.proof, profile.currentStreak);

    const completion = {
      userQuestId: questData.id,
      questTitle: questData.title,
      category: questData.category,
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

  const handleAddQuest = () => {
    if (!hasAccess) {
      setShowPaywall(true);
      return;
    }

    // Add template to user's quests
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
    navigate('/app');
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    (window as any).timerInterval = interval;
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    if ((window as any).timerInterval) {
      clearInterval((window as any).timerInterval);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      <main className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="glass rounded-xl p-6 md:p-8 border relative shadow-2xl"
          style={{ borderColor: 'var(--color-accent)', borderWidth: '1px' }}
        >
          {/* Close Button */}
          <button
            onClick={() => navigate('/app/quests')}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-white/10"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Close (ESC)"
          >
            <X size={20} />
          </button>

          {/* Quest Info */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium px-2 py-1 rounded capitalize" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                {questData.difficulty}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded capitalize" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                {questData.category.replace(/-/g, ' ')}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded flex items-center gap-1" style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)', color: 'var(--color-accent)' }}>
                <Award size={12} /> {questData.baseXP} XP
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold mb-3 pr-8" style={{ color: 'var(--color-text)' }}>{questData.title}</h1>
            <p className="text-base mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {questData.description}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="glass rounded-lg p-3 border transition-all hover:border-purple-500/50" style={{ borderColor: 'var(--color-border)' }}>
                <div className="text-xs font-mono mb-2" style={{ color: 'var(--color-text-tertiary)' }}>DURATION</div>
                <div className="flex items-center gap-1.5 text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                  <Clock size={16} /> {questData.durationMinutes}min
                </div>
              </div>
              <div className="glass rounded-lg p-3 border transition-all hover:border-purple-500/50" style={{ borderColor: 'var(--color-border)' }}>
                <div className="text-xs font-mono mb-2" style={{ color: 'var(--color-text-tertiary)' }}>PROOF TYPE</div>
                <div className="flex items-center gap-1.5 text-base font-semibold capitalize" style={{ color: 'var(--color-text)' }}>
                  <Camera size={16} /> {questData.proof}
                </div>
              </div>
              <div className="glass rounded-lg p-3 border transition-all hover:border-purple-500/50" style={{ borderColor: 'var(--color-border)' }}>
                <div className="text-xs font-mono mb-2" style={{ color: 'var(--color-text-tertiary)' }}>BONUS</div>
                <div className="flex items-center gap-1.5 text-base font-semibold" style={{ color: profile.currentStreak >= 7 ? 'var(--color-success)' : 'var(--color-text)' }}>
                  <TrendingUp size={16} /> {profile.currentStreak >= 7 ? 'Active' : 'None'}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-5 p-3 rounded border border-yellow-500/30" style={{ backgroundColor: 'rgba(251, 191, 36, 0.05)' }}>
              <p className="text-xs font-medium flex items-center gap-2" style={{ color: 'var(--color-warning)' }}>
                <AlertTriangle size={14} /> {questData.safety}
              </p>
            </motion.div>
          )}

          {/* Proof Input */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-5">
            <h2 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Complete Quest</h2>

            {questData.proof === 'check' && (
              <div className="text-center py-10">
                <div className="mb-4">
                  <Check size={64} style={{ color: 'var(--color-accent)' }} className="mx-auto" />
                </div>
                <p className="text-lg mb-2" style={{ color: 'var(--color-text)' }}>
                  Complete when you finish this quest
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  {questData.description}
                </p>
              </div>
            )}

            {questData.proof === 'timer' && (
              <div className="text-center py-10">
                <div className="text-7xl font-bold tabular-nums mb-8" style={{ color: 'var(--color-text)' }}>
                  {formatTime(timerSeconds)}
                </div>
                {!isTimerRunning ? (
                  <button
                    onClick={startTimer}
                    className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg"
                    style={{ backgroundColor: 'var(--color-success)', color: 'white' }}
                  >
                    ▶ Start Timer
                  </button>
                ) : (
                  <button
                    onClick={stopTimer}
                    className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg"
                    style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
                  >
                    ⏸ Stop Timer
                  </button>
                )}
              </div>
            )}

            {questData.proof === 'counter' && (
              <div className="text-center py-10">
                <div className="mb-4">
                  <Check size={64} style={{ color: 'var(--color-accent)' }} className="mx-auto" />
                </div>
                <p className="text-lg mb-2" style={{ color: 'var(--color-text)' }}>
                  Complete when you finish this quest
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  {questData.description}
                </p>
              </div>
            )}

            {questData.proof === 'text' && (
              <div className="py-4">
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="Share your notes, reflections, or description of completion..."
                  className="w-full p-4 rounded-lg glass border focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[140px] text-base transition-all"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    lineHeight: '1.6',
                  }}
                />
              </div>
            )}

            {questData.proof === 'photo' && (
              <div className="text-center py-10">
                <Camera size={64} className="mx-auto mb-4" style={{ color: 'var(--color-accent)' }} />
                <p className="text-lg mb-2" style={{ color: 'var(--color-text)' }}>Photo proof coming soon</p>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>For now, you can complete without photo</p>
              </div>
            )}
          </motion.div>

          {/* Complete or Add Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={isTemplate ? handleAddQuest : handleComplete}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-5 rounded-lg font-display font-bold text-xl transition-all shadow-lg hover:shadow-2xl"
            style={{ background: 'var(--gradient-primary)', color: 'white' }}
          >
            {isTemplate ? `Add to My Quests · ${questData.baseXP} XP` : `Complete Quest · +${questData.baseXP} XP`}
          </motion.button>

          {profile.currentStreak >= 7 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-xs mt-3 flex items-center justify-center gap-2" style={{ color: 'var(--color-accent)' }}>
              <Flame size={14} className="text-orange-500" /> Streak bonus active! You'll earn extra XP
            </motion.p>
          )}
        </motion.div>
      </main>

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
    </div>
  );
}
