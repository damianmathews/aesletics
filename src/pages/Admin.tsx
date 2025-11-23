import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { syncToLeaderboard } from '../lib/leaderboard';

export default function Admin() {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<string>('');

  // User moderation
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [moderationLog, setModerationLog] = useState<string>('');

  const searchUser = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);
    setModerationLog('🔍 Searching for users...\n\n');

    try {
      // Search leaderboard by displayName
      const leaderboardRef = collection(db, 'leaderboard');
      const q = query(leaderboardRef, where('displayName', '>=', searchQuery), where('displayName', '<=', searchQuery + '\uf8ff'));
      const snapshot = await getDocs(q);

      const users: any[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        users.push({
          userId: docSnap.id,
          displayName: data.displayName,
          totalXP: data.totalXP,
          level: data.level,
        });
      }

      setSearchResults(users);
      setModerationLog(prev => prev + `Found ${users.length} user(s) matching "${searchQuery}"\n`);
    } catch (error) {
      setModerationLog(prev => prev + `❌ Error searching: ${error}\n`);
    } finally {
      setSearching(false);
    }
  };

  const adjustUserXP = async (userId: string, displayName: string, newXP: number) => {
    setModerationLog(prev => prev + `\n⚙️ Adjusting ${displayName}'s XP to ${newXP}...\n`);

    try {
      // Update in leaderboard
      const leaderboardDocRef = doc(db, 'leaderboard', userId);
      const leaderboardDoc = await getDoc(leaderboardDocRef);

      if (leaderboardDoc.exists()) {
        const newLevel = Math.floor(Math.pow(newXP / 100, 0.5)) + 1;
        await updateDoc(leaderboardDocRef, {
          totalXP: newXP,
          level: newLevel,
        });
        setModerationLog(prev => prev + `✅ Updated leaderboard: ${newXP} XP, Level ${newLevel}\n`);
      }

      // Update in users collection
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const newLevel = Math.floor(Math.pow(newXP / 100, 0.5)) + 1;

        await updateDoc(userDocRef, {
          'profile.totalXP': newXP,
          'profile.level': newLevel,
        });
        setModerationLog(prev => prev + `✅ Updated user profile: ${newXP} XP, Level ${newLevel}\n`);
      }

      setModerationLog(prev => prev + `\n✨ Successfully moderated ${displayName}\n${'='.repeat(50)}\n`);

      // Refresh search results
      searchUser();
    } catch (error) {
      setModerationLog(prev => prev + `❌ Error adjusting XP: ${error}\n`);
    }
  };

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
          Moderate users and manage the leaderboard
        </p>

        {/* User Moderation */}
        <div className="glass rounded-lg p-6 border mb-6" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-xl font-semibold mb-4">User Moderation</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Search for users by username and adjust their XP to moderate cheaters/liars.
          </p>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUser()}
              placeholder="Enter username (e.g. 'Speed')"
              className="flex-1 px-4 py-2 rounded-lg glass border focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
            <button
              onClick={searchUser}
              disabled={searching}
              className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--gradient-primary)', color: 'white' }}
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((user) => (
                <div key={user.userId} className="glass rounded-lg p-4 border" style={{ borderColor: 'var(--color-accent)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>{user.displayName}</div>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Level {user.level} • {user.totalXP.toLocaleString()} XP
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      id={`xp-${user.userId}`}
                      placeholder="New XP amount"
                      defaultValue={user.totalXP}
                      className="flex-1 px-3 py-2 rounded glass border focus:outline-none focus:ring-2 transition-all"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`xp-${user.userId}`) as HTMLInputElement;
                        const newXP = parseInt(input.value);
                        if (!isNaN(newXP) && newXP >= 0) {
                          adjustUserXP(user.userId, user.displayName, newXP);
                        }
                      }}
                      className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
                      style={{ background: 'var(--gradient-primary)', color: 'white' }}
                    >
                      Adjust XP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {moderationLog && (
            <div className="mt-4 glass rounded-lg p-4 border" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-semibold mb-2">Moderation Log</h3>
              <pre className="text-xs font-mono whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>
                {moderationLog}
              </pre>
            </div>
          )}
        </div>

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
