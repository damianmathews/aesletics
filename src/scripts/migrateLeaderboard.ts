/**
 * One-time migration script to sync all existing users to the leaderboard
 * Run this with: npm run migrate-leaderboard
 */

import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, Timestamp } from 'firebase/firestore';

// Load environment variables
config();

// Initialize Firebase for the script
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Inline syncToLeaderboard function to avoid import issues
async function syncToLeaderboard(
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
    throw error;
  }
}

async function migrateLeaderboard() {
  console.log('🚀 Starting leaderboard migration...\n');

  try {
    // Fetch all users from the users collection
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    console.log(`📊 Found ${snapshot.docs.length} users to migrate\n`);

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
        console.log(`✅ Synced: ${displayName} (${totalXP} XP, Level ${level})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to sync user ${userId}:`, error);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Migration complete!');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateLeaderboard()
  .then(() => {
    console.log('\n👋 Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
