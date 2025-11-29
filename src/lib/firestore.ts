import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, UserQuest, Completion, Settings, OnboardingData } from '../types';

export interface UserData {
  profile: UserProfile;
  userQuests: UserQuest[];
  completions: Completion[];
  activePacks: string[];
  settings: Settings;
  onboardingComplete?: boolean;
  onboardingData?: OnboardingData | null;
  showTutorial?: boolean;
  lastSynced: string;
}

// Load user data from Firestore
export async function loadUserData(userId: string): Promise<UserData | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data() as UserData;

      // Ensure profile.totalXP is a valid number (fixes NaN XP bug)
      if (data.profile) {
        if (!data.profile.totalXP || isNaN(data.profile.totalXP)) {
          // Calculate from completions if available
          const calculatedXP = data.completions?.reduce((sum, c) => sum + (c.xp || 0), 0) || 0;
          data.profile.totalXP = calculatedXP;
        }
        if (!data.profile.level || isNaN(data.profile.level)) {
          data.profile.level = Math.floor((data.profile.totalXP || 0) / 100) + 1;
        }
      }

      return data;
    }
    return null;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
}

// Save user data to Firestore
export async function saveUserData(userId: string, data: Partial<UserData>): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', userId);

    // Filter out undefined values - Firestore doesn't allow them
    const cleanData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    const dataToSave = {
      ...cleanData,
      lastSynced: new Date().toISOString(),
    };

    // Check if document exists
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      await updateDoc(userDocRef, dataToSave);
    } else {
      await setDoc(userDocRef, dataToSave);
    }

    console.log('✅ Saved to Firestore successfully');
  } catch (error) {
    console.error('❌ Error saving user data:', error);
    throw error;
  }
}

// Sync local data to Firestore
export async function syncToFirestore(userId: string, localData: {
  profile: UserProfile;
  userQuests: UserQuest[];
  completions: Completion[];
  activePacks: string[];
  settings: Settings;
  onboardingComplete?: boolean;
  onboardingData?: OnboardingData | null;
  showTutorial?: boolean;
}): Promise<void> {
  await saveUserData(userId, localData);
}
