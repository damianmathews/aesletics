import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store/useStore';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import QuestLibrary from './pages/QuestLibrary';
import QuestDetail from './pages/QuestDetail';
import Settings from './pages/Settings';

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/quests" element={<QuestLibrary />} />
        <Route path="/app/quests/:id" element={<QuestDetail />} />
        <Route path="/app/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
