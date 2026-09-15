import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import Dashboard from './pages/Dashboard';
import { getSession, clearSession, normalizeUser } from './lib/api';

function App() {
  const [user, setUser] = useState(null); // NULL means user sees login first
  const [checkingSession, setCheckingSession] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // On first load, restore a previous session so refreshing the page
  // doesn't kick the user back to the login screen.
  useEffect(() => {
    const session = getSession();
    if (session?.token && session?.user) {
      setUser(normalizeUser(session.user));
    }
    setCheckingSession(false);
  }, []);

  const handleLogin = (userData) => {
    setShowAdminLogin(false);
    setUser(normalizeUser(userData));
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
  };

  const handleUserUpdate = (userData) => {
    setUser(normalizeUser(userData));
  };

  // Avoid flashing the login page for a split second while we check localStorage.
  if (checkingSession) {
    return null;
  }

  // 1. SHOW LOGIN PAGE IF NOT LOGGED IN
  if (!user) {
    return showAdminLogin ? (
      <AdminLoginPage onLogin={handleLogin} onBack={() => setShowAdminLogin(false)} />
    ) : (
      <LoginPage onLogin={handleLogin} onAdminLogin={() => setShowAdminLogin(true)} />
    );
  }

  // 2. SHOW DASHBOARD AFTER LOGGING IN
  return <Dashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
}

export default App;
