import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { syncToLeaderboard } from '../lib/leaderboard';

export default function Admin() {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<string>('');

  const runMigration = async () => {
    setMigrating(true);
    setResult('🚀 Starting migration...\n\n');

    try {
      // Fetch all users from the users collection
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      setResult(prev => prev + `📊 Found ${snapshot.docs.length} users\n\n`);

      let successCount = 0;
      let errorCount = 0;

      // Sync each user to the leaderboard
      for (const doc of snapshot.docs) {
        const userId = doc.id;
        const userData = doc.data();

        // Extract user data
        const displayName = userData.profile?.nickname || userData.displayName || 'Player';
        const totalXP = userData.profile?.totalXP || 0;
        const level = userData.profile?.level || 1;

        try {
          await syncToLeaderboard(userId, displayName, totalXP, level);
          setResult(prev => prev + `✅ ${displayName} (${totalXP} XP, Level ${level})\n`);
          successCount++;
        } catch (error) {
          setResult(prev => prev + `❌ Failed: ${userId}\n`);
          errorCount++;
        }
      }

      setResult(prev => prev + `\n${'='.repeat(50)}\n✨ Migration complete!\n✅ Success: ${successCount}\n❌ Errors: ${errorCount}\n${'='.repeat(50)}`);
    } catch (error) {
      setResult(prev => prev + `\n💥 Migration failed: ${error}`);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <div className="max-w-4xl mx-auto">
        <Link to="/app" className="text-sm mb-4 inline-block" style={{ color: 'var(--color-accent)' }}>
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          One-time migration to sync all existing users to the leaderboard
        </p>

        <div className="glass rounded-lg p-6 border mb-6" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-xl font-semibold mb-4">Leaderboard Migration</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            This will sync all existing users' XP and levels to the global leaderboard.
            Only run this once to populate the leaderboard with existing users.
          </p>

          <button
            onClick={runMigration}
            disabled={migrating}
            className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--gradient-primary)', color: 'white' }}
          >
            {migrating ? 'Migrating...' : 'Run Migration'}
          </button>
        </div>

        {result && (
          <div className="glass rounded-lg p-6 border" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-lg font-semibold mb-4">Migration Log</h3>
            <pre className="text-xs font-mono whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
