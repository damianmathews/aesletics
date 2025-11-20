import {
  collection,
  doc,
  setDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  totalXP: number;
  level: number;
  lastUpdated: Timestamp;
}

/**
 * Sync user's XP and level to the leaderboard
 */
export async function syncToLeaderboard(
  userId: string,
  displayName: string,
  totalXP: number,
  level: number
): Promise<void> {
  try {
    const entryRef = doc(db, 'leaderboard_entries', userId);
    await setDoc(entryRef, {
      userId,
      displayName,
      totalXP,
      level,
      lastUpdated: Timestamp.now(),
    });
  } catch (error) {
    console.error('Failed to sync to leaderboard:', error);
    // Don't throw - we don't want to break the app if leaderboard fails
  }
}

/**
 * Get top N players from the leaderboard
 */
export async function getTopPlayers(count: number = 50): Promise<LeaderboardEntry[]> {
  try {
    const q = query(
      collection(db, 'leaderboard_entries'),
      orderBy('totalXP', 'desc'),
      limit(count)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
}

/**
 * Get a specific user's leaderboard rank (1-indexed)
 * This is expensive for large datasets - only call when needed
 */
export async function getUserRank(userId: string): Promise<number | null> {
  try {
    // Query all users with more XP than this user
    const q = query(
      collection(db, 'leaderboard_entries'),
      orderBy('totalXP', 'desc')
    );

    const snapshot = await getDocs(q);
    const rank = snapshot.docs.findIndex(doc => doc.id === userId);

    return rank >= 0 ? rank + 1 : null;
  } catch (error) {
    console.error('Failed to get user rank:', error);
    return null;
  }
}
