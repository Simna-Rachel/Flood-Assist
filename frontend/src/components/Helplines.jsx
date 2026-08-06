import React, { useState } from 'react';
import { PhoneCall, Building2, PlusCircle } from 'lucide-react';

function Helplines({ user }) {
  const [shelters, setShelters] = useState([
    { id: 1, district: 'Ernakulam', name: "St. Albert's Camp", contact: '9876543210', addedBy: 'Ward Member (Div 12)' },
    { id: 2, district: 'Wayanad', name: 'GHSS Kalpetta Camp', contact: '9876543211', addedBy: 'Volunteer_01' }
  ]);

  const [newDistrict, setNewDistrict] = useState('');
  const [newCampName, setNewCampName] = useState('');
  const [newContact, setNewContact] = useState('');

  const handleAddShelter = (e) => {
    e.preventDefault();
    if (!newDistrict || !newCampName) return;

    const newEntry = {
      id: Date.now(),
      district: newDistrict,
      name: newCampName,
      contact: newContact || 'N/A',
      addedBy: `${user?.fullName || 'User'} (${user?.role || 'Citizen'})`
    };

    setShelters([newEntry, ...shelters]);
    setNewDistrict('');
    setNewCampName('');
    setNewContact('');
  };

  return (
    <div style={styles.container}>
      {/* Emergency Control Rooms */}
      <div style={styles.card}>
        <h3><PhoneCall size={20} /> Emergency Control Rooms</h3>
        <ul style={styles.gridList}>
          <li><strong>State Emergency:</strong> 1070</li>
          <li><strong>District Control Room:</strong> 1077</li>
          <li><strong>Police Emergency:</strong> 112</li>
          <li><strong>Fire & Rescue:</strong> 101</li>
        </ul>
      </div>

      {/* Add Shelter Form */}
      <div style={{ ...styles.card, marginTop: '1.5rem' }}>
        <h3><PlusCircle size={20} /> Add Active Relief Shelter</h3>
        <form onSubmit={handleAddShelter} style={styles.form}>
          <input 
            type="text" 
            placeholder="District / Area (e.g. Ernakulam)" 
            value={newDistrict} 
            onChange={(e) => setNewDistrict(e.target.value)} 
            style={styles.input} 
            required 
          />
          <input 
            type="text" 
            placeholder="Camp Name (e.g. Town Hall Relief Camp)" 
            value={newCampName} 
            onChange={(e) => setNewCampName(e.target.value)} 
            style={styles.input} 
            required 
          />
          <input 
            type="text" 
            placeholder="Camp Helpline / Contact Number" 
            value={newContact} 
            onChange={(e) => setNewContact(e.target.value)} 
            style={styles.input} 
          />
          <button type="submit" style={styles.submitBtn}>Publish Camp Details</button>
        </form>
      </div>

      {/* Live Active Camps Directory */}
      <div style={{ ...styles.card, marginTop: '1.5rem' }}>
        <h3><Building2 size={20} /> Active Relief Camps Directory</h3>
        <div style={styles.shelterGrid}>
          {shelters.map((camp) => (
            <div key={camp.id} style={styles.shelterCard}>
              <span style={styles.badge}>{camp.district}</span>
              <h4 style={{ margin: '0.5rem 0' }}>{camp.name}</h4>
              <p style={{ fontSize: '0.9rem', color: '#475569' }}>📞 {camp.contact}</p>
              <small style={{ color: '#2563eb', marginTop: '0.5rem', display: 'block' }}>
                Posted by: {camp.addedBy}
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  gridList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', listStyle: 'none', padding: 0, marginTop: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' },
  input: { padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' },
  submitBtn: { padding: '0.75rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  shelterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' },
  shelterCard: { backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' },
  badge: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }
};

export default Helplines;