import EmergencyMap from '../components/EmergencyMap';
import { useState, useEffect } from 'react';
import LegalBanner from '../components/LegalBanner';
import WeatherCard from '../components/WeatherCard';
import IncidentReport from '../components/IncidentReport';
import Helplines from '../components/Helplines';
import Settings from '../components/Settings';
import Approvals from '../components/Approvals';
import logo from '../assets/logo.jpeg';
import { updateLocation } from '../lib/api';
import ShelterManager from '../components/ShelterManager';

const APPROVER_ROLES = ['ward_member', 'official', 'admin'];
const SHELTER_ROLES = ['volunteer', 'ward_member', 'official', 'admin'];

function Dashboard({ user, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('weather');
  const canApprove = APPROVER_ROLES.includes(user?.role);

  // Automatically sends live GPS coordinates to backend when user enters Dashboard
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await updateLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
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

  const tabClass = (tab) => (activeTab === tab ? 'tab active' : 'tab');

  return (
    <div className="app-theme dashboard">
      {/* Top Header Bar */}
      <header className="glass topbar">
        <div className="brand">
          <img src={logo} alt="Logo" />
          <div>
            <h2 className="brand-name chrome-dark">NattilAlert</h2>
            <small>
              Logged in as: {displayName} ({roleLabel}{pendingSuffix})
            </small>
          </div>
        </div>

        <nav className="tabs">
          <button className={tabClass('weather')} onClick={() => setActiveTab('weather')}>
            Live Weather
          </button>
          <button className={tabClass('report')} onClick={() => setActiveTab('report')}>
            Report Hazard
          </button>
          <button className={tabClass('helpline')} onClick={() => setActiveTab('helpline')}>
            Helplines
          </button>
          {canApprove && (
            <button className={tabClass('approvals')} onClick={() => setActiveTab('approvals')}>
              Approvals
            </button>
          )}
          {SHELTER_ROLES.includes(user?.role) && (
            <button className={tabClass('shelters')} onClick={() => setActiveTab('shelters')}>
              Shelters
            </button>
          )}
          <button className={tabClass('settings')} onClick={() => setActiveTab('settings')}>
            Settings
          </button>
          <button className="btn btn-alert logout" onClick={onLogout}>
            Logout
          </button>
        </nav>
      </header>

      {/* Warning Notice */}
      <LegalBanner />

      {/* Main Content Area */}
      <main className="main">
        {activeTab === 'weather' && <WeatherCard />}
        {activeTab === 'report' && <IncidentReport user={user} />}
        {activeTab === 'helpline' && <Helplines user={user} />}
        {activeTab === 'approvals' && canApprove && <Approvals />}
        {activeTab === 'shelters' && SHELTER_ROLES.includes(user?.role) && <ShelterManager />}
        {activeTab === 'settings' && <Settings user={user} onUserUpdate={onUserUpdate} />}
        {(activeTab === 'weather' || activeTab === 'shelters') && <EmergencyMap />}
      </main>
    </div>
  );
}

export default Dashboard;
