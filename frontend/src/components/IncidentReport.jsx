import React, { useState } from 'react';
import { Upload, MapPin, ThumbsUp, Flag } from 'lucide-react';

function IncidentReport({ user }) {
  const [reports, setReports] = useState([
    { 
      id: 1, 
      location: 'Near Central Bridge, Kochi', 
      description: 'Water level rising quickly near main road.', 
      user: 'Volunteer_01', 
      time: '10 mins ago',
      verifications: 3,
      imageUrl: null
    }
  ]);
  
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleAddReport = (e) => {
    e.preventDefault();
    if (!newDesc || !newLocation) return;

    const newReport = {
      id: Date.now(),
      location: newLocation,
      description: newDesc,
      user: user?.email || 'Anonymous',
      time: 'Just now',
      verifications: 0,
      imageUrl: selectedImage
    };

    setReports([newReport, ...reports]);
    setNewDesc('');
    setNewLocation('');
    setSelectedImage(null);
  };

  const handleVerify = (id) => {
    setReports(reports.map(rep => 
      rep.id === id ? { ...rep, verifications: rep.verifications + 1 } : rep
    ));
  };

  return (
    <div style={styles.card}>
      <h3><Upload size={20} /> Upload Ground Incident</h3>
      
      <form style={styles.form} onSubmit={handleAddReport}>
        <input 
          type="text" 
          placeholder="Exact Landmark / District Location" 
          value={newLocation} 
          onChange={(e) => setNewLocation(e.target.value)} 
          style={styles.input} 
          required 
        />
        <textarea 
          placeholder="Describe ground conditions (water level, road status)..." 
          value={newDesc} 
          onChange={(e) => setNewDesc(e.target.value)} 
          style={styles.textarea} 
          required 
        />
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
            Upload Photo:
          </label>
          <input type="file" accept="image/*" onChange={handleImageChange} style={styles.input} />
          {selectedImage && (
            <img src={selectedImage} alt="Preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', marginTop: '10px', borderRadius: '6px' }} />
          )}
        </div>

        <button type="submit" style={styles.submitBtn}>Submit Alert</button>
      </form>

      <h4 style={{ marginTop: '2rem' }}>Live Community Feed</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reports.map((rep) => (
          <div key={rep.id} style={styles.reportCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span><MapPin size={16} /> {rep.location}</span>
              <small style={{ color: '#64748b' }}>{rep.time}</small>
            </div>
            
            <p style={{ margin: '0.5rem 0' }}>{rep.description}</p>
            
            {rep.imageUrl && (
              <img src={rep.imageUrl} alt="Incident" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '6px', margin: '0.5rem 0' }} />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <small style={{ color: '#2563eb' }}>Reported by: {rep.user}</small>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleVerify(rep.id)} style={styles.verifyBtn}>
                  <ThumbsUp size={14} /> Verify ({rep.verifications})
                </button>
                <button onClick={() => alert("Report flagged for review.")} style={styles.flagBtn}>
                  <Flag size={14} /> Flag
                </button>
              </div>
            </div>
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
  reportCard: { backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' },
  verifyBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.6rem', border: '1px solid #2563eb', color: '#2563eb', background: '#eff6ff', borderRadius: '4px', cursor: 'pointer' },
  flagBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.6rem', border: '1px solid #ef4444', color: '#ef4444', background: '#fef2f2', borderRadius: '4px', cursor: 'pointer' }
};

export default IncidentReport;