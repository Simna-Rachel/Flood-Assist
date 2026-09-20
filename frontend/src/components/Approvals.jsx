import { useEffect, useState } from 'react';
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
    <div className="glass">
      <h3 className="panel-title"><ClipboardCheck size={20} /> Pending Role Requests</h3>

      {loading && <p className="muted">Loading requests...</p>}
      {error && <div className="note note-error">{error}</div>}

      {!loading && requests.length === 0 && !error && (
        <p className="muted">No pending requests right now.</p>
      )}

      <div className="feed" style={{ gap: '0.75rem', marginTop: '1rem' }}>
        {requests.map((r) => (
          <div key={r._id} className="inset req-row">
            <div>
              <strong>{r.name}</strong>
              <div className="muted small">{r.email} {r.phone ? `· ${r.phone}` : ''}</div>
              <div className="small" style={{ color: 'var(--link)', fontWeight: 700, marginTop: '4px' }}>
                Requesting: {ROLE_LABELS[r.requestedRole] || r.requestedRole}
              </div>
              <div className="muted meta-line" style={{ fontSize: '0.75rem' }}>
                <Clock size={12} /> {r.roleRequestedAt ? new Date(r.roleRequestedAt).toLocaleString() : ''}
              </div>
            </div>
            <div className="row-actions">
              <button
                className="chip ok"
                disabled={busyId === r._id}
                onClick={() => handleApprove(r._id)}
              >
                <Check size={14} /> Approve
              </button>
              <button
                className="chip bad"
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

export default Approvals;
