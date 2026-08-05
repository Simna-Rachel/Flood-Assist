import React, { useState } from 'react';
import LegalBanner from '../components/LegalBanner';
import WeatherCard from '../components/WeatherCard';
import IncidentReport from '../components/IncidentReport';
import Helplines from '../components/Helplines';

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('weather');

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Header Bar */}
      <header style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>🌊 Flood Assist</h2>
          <small style={{ color: '#93c5fd' }}>Logged in as: {user?.email}</small>
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
        {activeTab === 'helpline' && <Helplines />}
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