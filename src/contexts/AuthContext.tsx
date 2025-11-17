import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { loadUserData, syncToFirestore } from '../lib/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
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
  const { initializeFromAuth, loadFromFirestore } = useStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      // Load user data from Firestore
      if (user) {
        try {
          const userData = await loadUserData(user.uid);
          if (userData) {
            // User has existing data in Firestore
            loadFromFirestore(userData);
          } else {
            // New user - initialize with auth data
            initializeFromAuth(user.displayName, user.email);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          initializeFromAuth(user.displayName, user.email);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [initializeFromAuth, loadFromFirestore]);

  // Auto-sync to Firestore when data changes
  const syncTimeoutRef = useRef<number | null>(null);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    const unsubscribe = useStore.subscribe((state) => {
      // Skip sync on initial load
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
        return;
      }

      // Only sync if user is authenticated
      if (!user) return;

      // Clear existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Debounce sync - wait 2 seconds after last change
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          await syncToFirestore(user.uid, {
            profile: state.profile,
            userQuests: state.userQuests,
            completions: state.completions,
            activePacks: state.activePacks,
            settings: state.settings,
          });
          console.log('Data synced to Firestore');
        } catch (error) {
          console.error('Error syncing to Firestore:', error);
        }
      }, 2000);
    });

    return () => {
      unsubscribe();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user]);

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
