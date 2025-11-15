import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import { calculateXP } from '../lib/xp';

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuestById, addCompletion, profile } = useStore();
  const quest = getQuestById(id!);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [counterValue, setCounterValue] = useState(0);
  const [textValue, setTextValue] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  if (!quest) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center">
          <p className="text-xl mb-4" style={{ color: 'var(--color-text-secondary)' }}>Quest not found</p>
          <Link to="/app/quests" className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
            Back to Library
          </Link>
        </div>
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
    };

    addCompletion(completion);
    alert(`Quest completed! +${xp} XP`);
    navigate('/app');
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    // Store interval ID for cleanup
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/app" className="font-display text-2xl font-bold">Æ</Link>
          <Link to="/app" className="text-sm font-medium hover:opacity-70">Back to Dashboard</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="rounded-card p-8 shadow-soft" style={{ backgroundColor: 'var(--color-surface)' }}>
          {/* Quest Info */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium px-3 py-1 rounded" style={{ backgroundColor: 'var(--color-border)' }}>
                {quest.difficulty}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded" style={{ backgroundColor: 'var(--color-border)' }}>
                {quest.category}
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold mb-4">{quest.title}</h1>
            <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {quest.description}
            </p>

            <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span>⏱️ {quest.durationMinutes}min</span>
              <span>📸 {quest.proof}</span>
              <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>⚡ {quest.baseXP} XP</span>
            </div>
          </div>

          {quest.safety && (
            <div className="mb-8 p-4 rounded-button" style={{ backgroundColor: 'var(--color-bg)' }}>
              <p className="text-sm font-medium">⚠️ Safety: {quest.safety}</p>
            </div>
          )}

          {/* Proof Input */}
          <div className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">Complete Quest</h2>

            {quest.proof === 'check' && (
              <div className="text-center py-8">
                <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  Mark as complete when you finish this quest.
                </p>
              </div>
            )}

            {quest.proof === 'timer' && (
              <div className="text-center py-8">
                <div className="text-5xl font-bold tabular-nums mb-6">
                  {formatTime(timerSeconds)}
                </div>
                {!isTimerRunning ? (
                  <button
                    onClick={startTimer}
                    className="px-6 py-3 rounded-button font-medium"
                    style={{ backgroundColor: 'var(--color-success)', color: 'white' }}
                  >
                    Start Timer
                  </button>
                ) : (
                  <button
                    onClick={stopTimer}
                    className="px-6 py-3 rounded-button font-medium"
                    style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
                  >
                    Stop Timer
                  </button>
                )}
              </div>
            )}

            {quest.proof === 'counter' && (
              <div className="text-center py-8">
                <div className="text-5xl font-bold tabular-nums mb-6">{counterValue}</div>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCounterValue(Math.max(0, counterValue - 1))}
                    className="w-12 h-12 rounded-full font-bold text-xl"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  >
                    −
                  </button>
                  <button
                    onClick={() => setCounterValue(counterValue + 1)}
                    className="w-12 h-12 rounded-full font-bold text-xl"
                    style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
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
                  placeholder="Enter your notes or description..."
                  className="w-full p-4 rounded-button border focus:outline-none focus:ring-2 min-h-[120px]"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
            )}

            {quest.proof === 'photo' && (
              <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                <p>Photo proof feature (coming soon)</p>
                <p className="text-sm mt-2">For now, you can complete without photo</p>
              </div>
            )}
          </div>

          {/* Complete Button */}
          <button
            onClick={handleComplete}
            className="w-full py-4 rounded-button font-display font-semibold text-lg transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            Complete Quest
          </button>
        </div>
      </main>
    </div>
  );
}
