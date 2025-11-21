import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Flame, Menu, X } from 'lucide-react';
import { getTopPlayers } from '../lib/leaderboard';
import { auth } from '../lib/firebase';

interface Player {
  rank: number;
  username: string;
  xp: number;
  level: number;
  streak: number;
  isUser: boolean;
}

export default function Leaderboard() {
  const { profile } = useStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        // Fetch top 50 players from Firestore
        const topPlayersData = await getTopPlayers(50);

        // Convert to Player format with ranks
        const players: Player[] = topPlayersData.map((entry, index) => ({
          rank: index + 1,
          username: entry.displayName,
          xp: entry.totalXP,
          level: entry.level,
          streak: 0, // We don't store streak in leaderboard yet
          isUser: auth.currentUser?.uid === entry.userId,
        }));

        // Add current user if not in top 50
        const userInList = players.some(p => p.isUser);
        if (!userInList && auth.currentUser) {
          // Calculate user's rank (they're somewhere after the top 50)
          const userRank = players.findIndex(p => p.xp < profile.totalXP);
          const rank = userRank === -1 ? players.length + 1 : userRank + 1;

          const userPlayer: Player = {
            rank,
            username: profile.nickname,
            xp: profile.totalXP,
            level: profile.level,
            streak: profile.currentStreak,
            isUser: true,
          };

          // Insert user in correct position
          if (userRank === -1) {
            players.push(userPlayer);
          } else {
            players.splice(userRank, 0, userPlayer);
            // Update ranks after insertion
            for (let i = userRank + 1; i < players.length; i++) {
              players[i].rank = i + 1;
            }
          }
        }

        setLeaderboard(players);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [profile.totalXP, profile.level, profile.nickname, profile.currentStreak]);

  const userEntry = leaderboard.find(p => p.isUser);
  const topPlayers = leaderboard.slice(0, 50); // Show up to top 50
  const userContext = userEntry
    ? leaderboard.slice(Math.max(0, userEntry.rank - 3), Math.min(leaderboard.length, userEntry.rank + 2))
    : [];

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
            <Link to="/app/quests" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Quests</Link>
            <Link to="/app/leaderboard" className="hidden md:block text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-text)' }}>Leaderboard</Link>
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
      <main className="max-w-7xl mx-auto px-6 py-5 relative" data-tutorial="leaderboard-container">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)'
        }} />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mb-5">
          <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Global Leaderboard</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>You vs Everyone - See where you rank worldwide</p>
        </motion.div>

        {/* Your Rank Card */}
        {loading ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-lg p-4 border mb-5 relative" style={{ borderColor: 'var(--color-accent)', backgroundColor: 'rgba(167, 139, 250, 0.05)' }}>
            <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Loading leaderboard...
            </div>
          </motion.div>
        ) : userEntry ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-lg p-4 border mb-5 relative" style={{ borderColor: 'var(--color-accent)', backgroundColor: 'rgba(167, 139, 250, 0.05)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-xs font-medium mb-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>YOUR GLOBAL RANK</div>
                <div className="text-3xl font-bold tabular-nums font-mono" style={{ color: 'var(--color-accent)' }}>
                  #{userEntry.rank.toLocaleString()}
                </div>
                <div className="text-xs mt-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                  {leaderboard.length > 50 ? `in top ${leaderboard.length}` : 'globally'}
                </div>
              </div>
              <div className="sm:text-right">
                <div className="text-xs mb-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>YOUR STATS</div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span style={{ color: 'var(--color-text)' }}>{profile.totalXP.toLocaleString()} XP</span>
                  <span style={{ color: 'var(--color-text)' }}>Lvl {userEntry.level}</span>
                  <span className="flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
                    <Flame size={14} className="text-orange-500" /> {profile.currentStreak}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* Top Players */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-lg border mb-5 overflow-hidden relative" style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-display text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Trophy size={18} style={{ color: 'var(--color-accent)' }} />
              Top 50 Rankings
            </h2>
            <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--color-text-secondary)' }}>The best performers worldwide</p>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Loading rankings...
              </div>
            ) : topPlayers.length === 0 ? (
              <div className="text-center py-12 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                No players yet. Be the first!
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs font-mono" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    <th className="text-left py-1.5 px-3">RANK</th>
                    <th className="text-left py-1.5 px-3">PLAYER</th>
                    <th className="text-right py-1.5 px-3">XP</th>
                    <th className="text-right py-1.5 px-3">LEVEL</th>
                    <th className="text-right py-1.5 px-3">STREAK</th>
                  </tr>
                </thead>
                <tbody>
                  {topPlayers.map((player, index) => (
                  <motion.tr
                    key={player.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.02 }}
                    className="border-b hover:bg-white/5 transition-colors text-xs"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <td className="py-1.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {player.rank <= 3 && (
                          <Trophy size={14} className={player.rank === 1 ? 'text-yellow-500' : player.rank === 2 ? 'text-gray-400' : 'text-orange-600'} />
                        )}
                        <span className="font-bold font-mono" style={{ color: player.rank <= 3 ? 'var(--color-accent)' : 'var(--color-text)' }}>
                          #{player.rank}
                        </span>
                      </div>
                    </td>
                    <td className="py-1.5 px-3 font-semibold" style={{ color: 'var(--color-text)' }}>{player.username}</td>
                    <td className="py-1.5 px-3 text-right font-mono font-medium" style={{ color: 'var(--color-text)' }}>{player.xp.toLocaleString()}</td>
                    <td className="py-1.5 px-3 text-right font-mono" style={{ color: 'var(--color-text-secondary)' }}>{player.level}</td>
                    <td className="py-1.5 px-3 text-right">
                      <span className="flex items-center justify-end gap-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                        <Flame size={12} className="text-orange-500" /> {player.streak}
                      </span>
                    </td>
                  </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Your Position Context */}
        {!loading && userEntry && userContext.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-lg border overflow-hidden relative" style={{ borderColor: 'var(--color-border)' }}>
            <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="font-display text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <TrendingUp size={18} style={{ color: 'var(--color-accent)' }} />
                Your Position
              </h2>
              <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--color-text-secondary)' }}>Players near your rank - climb higher to surpass them</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs font-mono" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    <th className="text-left py-1.5 px-3">RANK</th>
                    <th className="text-left py-1.5 px-3">PLAYER</th>
                    <th className="text-right py-1.5 px-3">XP</th>
                    <th className="text-right py-1.5 px-3">LEVEL</th>
                    <th className="text-right py-1.5 px-3">STREAK</th>
                  </tr>
                </thead>
                <tbody>
                  {userContext.map((player) => (
                  <tr
                    key={player.rank}
                    className={`border-b transition-colors text-xs ${player.isUser ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    style={{
                      borderColor: player.isUser ? 'var(--color-accent)' : 'var(--color-border)',
                      borderWidth: player.isUser ? '2px 0' : '1px 0'
                    }}
                  >
                    <td className="py-1.5 px-3">
                      <span className="font-bold font-mono" style={{ color: player.isUser ? 'var(--color-accent)' : 'var(--color-text)' }}>
                        #{player.rank}
                      </span>
                    </td>
                    <td className="py-1.5 px-3">
                      <span className="font-semibold" style={{ color: player.isUser ? 'var(--color-accent)' : 'var(--color-text)' }}>
                        {player.username} {player.isUser && '←'}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-medium" style={{ color: player.isUser ? 'var(--color-accent)' : 'var(--color-text)' }}>
                      {player.xp.toLocaleString()}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono" style={{ color: 'var(--color-text-secondary)' }}>{player.level}</td>
                    <td className="py-1.5 px-3 text-right">
                      <span className="flex items-center justify-end gap-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                        <Flame size={12} className="text-orange-500" /> {player.streak}
                      </span>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Motivational CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-5 text-center">
          <p className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
            Complete more quests to climb the ranks
          </p>
          <Link to="/app/quests" className="inline-block mt-2 px-5 py-2 rounded-lg font-semibold transition-all hover:scale-105 text-xs" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
            Browse Quests →
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
