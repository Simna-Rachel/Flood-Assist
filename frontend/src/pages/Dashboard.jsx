import React, { useState, useEffect } from 'react';
import LegalBanner from '../components/LegalBanner';
import WeatherCard from '../components/WeatherCard';
import IncidentReport from '../components/IncidentReport';
import Helplines from '../components/Helplines';
import Settings from '../components/Settings';
import Approvals from '../components/Approvals';
import logo from '../assets/logo.jpeg';

const APPROVER_ROLES = ['ward_member', 'official', 'admin'];

function Dashboard({ user, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('weather');
  const canApprove = APPROVER_ROLES.includes(user?.role);

  // Automatically sends live GPS coordinates to backend when user enters Dashboard
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await fetch('http://localhost:5000/api/user/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                email: user?.email
              })
            });
          } catch (err) {
            console.error("Location log failed", err);
          }
        },
        (err) => console.error("GPS Error:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Forces GPS hardware & avoids stale cached locations
      );
    }
  }, [user]);

  const displayName = user?.name || user?.fullName || user?.email;
  const roleLabel = (user?.role || 'citizen').replace('_', ' ');
  const pendingSuffix = user?.roleStatus === 'pending' ? ` · pending: ${(user?.requestedRole || '').replace('_', ' ')}` : '';

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Header Bar */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>NattilAlert</h2>
            <small style={{ color: '#93c5fd', fontSize: '0.8rem' }}>
              Logged in as: {displayName} ({roleLabel}{pendingSuffix})
            </small>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            style={activeTab === 'weather' ? styles.activeBtn : styles.btn}
            onClick={() => setActiveTab('weather')}
          >
            Live Weather
          </button>
          <button
            style={activeTab === 'report' ? styles.activeBtn : styles.btn}
            onClick={() => setActiveTab('report')}
          >
            Report Hazard
          </button>
          <button
            style={activeTab === 'helpline' ? styles.activeBtn : styles.btn}
            onClick={() => setActiveTab('helpline')}
          >
            Helplines
          </button>
          {canApprove && (
            <button
              style={activeTab === 'approvals' ? styles.activeBtn : styles.btn}
              onClick={() => setActiveTab('approvals')}
            >
              Approvals
            </button>
          )}
          <button
            style={activeTab === 'settings' ? styles.activeBtn : styles.btn}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button style={styles.logoutBtn} onClick={onLogout}>
            Logout
          </button>
        </nav>
      </header>

      {/* Warning Notice */}
      <LegalBanner />

      {/* Main Content Area */}
      <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        {activeTab === 'weather' && <WeatherCard />}
        {activeTab === 'report' && <IncidentReport user={user} />}
        {activeTab === 'helpline' && <Helplines user={user} />}
        {activeTab === 'approvals' && canApprove && <Approvals />}
        {activeTab === 'settings' && <Settings user={user} onUserUpdate={onUserUpdate} />}
      </main>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#0f172a', color: '#fff', flexWrap: 'wrap', gap: '0.75rem' },
  btn: { padding: '0.5rem 1rem', background: 'transparent', color: '#cbd5e1', border: 'none', cursor: 'pointer' },
  activeBtn: { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  logoutBtn: { padding: '0.5rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '1rem' }
};

export default Dashboard;
