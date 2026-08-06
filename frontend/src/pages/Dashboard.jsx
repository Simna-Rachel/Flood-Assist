import React, { useState, useEffect } from 'react';
import LegalBanner from '../components/LegalBanner';
import WeatherCard from '../components/WeatherCard';
import IncidentReport from '../components/IncidentReport';
import Helplines from '../components/Helplines';
import logo from '../assets/logo.jpeg';

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('weather');

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

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Header Bar */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>NattilAlert</h2>
            <small style={{ color: '#93c5fd', fontSize: '0.8rem' }}>
              Logged in as: {user?.fullName || user?.email} ({user?.role || 'Citizen'})
            </small>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
      </main>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#0f172a', color: '#fff' },
  btn: { padding: '0.5rem 1rem', background: 'transparent', color: '#cbd5e1', border: 'none', cursor: 'pointer' },
  activeBtn: { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  logoutBtn: { padding: '0.5rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '1rem' }
};

export default Dashboard;