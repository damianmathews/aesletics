import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { exportData, importData } from '../lib/storage';

export default function Settings() {
  const { settings, updateSettings, profile, updateProfile } = useStore();

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
          alert('Data imported successfully! Reload the page to see changes.');
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
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
        <h1 className="font-display text-4xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Profile */}
          <div className="rounded-card p-6 shadow-soft" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h2 className="font-display text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nickname</label>
                <input
                  type="text"
                  value={profile.nickname}
                  onChange={(e) => updateProfile({ nickname: e.target.value })}
                  className="w-full px-4 py-2 rounded-button border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="rounded-card p-6 shadow-soft" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h2 className="font-display text-xl font-semibold mb-4">Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => updateSettings({ theme: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-button border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </div>

          {/* Units */}
          <div className="rounded-card p-6 shadow-soft" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h2 className="font-display text-xl font-semibold mb-4">Units</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Measurement System</label>
                <select
                  value={settings.units}
                  onChange={(e) => updateSettings({ units: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-button border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                >
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="rounded-card p-6 shadow-soft" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h2 className="font-display text-xl font-semibold mb-4">Data</h2>
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="w-full py-3 rounded-button font-medium transition-all"
                style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
              >
                Export Data (JSON)
              </button>
              <button
                onClick={handleImport}
                className="w-full py-3 rounded-button font-medium border transition-all"
                style={{ borderColor: 'var(--color-border)' }}
              >
                Import Data
              </button>
            </div>
            <p className="text-sm mt-4" style={{ color: 'var(--color-text-secondary)' }}>
              All data is stored locally on your device. Export to create backups.
            </p>
          </div>

          {/* Stats */}
          <div className="rounded-card p-6 shadow-soft" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h2 className="font-display text-xl font-semibold mb-4">Stats</h2>
            <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <p>Total XP: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{profile.totalXP.toLocaleString()}</span></p>
              <p>Level: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{profile.level}</span></p>
              <p>Quests Completed: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{profile.completedQuests}</span></p>
              <p>Current Streak: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{profile.currentStreak} days</span></p>
              <p>Longest Streak: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{profile.longestStreak} days</span></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
