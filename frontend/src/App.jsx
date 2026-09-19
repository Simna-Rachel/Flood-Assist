import { useState, useEffect } from 'react';

import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import Dashboard from './pages/Dashboard';

import { getSession, clearSession, normalizeUser } from './lib/api';

import AutoWeather from './AutoWeather';

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // On first load, restore a previous session
  useEffect(() => {
    const session = getSession();

    if (session?.token && session?.user) {
      setUser(normalizeUser(session.user));
    }

    setCheckingSession(false);
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

  // Avoid flashing the login page while checking localStorage
  if (checkingSession) {
    return null;
  }

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden'
      }}
    >

      {/* RAIN BACKGROUND VIDEO */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <source src="/rain.mp4" type="video/mp4" />
      </video>

      {/* DARK OVERLAY */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 30, 50, 0.25)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      {/* WEBSITE CONTENT */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh'
        }}
      >

        {/* 1. ADMIN LOGIN */}
        {!user && window.location.pathname === '/admin-login' && (
          <AdminLoginPage
            onLogin={handleLogin}
            onBack={() => {
              window.location.href = '/';
            }}
          />
        )}

        {/* 2. NORMAL LOGIN */}
        {!user && window.location.pathname !== '/admin-login' && (
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

    </div>
  );
}

export default App;