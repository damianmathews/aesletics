import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, initializeAuthPersistence } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { syncToFirestore, loadUserData } from '../lib/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Initialize auth persistence FIRST
    initializeAuthPersistence()
      .then(() => {
        // Set up auth state listener
        unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          setUser(fbUser);

          if (!fbUser) {
            setLoading(false);
            return;
          }

          // CRITICAL: Wait for Zustand to rehydrate before touching state
          const { _hasHydrated, initializeFromAuth, loadFromFirestore } = useStore.getState();

          console.log('🔐 AUTH CHECK:', {
            hasHydrated: _hasHydrated,
            user: fbUser.email
          });

          if (!_hasHydrated) {
            console.log('⏳ Store not hydrated yet - waiting');
            setLoading(false);
            return;
          }

          // ALWAYS try to load from Firestore for authenticated users
          // This ensures cloud data is the source of truth, even if localStorage is cleared
          console.log('👤 Authenticated user - checking Firestore for data');
          try {
            const firestoreData = await loadUserData(fbUser.uid);
            const localState = useStore.getState();

            if (firestoreData) {
              // Check if Firestore data is missing onboardingComplete but localStorage has it
              // This happens if Firestore document was created before onboarding tracking
              if (!firestoreData.onboardingComplete && localState.onboardingComplete) {
                console.log('🔄 FIXING: Firestore missing onboardingComplete - re-syncing from localStorage');
                await syncToFirestore(fbUser.uid, {
                  profile: localState.profile,
                  userQuests: localState.userQuests,
                  completions: localState.completions,
                  activePacks: localState.activePacks,
                  settings: localState.settings,
                  onboardingComplete: localState.onboardingComplete,
                  onboardingData: localState.onboardingData,
                  showTutorial: localState.showTutorial,
                });
                console.log('✅ FIX COMPLETE: localStorage data synced to Firestore');
              } else {
                // Firestore data is good - load it
                console.log('📥 Loaded existing user data from Firestore:', {
                  level: firestoreData.profile.level,
                  totalXP: firestoreData.profile.totalXP,
                  onboardingComplete: firestoreData.onboardingComplete
                });
                loadFromFirestore(firestoreData);
                console.log('✅ Firestore data loaded and applied to store');
              }
            } else if (localState.initialized || localState.onboardingComplete) {
              // MIGRATION: User has data in localStorage but Firestore is empty
              // This happens if they completed onboarding before sync was implemented
              console.log('🔄 MIGRATING: Found local data but Firestore empty - syncing to cloud...');
              await syncToFirestore(fbUser.uid, {
                profile: localState.profile,
                userQuests: localState.userQuests,
                completions: localState.completions,
                activePacks: localState.activePacks,
                settings: localState.settings,
                onboardingComplete: localState.onboardingComplete,
                onboardingData: localState.onboardingData,
                showTutorial: localState.showTutorial,
              });
              console.log('✅ MIGRATION COMPLETE: Local data synced to Firestore');
            } else {
              // First time user - no cloud data and no local data
              console.log('🆕 First time user (no Firestore data) - initializing with name:', fbUser.displayName);
              initializeFromAuth(fbUser.displayName, fbUser.email);
            }
          } catch (error) {
            console.error('❌ Error loading from Firestore:', error);
            // On error, fall back to whatever is in localStorage
          }

          // CRITICAL: Only set loading false AFTER Firestore data is loaded
          // This prevents routing decisions before cloud data is applied
          console.log('✅ Auth complete - setting loading: false');
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error('Failed to initialize auth persistence:', error);
        setLoading(false);
      });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Auto-sync to Firestore when data changes
  const syncTimeoutRef = useRef<number | null>(null);
  const initialLoadRef = useRef(true);
  const lastSyncedStateRef = useRef<any>(null);
  const prevStateRef = useRef<any>(null);

  useEffect(() => {
    const syncData = async (state: any, immediate = false) => {
      if (!user) return;

      try {
        await syncToFirestore(user.uid, {
          profile: state.profile,
          userQuests: state.userQuests,
          completions: state.completions,
          activePacks: state.activePacks,
          settings: state.settings,
          onboardingComplete: state.onboardingComplete,
          onboardingData: state.onboardingData,
          showTutorial: state.showTutorial,
        });
        console.log(`✅ Data synced to Firestore${immediate ? ' (immediate)' : ''}`);
        lastSyncedStateRef.current = state;
      } catch (error) {
        console.error('❌ Error syncing to Firestore:', error);
      }
    };

    const unsubscribe = useStore.subscribe((state) => {
      // Skip sync on initial load
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
        prevStateRef.current = state;
        lastSyncedStateRef.current = state;
        return;
      }

      // Only sync if user is authenticated
      if (!user) return;

      const prevState = prevStateRef.current;

      // Check if critical data changed - sync immediately
      const criticalDataChanged = prevState && (
        state.onboardingComplete !== prevState.onboardingComplete ||
        state.profile.level !== prevState.profile.level ||
        state.completions.length !== prevState.completions.length
      );

      if (criticalDataChanged) {
        console.log('🚨 Critical data changed - syncing immediately');
        // Clear any pending debounced sync
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        // Sync immediately
        syncData(state, true);
      } else {
        // Non-critical changes - debounce
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(() => syncData(state), 2000);
      }

      prevStateRef.current = state;
    });

    // Sync on tab close/refresh
    const handleBeforeUnload = () => {
      const state = useStore.getState();
      if (user && state !== lastSyncedStateRef.current) {
        console.log('📤 Syncing on tab close...');
        // Use sendBeacon for reliable sync on unload
        const data = {
          profile: state.profile,
          userQuests: state.userQuests,
          completions: state.completions,
          activePacks: state.activePacks,
          settings: state.settings,
          onboardingComplete: state.onboardingComplete,
          onboardingData: state.onboardingData,
          showTutorial: state.showTutorial,
        };
        // Try immediate sync (blocking)
        syncToFirestore(user.uid, data).catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const signup = async (email: string, password: string, fullName: string) => {
    // Ensure persistence is set before signing up
    await initializeAuthPersistence();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Set display name after account creation
    if (userCredential.user && fullName) {
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
    }
  };

  const login = async (email: string, password: string) => {
    // Ensure persistence is set before logging in
    await initializeAuthPersistence();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    // Ensure persistence is set before logging in
    await initializeAuthPersistence();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
