import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { exportData, importData } from '../lib/storage';

export default function Settings() {
  const { profile, settings, updateSettings, updateProfile } = useStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aesletics-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const success = importData(content);
        if (success) {
          window.location.reload();
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
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
      <main className="max-w-3xl mx-auto px-6 py-8 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)'
        }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <h1 className="font-display text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Settings</h1>
          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>Customize your Aesletics experience</p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-card p-6 border" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Nickname</label>
                <input
                  type="text"
                  value={profile.nickname}
                  onChange={(e) => updateProfile({ nickname: e.target.value })}
                  className="w-full px-4 py-3 rounded-button glass border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-card p-6 border relative" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Your Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-button" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total XP</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{profile.totalXP.toLocaleString()}</div>
              </div>
              <div className="p-4 rounded-button" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Level</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{profile.level}</div>
              </div>
              <div className="p-4 rounded-button" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Current Streak</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{profile.currentStreak} days</div>
              </div>
              <div className="p-4 rounded-button" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Completed</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{profile.completedQuests}</div>
              </div>
            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-card p-6 border" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => updateSettings({ theme: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-button glass border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Units */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-card p-6 border" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Measurement System</label>
                <select
                  value={settings.units}
                  onChange={(e) => updateSettings({ units: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-button glass border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  <option value="imperial">Imperial (lbs, miles)</option>
                  <option value="metric">Metric (kg, km)</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Data Management */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-card p-6 border" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Data Management</h2>
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="w-full py-3 rounded-button font-semibold transition-all hover:scale-105"
                style={{ background: 'var(--gradient-primary)', color: 'white' }}
              >
                📥 Export Backup (JSON)
              </button>
              <button
                onClick={handleImport}
                className="w-full py-3 rounded-button glass font-semibold border transition-all hover:scale-105"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                📤 Import Backup
              </button>
            </div>
            <p className="text-sm mt-4" style={{ color: 'var(--color-text-secondary)' }}>
              🔒 All data is stored locally on your device. Export regularly to create backups.
            </p>
          </motion.div>

          {/* About */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-card p-6 border" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>About</h2>
            <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <p><strong style={{ color: 'var(--color-text)' }}>Aesletics</strong> — Aesthetic discipline meets athletic execution.</p>
              <p>Gamified tracking for total well-being. 100% local. No servers. No tracking. No subscriptions.</p>
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs">Member since: {new Date(profile.joinedAt).toLocaleDateString()}</p>
                <p className="text-xs">Longest streak: {profile.longestStreak} days</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
