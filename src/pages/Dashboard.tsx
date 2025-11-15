import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getLevelProgress } from '../lib/xp';

export default function Dashboard() {
  const { profile, getStats, getTodaysQuests } = useStore();
  const stats = getStats();
  const todaysQuests = getTodaysQuests();
  const levelProgress = getLevelProgress(profile.totalXP);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-bold">Æ</Link>
          <div className="flex items-center gap-4">
            <Link to="/app/quests" className="text-sm font-medium hover:opacity-70">Quests</Link>
            <Link to="/app/settings" className="text-sm font-medium hover:opacity-70">Settings</Link>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
              {profile.nickname.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-4xl font-bold mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Level & XP */}
          <div className="rounded-card p-6 shadow-soft" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Level</span>
              <span className="text-3xl font-bold tabular-nums">{profile.level}</span>
            </div>
            <div className="mb-2">
              <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    width: `${levelProgress.progress * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span>{profile.totalXP.toLocaleString()} XP</span>
              <span>{levelProgress.xpToNextLevel} to next</span>
            </div>
          </div>

          {/* Streak */}
          <div className="rounded-card p-6 shadow-soft" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Current Streak</span>
              <span className="text-4xl">🔥</span>
            </div>
            <div className="text-3xl font-bold tabular-nums mb-2">{profile.currentStreak} days</div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Longest: {profile.longestStreak} days
            </div>
          </div>

          {/* Completed Quests */}
          <div className="rounded-card p-6 shadow-soft" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-secondary)' }}>Quests Completed</div>
            <div className="text-3xl font-bold tabular-nums mb-2">{profile.completedQuests}</div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {stats.completedToday} today · {stats.completedThisWeek} this week
            </div>
          </div>
        </div>

        {/* Today's Quests */}
        <div className="rounded-card p-6 shadow-soft mb-8" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold">Today's Quests</h2>
            <Link to="/app/quests" className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
              View All →
            </Link>
          </div>

          {todaysQuests.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
              <p>No quests today. Add two. Keep it simple.</p>
              <Link to="/app/quests" className="inline-block mt-4 px-4 py-2 rounded-button font-medium" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
                Add Quest
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysQuests.map((quest) => (
                <Link
                  key={quest.id}
                  to={`/app/quests/${quest.id}`}
                  className="block p-4 rounded-button border hover:shadow-soft transition-all"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{quest.title}</h3>
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'var(--color-border)' }}>
                          {quest.difficulty}
                        </span>
                        <span>{quest.durationMinutes}min</span>
                        <span>·</span>
                        <span>{quest.baseXP} XP</span>
                      </div>
                    </div>
                    <div className="text-2xl">→</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-card p-6 shadow-soft" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h3 className="font-display text-lg font-semibold mb-4">XP This Week</h3>
            <div className="text-3xl font-bold tabular-nums mb-2">{stats.xpThisWeek.toLocaleString()}</div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {stats.xpToday} today
            </div>
          </div>

          <div className="rounded-card p-6 shadow-soft" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h3 className="font-display text-lg font-semibold mb-4">Average Difficulty</h3>
            <div className="text-3xl font-bold">{stats.averageDifficulty.toFixed(1)}</div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Out of 5.0
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
