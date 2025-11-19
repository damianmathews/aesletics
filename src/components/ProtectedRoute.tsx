import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { onboardingComplete, _hasHydrated } = useStore();
  const location = useLocation();

  console.log('🛡️ PROTECTED ROUTE CHECK:', {
    path: location.pathname,
    loading,
    hasHydrated: _hasHydrated,
    hasUser: !!user,
    onboardingComplete
  });

  // Wait for BOTH auth to load AND Zustand to rehydrate from localStorage
  if (loading || !_hasHydrated) {
    console.log('⏳ Showing loading - loading:', loading, 'hasHydrated:', _hasHydrated);
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-accent)' }}></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ No user - redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // If user hasn't completed onboarding and not on onboarding page, redirect to onboarding
  if (!onboardingComplete && location.pathname !== '/onboarding') {
    console.log('⚠️ ONBOARDING INCOMPLETE - redirecting to /onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // If user has completed onboarding and on onboarding page, redirect to app
  if (onboardingComplete && location.pathname === '/onboarding') {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
