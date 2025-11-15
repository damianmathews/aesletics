import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { calculateXP } from '../lib/xp';

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, getQuestById, addCompletion } = useStore();
  const quest = getQuestById(id!);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [counterValue, setCounterValue] = useState(0);
  const [textValue, setTextValue] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  if (!quest) {
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
    const xp = calculateXP(quest.baseXP, quest.proof, profile.currentStreak);

    const completion = {
      userQuestId: quest.id,
      questTitle: quest.title,
      category: quest.category,
      difficulty: quest.difficulty,
      at: new Date().toISOString(),
      xp,
      proof: {
        type: quest.proof,
        ...(quest.proof === 'timer' && { timerSeconds }),
        ...(quest.proof === 'counter' && { counterValue }),
        ...(quest.proof === 'text' && { text: textValue }),
      },
      streakBonus: profile.currentStreak >= 7,
    };

    addCompletion(completion);
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
      <main className="max-w-3xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-card p-8 border" style={{ borderColor: 'var(--color-border)' }}>
          {/* Quest Info */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium px-3 py-1 rounded capitalize" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                {quest.difficulty}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded capitalize" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                {quest.category.replace(/-/g, ' ')}
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>{quest.title}</h1>
            <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {quest.description}
            </p>

            <div className="flex items-center gap-6 text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              <span>⏱️ {quest.durationMinutes}min</span>
              <span>📸 {quest.proof}</span>
              <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>⚡ {quest.baseXP} XP</span>
            </div>

            {quest.tags && quest.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quest.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: 'rgba(56, 226, 140, 0.1)', color: 'var(--color-accent)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {quest.safety && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8 p-4 rounded-button border border-yellow-500/30" style={{ backgroundColor: 'rgba(251, 191, 36, 0.05)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--color-warning)' }}>⚠️ Safety: {quest.safety}</p>
            </motion.div>
          )}

          {/* Proof Input */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
            <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: 'var(--color-text)' }}>Complete Quest</h2>

            {quest.proof === 'check' && (
              <div className="text-center py-12">
                <p className="text-lg mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  Mark as complete when you finish this quest.
                </p>
                <div className="text-6xl mb-4">✓</div>
              </div>
            )}

            {quest.proof === 'timer' && (
              <div className="text-center py-12">
                <div className="text-7xl font-bold tabular-nums mb-8" style={{ color: 'var(--color-text)' }}>
                  {formatTime(timerSeconds)}
                </div>
                {!isTimerRunning ? (
                  <button
                    onClick={startTimer}
                    className="px-8 py-4 rounded-button font-semibold text-lg transition-all hover:scale-105"
                    style={{ backgroundColor: 'var(--color-success)', color: 'white' }}
                  >
                    ▶ Start Timer
                  </button>
                ) : (
                  <button
                    onClick={stopTimer}
                    className="px-8 py-4 rounded-button font-semibold text-lg transition-all hover:scale-105"
                    style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
                  >
                    ⏸ Stop Timer
                  </button>
                )}
              </div>
            )}

            {quest.proof === 'counter' && (
              <div className="text-center py-12">
                <div className="text-7xl font-bold tabular-nums mb-8" style={{ color: 'var(--color-text)' }}>{counterValue}</div>
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => setCounterValue(Math.max(0, counterValue - 1))}
                    className="w-16 h-16 rounded-full font-bold text-2xl transition-all hover:scale-110"
                    style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    −
                  </button>
                  <button
                    onClick={() => setCounterValue(counterValue + 1)}
                    className="w-16 h-16 rounded-full font-bold text-2xl transition-all hover:scale-110"
                    style={{ background: 'var(--gradient-primary)', color: 'white' }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {quest.proof === 'text' && (
              <div className="py-4">
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="Enter your notes, reflections, or description of completion..."
                  className="w-full p-4 rounded-button glass border focus:outline-none focus:ring-2 min-h-[160px]"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
            )}

            {quest.proof === 'photo' && (
              <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
                <div className="text-6xl mb-4">📷</div>
                <p className="text-lg mb-2">Photo proof feature coming soon</p>
                <p className="text-sm">For now, you can complete without photo</p>
              </div>
            )}
          </motion.div>

          {/* Complete Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleComplete}
            className="w-full py-5 rounded-button font-display font-bold text-xl transition-all hover:scale-105 hover:shadow-2xl"
            style={{ background: 'var(--gradient-primary)', color: 'white' }}
          >
            Complete Quest +{quest.baseXP} XP
          </motion.button>

          {profile.currentStreak >= 7 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-sm mt-4" style={{ color: 'var(--color-accent)' }}>
              🔥 Streak bonus active! You'll earn extra XP
            </motion.p>
          )}
        </motion.div>
      </main>
    </div>
  );
}
