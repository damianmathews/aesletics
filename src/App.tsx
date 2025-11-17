import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import TutorialOverlay from './components/TutorialOverlay';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import QuestLibrary from './pages/QuestLibrary';
import QuestDetail from './pages/QuestDetail';
import Settings from './pages/Settings';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';
import QuestPacks from './pages/QuestPacks';

function App() {
  const { initialize, settings } = useStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Apply theme
  useEffect(() => {
    const theme = settings.theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : settings.theme;

    document.documentElement.setAttribute('data-theme', theme);
  }, [settings.theme]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/app/quests" element={<ProtectedRoute><QuestLibrary /></ProtectedRoute>} />
          <Route path="/app/quests/:id" element={<ProtectedRoute><QuestDetail /></ProtectedRoute>} />
          <Route path="/app/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/app/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/app/packs" element={<ProtectedRoute><QuestPacks /></ProtectedRoute>} />
          <Route path="/app/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <TutorialOverlay />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
