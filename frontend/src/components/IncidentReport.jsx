import React, { useState } from 'react';
import { Upload } from 'lucide-react';

function IncidentReport({ user }) {
  const [reports, setReports] = useState([
    { id: 1, location: 'Near Central Bridge', description: 'Water level rising quickly.', user: 'Volunteer_01', time: '10 mins ago' }
  ]);
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleAddReport = (e) => {
    e.preventDefault();
    if (!newDesc || !newLocation) return;
    setReports([
      { id: Date.now(), location: newLocation, description: newDesc, user: user?.email || 'Anonymous', time: 'Just now' },
      ...reports
    ]);
    setNewDesc('');
    setNewLocation('');
  };

  return (
    <div style={styles.card}>
      <h3><Upload size={20} /> Upload Ground Incident</h3>
      
      <form style={styles.form} onSubmit={handleAddReport}>
        <input 
          type="text" 
          placeholder="Exact Landmark / Area Location" 
          value={newLocation} 
          onChange={(e) => setNewLocation(e.target.value)} 
          style={styles.input} 
          required 
        />
        <textarea 
          placeholder="Describe exact ground conditions (water level, road status, etc)..." 
          value={newDesc} 
          onChange={(e) => setNewDesc(e.target.value)} 
          style={styles.textarea} 
          required 
        />
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
            Upload Ground Photo:
          </label>
          <input type="file" accept="image/*" style={styles.input} />
        </div>

        <button type="submit" style={styles.submitBtn}>Submit Report</button>
      </form>

      <h4 style={{ marginTop: '2rem' }}>Live Incident Feed</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reports.map((rep) => (
          <div key={rep.id} style={styles.reportCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>📍 {rep.location}</span>
              <small style={{ color: '#64748b' }}>{rep.time}</small>
            </div>
            <p style={{ margin: '0.5rem 0' }}>{rep.description}</p>
            <small style={{ color: '#2563eb' }}>Reported by: {rep.user}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' },
  input: { padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' },
  textarea: { padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '90px' },
  submitBtn: { padding: '0.75rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  reportCard: { backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }
};

export default IncidentReport;