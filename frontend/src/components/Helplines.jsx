import React, { useState, useEffect } from 'react';
import { PhoneCall, Building2, PlusCircle, Loader2, Lock } from 'lucide-react';
import { fetchShelters, createShelterEntry, getCurrentPosition } from '../lib/api';

const CAN_PUBLISH_ROLES = ['volunteer', 'ward_member', 'official', 'admin'];

function Helplines({ user }) {
  const [shelters, setShelters] = useState([]);
  const [loadingShelters, setLoadingShelters] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [newDistrict, setNewDistrict] = useState('');
  const [newCampName, setNewCampName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const canPublish = CAN_PUBLISH_ROLES.includes(user?.role);

  const loadShelters = async () => {
    setLoadingShelters(true);
    setLoadError('');
    try {
      const data = await fetchShelters();
      setShelters(data.data || []);
    } catch (err) {
      setLoadError(err.message || 'Could not load shelters.');
    } finally {
      setLoadingShelters(false);
    }
  };

  useEffect(() => { loadShelters(); }, []);

  const handleAddShelter = async (e) => {
    e.preventDefault();
    if (!newDistrict || !newCampName || !newContact || !newCapacity) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const { lat, lng } = await getCurrentPosition();

      const created = await createShelterEntry({
        nameEn: newCampName,
        district: newDistrict,
        lat,
        lng,
        capacity: newCapacity,
        contactPhone: newContact
      });

      setShelters([created.data, ...shelters]);
      setNewDistrict('');
      setNewCampName('');
      setNewContact('');
      setNewCapacity('');
    } catch (err) {
      setSubmitError(err.message || 'Could not publish shelter.');
    } finally {
      setSubmitting(false);
    }
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

      {/* Add Shelter Form — restricted to Volunteer and above */}
      <div style={{ ...styles.card, marginTop: '1.5rem' }}>
        <h3><PlusCircle size={20} /> Add Active Relief Shelter</h3>

        {canPublish ? (
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
              type="number"
              min="1"
              placeholder="Capacity (number of people)"
              value={newCapacity}
              onChange={(e) => setNewCapacity(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Camp Helpline / Contact Number"
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              style={styles.input}
              required
            />

            {submitError && <div style={styles.errorBox}>{submitError}</div>}

            <button type="submit" style={styles.submitBtn} disabled={submitting}>
              {submitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%' }}>
                  <Loader2 size={16} /> Publishing...
                </span>
              ) : 'Publish Camp Details'}
            </button>
          </form>
        ) : (
          <div style={styles.lockedBox}>
            <Lock size={16} />
            <span>Only Volunteers, Ward Members, and Officials can publish shelters. Ask your Ward Member to add one, or request a Volunteer role in Settings.</span>
          </div>
        )}
      </div>

      {/* Live Active Camps Directory */}
      <div style={{ ...styles.card, marginTop: '1.5rem' }}>
        <h3><Building2 size={20} /> Active Relief Camps Directory</h3>

        {loadingShelters && <p style={{ color: '#64748b' }}>Loading shelters...</p>}
        {loadError && <div style={styles.errorBox}>{loadError}</div>}
        {!loadingShelters && shelters.length === 0 && !loadError && (
          <p style={{ color: '#64748b' }}>No shelters published yet.</p>
        )}

        <div style={styles.shelterGrid}>
          {shelters.map((camp) => (
            <div key={camp._id} style={styles.shelterCard}>
              <span style={styles.badge}>{camp.district}</span>
              <h4 style={{ margin: '0.5rem 0' }}>{camp.nameEn}</h4>
              <p style={{ fontSize: '0.9rem', color: '#475569' }}>📞 {camp.contactPhone}</p>
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>👥 Capacity: {camp.capacity} ({camp.currentOccupancy || 0} occupied)</p>
              <small style={{ color: '#2563eb', marginTop: '0.5rem', display: 'block' }}>
                Posted by: {camp.addedBy?.name || 'Unknown'} ({(camp.addedBy?.role || '').replace('_', ' ')})
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
  badge: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  lockedBox: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem', padding: '0.9rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', color: '#475569' },
  errorBox: { padding: '0.6rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.82rem', color: '#991b1b' }
};

export default Helplines;
