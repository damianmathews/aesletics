import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { exportData, importData } from '../lib/storage';
import { Menu, X } from 'lucide-react';

export default function Settings() {
  const { profile, settings, updateSettings, updateProfile } = useStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `irlxp-backup-${new Date().toISOString().split('T')[0]}.json`;
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
            <Link to="/app/quests" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Quests</Link>
            <Link to="/app/leaderboard" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Leaderboard</Link>
            <Link to="/app/history" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>History</Link>
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
                  className="absolute right-0 mt-2 w-48 glass rounded-button p-2 border"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <Link to="/app/settings" className="block px-4 py-2 rounded hover:bg-white/5 transition-colors" style={{ color: 'var(--color-text)' }}>Profile</Link>
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
              to="/app/history"
              onClick={() => setShowMobileMenu(false)}
              className="text-lg font-medium py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              History
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
      <main className="max-w-3xl mx-auto px-6 py-6 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)'
        }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Settings</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>Customize your IRLXP experience</p>
        </motion.div>

        <div className="space-y-5">
          {/* Profile */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-lg p-5 border" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Profile</h2>
            <div>
              <label className="block text-xs font-medium mb-1.5 font-mono" style={{ color: 'var(--color-text-secondary)' }}>NICKNAME</label>
              <input
                type="text"
                value={profile.nickname}
                onChange={(e) => updateProfile({ nickname: e.target.value })}
                className="w-full px-3 py-2 rounded glass border focus:outline-none focus:ring-2 transition-all text-sm"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-lg p-5 border relative" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Your Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <div className="text-xs mb-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>TOTAL XP</div>
                <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>{profile.totalXP.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <div className="text-xs mb-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>LEVEL</div>
                <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>{profile.level}</div>
              </div>
              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <div className="text-xs mb-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>CURRENT STREAK</div>
                <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>{profile.currentStreak} days</div>
              </div>
              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <div className="text-xs mb-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>COMPLETED</div>
                <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>{profile.completedQuests}</div>
              </div>
            </div>
          </motion.div>

          {/* Units */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-lg p-5 border" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Preferences</h2>
            <div>
              <label className="block text-xs font-medium mb-1.5 font-mono" style={{ color: 'var(--color-text-secondary)' }}>MEASUREMENT SYSTEM</label>
              <select
                value={settings.units}
                onChange={(e) => updateSettings({ units: e.target.value as any })}
                className="w-full px-3 py-2 rounded glass border focus:outline-none focus:ring-2 transition-all text-sm"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                <option value="imperial">Imperial (lbs, miles)</option>
                <option value="metric">Metric (kg, km)</option>
              </select>
            </div>
          </motion.div>

          {/* Data Management */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-lg p-5 border" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Data Management</h2>
            <div className="space-y-2.5">
              <button
                onClick={handleExport}
                className="w-full py-2.5 rounded font-semibold text-sm transition-all hover:scale-105"
                style={{ background: 'var(--gradient-primary)', color: 'white' }}
              >
                Export Backup (JSON)
              </button>
              <button
                onClick={handleImport}
                className="w-full py-2.5 rounded glass font-semibold text-sm border transition-all hover:scale-105"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                Import Backup
              </button>
            </div>
            <p className="text-xs mt-3 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
              All data is stored locally on your device. Export regularly to create backups.
            </p>
          </motion.div>

          {/* About */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-lg p-5 border" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>About</h2>
            <div className="space-y-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              <p><strong style={{ color: 'var(--color-text)' }}>IRLXP</strong> — Aesthetic discipline meets athletic execution.</p>
              <p>Gamified tracking for total well-being. No tracking. No subscriptions.</p>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs font-mono">Member since: {new Date(profile.joinedAt).toLocaleDateString()}</p>
                <p className="text-xs font-mono">Longest streak: {profile.longestStreak} days</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
