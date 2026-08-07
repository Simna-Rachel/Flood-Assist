import React, { useState, useEffect } from 'react';
import { Upload, MapPin, ThumbsUp, Flag, Loader2 } from 'lucide-react';
import { fetchHazards, createHazardReport, getCurrentPosition } from '../lib/api';

const HAZARD_TYPES = ['Flooding', 'Waterlogging', 'Landslide Risk', 'Road Blocked', 'Power Outage', 'Other'];

function IncidentReport({ user }) {
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [hazardType, setHazardType] = useState(HAZARD_TYPES[0]);
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const loadReports = async () => {
    setLoadingReports(true);
    setLoadError('');
    try {
      const data = await fetchHazards();
      setReports(data);
    } catch (err) {
      setLoadError(err.message || 'Could not load reports.');
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => { loadReports(); }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    if (!newDesc || !newLocation) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const { lat, lng } = await getCurrentPosition();

      const created = await createHazardReport({
        hazardType,
        description: newDesc,
        locationLabel: newLocation,
        latitude: lat,
        longitude: lng
      });

      setReports([created, ...reports]);
      setNewDesc('');
      setNewLocation('');
      setSelectedImage(null);
      // Note: photo uploads are preview-only for now — there's no file
      // storage on the backend yet, so images aren't saved with the report.
    } catch (err) {
      setSubmitError(err.message || 'Could not submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = (id) => {
    // Verification counts are UI-only for now (not yet persisted to the backend).
    setReports(reports.map(rep =>
      rep._id === id ? { ...rep, _localVerifications: (rep._localVerifications || 0) + 1 } : rep
    ));
  };

  return (
    <div style={styles.card}>
      <h3><Upload size={20} /> Upload Ground Incident</h3>

      <form style={styles.form} onSubmit={handleAddReport}>
        <div style={styles.inputGroup}>
          <select value={hazardType} onChange={(e) => setHazardType(e.target.value)} style={{ ...styles.input, backgroundColor: '#fff' }}>
            {HAZARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

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

        {submitError && <div style={styles.errorBox}>{submitError}</div>}

        <button type="submit" style={styles.submitBtn} disabled={submitting}>
          {submitting ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%' }}>
              <Loader2 size={16} /> Submitting...
            </span>
          ) : 'Submit Alert'}
        </button>
      </form>

      <h4 style={{ marginTop: '2rem' }}>Live Community Feed</h4>

      {loadingReports && <p style={{ color: '#64748b' }}>Loading reports...</p>}
      {loadError && <div style={styles.errorBox}>{loadError}</div>}
      {!loadingReports && reports.length === 0 && !loadError && (
        <p style={{ color: '#64748b' }}>No active reports yet — be the first to report ground conditions.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reports.map((rep) => (
          <div key={rep._id} style={styles.reportCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span><MapPin size={16} /> {rep.locationLabel || 'Unspecified location'} · <small style={{ fontWeight: 'normal', color: '#dc2626' }}>{rep.hazardType}</small></span>
              <small style={{ color: '#64748b' }}>{rep.createdAt ? new Date(rep.createdAt).toLocaleString() : ''}</small>
            </div>

            <p style={{ margin: '0.5rem 0' }}>{rep.description}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <small style={{ color: '#2563eb' }}>Reported by: {rep.reportedBy?.name || 'Anonymous'}</small>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleVerify(rep._id)} style={styles.verifyBtn}>
                  <ThumbsUp size={14} /> Verify ({rep._localVerifications || 0})
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
  flagBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.6rem', border: '1px solid #ef4444', color: '#ef4444', background: '#fef2f2', borderRadius: '4px', cursor: 'pointer' },
  errorBox: { padding: '0.6rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.82rem', color: '#991b1b' },
  inputGroup: { display: 'flex', alignItems: 'center', gap: '0.75rem' }
};

export default IncidentReport;
