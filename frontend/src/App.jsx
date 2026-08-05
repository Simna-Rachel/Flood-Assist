import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null); // NULL means user sees login first

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // 1. SHOW LOGIN PAGE IF NOT LOGGED IN
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 2. SHOW DASHBOARD AFTER LOGGING IN
  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;