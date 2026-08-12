import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Check, X, Clock } from 'lucide-react';
import { fetchPendingRequests, approveRequest, rejectRequest } from '../lib/api';

const ROLE_LABELS = {
  volunteer: 'Volunteer',
  ward_member: 'Local Representative / Ward Member',
  official: 'Emergency Official'
};

function Approvals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPendingRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Could not load pending requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      await approveRequest(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejecting this request (optional):') || '';
    setBusyId(id);
    try {
      await rejectRequest(id, reason);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}><ClipboardCheck size={20} /> Pending Role Requests</h3>

      {loading && <p style={{ color: '#64748b' }}>Loading requests...</p>}
      {error && <div style={styles.errorBox}>{error}</div>}

      {!loading && requests.length === 0 && !error && (
        <p style={{ color: '#64748b' }}>No pending requests right now.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
        {requests.map((r) => (
          <div key={r._id} style={styles.row}>
            <div>
              <strong>{r.name}</strong>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{r.email} {r.phone ? `· ${r.phone}` : ''}</div>
              <div style={{ fontSize: '0.85rem', color: '#2563eb', marginTop: '4px' }}>
                Requesting: {ROLE_LABELS[r.requestedRole] || r.requestedRole}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Clock size={12} /> {r.roleRequestedAt ? new Date(r.roleRequestedAt).toLocaleString() : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                style={styles.approveBtn}
                disabled={busyId === r._id}
                onClick={() => handleApprove(r._id)}
              >
                <Check size={14} /> Approve
              </button>
              <button
                style={styles.rejectBtn}
                disabled={busyId === r._id}
                onClick={() => handleReject(r._id)}
              >
                <X size={14} /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  heading: { display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 0.5rem 0' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' },
  approveBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.7rem', border: '1px solid #16a34a', color: '#16a34a', background: '#f0fdf4', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  rejectBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.7rem', border: '1px solid #ef4444', color: '#ef4444', background: '#fef2f2', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  errorBox: { padding: '0.6rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.82rem', color: '#991b1b', marginTop: '0.5rem' }
};

export default Approvals;
