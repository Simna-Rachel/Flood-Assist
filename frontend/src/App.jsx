import { useState, useEffect } from 'react';

import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import Dashboard from './pages/Dashboard';
import IntroSplash from './components/IntroSplash';

import { getSession, clearSession, normalizeUser, syncOutbox } from './lib/api';

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [conflicts, setConflicts] = useState([]);
  const [showIntro, setShowIntro] = useState(true);

  // On first load, restore a previous session
  useEffect(() => {
    const session = getSession();

    if (session?.token && session?.user) {
      setUser(normalizeUser(session.user));
    }

    setCheckingSession(false);
  }, []);

  // Sync anything queued while offline, as soon as we're back online
  useEffect(() => {
    const handleOnline = async () => {
      const foundConflicts = await syncOutbox();
      if (foundConflicts.length > 0) setConflicts(foundConflicts);
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleLogin = (userData) => {
    setUser(normalizeUser(userData));
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
  };

  const handleUserUpdate = (userData) => {
    setUser(normalizeUser(userData));
  };

  const dismissConflict = (localId) => {
    setConflicts((prev) => prev.filter((c) => c.localId !== localId));
  };

  // Avoid flashing the login page while checking localStorage.
  // The intro splash still shows during this brief check.
  const contentReady = !checkingSession;

  return (
    <div className="aero-root">

      {/* INTRO SPLASH */}
      {showIntro && <IntroSplash onFinish={() => setShowIntro(false)} />}

      {/* RAIN BACKGROUND VIDEO */}
      <video className="aero-video" autoPlay muted loop playsInline>
        <source src="/rain.mp4" type="video/mp4" />
      </video>

      {/* AQUA OVERLAY */}
      <div className="aero-overlay" />

      {contentReady && (
        <>
          {/* OFFLINE BANNER */}
          {!navigator.onLine && (
            <div className="offline-banner">
              You're offline — changes will sync when you're back online.
            </div>
          )}

          {/* CONFLICT BANNERS */}
          {conflicts.map((c) => (
            <div key={c.localId} className="conflict-banner">
              <p>A record was changed by someone else while you were offline.</p>
              <p>Your queued change: {JSON.stringify(c.payload)}</p>
              <button className="chip bad" onClick={() => dismissConflict(c.localId)}>Dismiss</button>
            </div>
          ))}

          {/* WEBSITE CONTENT */}
          <div className="aero-content">

            {/* 1. ADMIN LOGIN */}
            {!user && window.location.pathname === '/admin' && (
              <AdminLoginPage
                onLogin={handleLogin}
                onBack={() => {
                  window.location.href = '/';
                }}
              />
            )}

            {/* 2. NORMAL LOGIN */}
            {!user && window.location.pathname !== '/admin' && (
              <LoginPage onLogin={handleLogin} />
            )}

            {/* 3. DASHBOARD */}
            {user && (
              <Dashboard
                user={user}
                onLogout={handleLogout}
                onUserUpdate={handleUserUpdate}
              />
            )}

          </div>
        </>
      )}

    </div>
  );
}

export default App;
