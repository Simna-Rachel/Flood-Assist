import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Mail, Save, ShieldCheck, Clock, XCircle, Loader2 } from 'lucide-react';
import { updateMe, requestRoleChange, saveSession, getSession, fetchMe } from '../lib/api';

const ROLE_LABELS = {
  citizen: 'Citizen',
  volunteer: 'Volunteer',
  ward_member: 'Local Representative / Ward Member',
  official: 'Emergency Official',
  admin: 'Admin'
};

const REQUESTABLE = [
  { value: 'volunteer', label: '🦺 Volunteer' },
  { value: 'ward_member', label: '🏛️ Local Representative / Ward Member' },
  { value: 'official', label: '🚨 Emergency Official' }
];

function Settings({ user, onUserUpdate }) {
  // Show cached values instantly, then overwrite with the fresh copy from the server below.
  const [profile, setProfile] = useState(user);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [name, setName] = useState(user?.name || user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');

  const [requestedRole, setRequestedRole] = useState('volunteer');
  const [requesting, setRequesting] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');
  const [requestErr, setRequestErr] = useState('');

  // 1. Sync input fields whenever profile object updates
  useEffect(() => {
    if (profile) {
      // Check all potential backend field names for name, phone, and address
      const resolvedName = profile.name || profile.fullName || profile.username || '';
      const resolvedPhone = profile.phone || profile.phoneNumber || profile.mobile || '';
      const resolvedAddress = profile.address || profile.location || profile.district || '';

      setName(resolvedName);
      setPhone(resolvedPhone);
      setAddress(resolvedAddress);
    }
  }, [profile]);

  // 2. Fetch fresh user data from API on component mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const fresh = await fetchMe();
        if (cancelled) return;

        console.log('Fetched Profile Data:', fresh); // Check DevTools console to see exact backend keys!

        setProfile(fresh);

        const session = getSession();
        saveSession(session?.token, fresh);

        // Safe fallback so we don't pass undefined
        const displayName = fresh.name || fresh.fullName || fresh.username || '';
        onUserUpdate({ ...fresh, name: displayName, fullName: displayName });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    setSaveErr('');
    try {
      const updated = await updateMe({ name, phone, address });
      const session = getSession();
      saveSession(session?.token, updated);
      setProfile(updated);
      onUserUpdate({ ...updated, fullName: updated.name });
      setSaveMsg('Profile updated.');
    } catch (err) {
      setSaveErr(err.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestRole = async (e) => {
    e.preventDefault();
    setRequesting(true);
    setRequestMsg('');
    setRequestErr('');
    try {
      const updated = await requestRoleChange(requestedRole);
      const session = getSession();
      saveSession(session?.token, updated);
      setProfile(updated);
      onUserUpdate({ ...updated, fullName: updated.name });
      setRequestMsg(`Request submitted. You'll stay a Citizen until it's approved.`);
    } catch (err) {
      setRequestErr(err.message || 'Could not submit request.');
    } finally {
      setRequesting(false);
    }
  };

  const roleStatus = profile?.roleStatus;
  const isCitizen = profile?.role === 'citizen';

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h3 style={styles.heading}>
          <User size={20} /> Profile {loadingProfile && <Loader2 size={14} style={{ marginLeft: '6px' }} />}
        </h3>

        <form onSubmit={handleSave} style={styles.form}>
          <label style={styles.label}>Username</label>
          <div style={styles.inputGroup}>
            <User size={16} color="#64748b" />
            <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <label style={styles.label}>Email</label>
          <div style={{ ...styles.inputGroup, backgroundColor: '#f8fafc' }}>
            <Mail size={16} color="#94a3b8" />
            <input style={{ ...styles.input, color: '#94a3b8' }} value={profile?.email || ''} disabled />
          </div>
          <small style={{ color: '#94a3b8' }}>Email can't be changed here — it's your login ID.</small>

          <label style={styles.label}>Phone Number</label>
          <div style={styles.inputGroup}>
            <Phone size={16} color="#64748b" />
            <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Add a phone number" />
          </div>

          <label style={styles.label}>Address / District</label>
          <div style={styles.inputGroup}>
            <MapPin size={16} color="#64748b" />
            <input style={styles.input} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Add your address" />
          </div>

          {saveErr && <div style={styles.errorBox}>{saveErr}</div>}
          {saveMsg && <div style={styles.infoBox}>{saveMsg}</div>}

          <button type="submit" style={styles.saveBtn} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div style={{ ...styles.card, marginTop: '1.5rem' }}>
        <h3 style={styles.heading}><ShieldCheck size={20} /> Role & Verification</h3>

        <div style={styles.roleRow}>
          <span>Current role:</span>
          <strong>{ROLE_LABELS[profile?.role] || profile?.role}</strong>
        </div>

        {roleStatus === 'pending' && (
          <div style={styles.pendingBox}>
            <Clock size={16} />
            <span>Your request to become a <strong>{ROLE_LABELS[profile?.requestedRole]}</strong> is pending approval.</span>
          </div>
        )}

        {roleStatus === 'rejected' && (
          <div style={styles.rejectedBox}>
            <XCircle size={16} />
            <span>Your last role request was rejected{profile?.roleRejectionReason ? `: ${profile.roleRejectionReason}` : '.'} You can request again below.</span>
          </div>
        )}

        {isCitizen && roleStatus !== 'pending' && (
          <form onSubmit={handleRequestRole} style={{ ...styles.form, marginTop: '1rem' }}>
            <label style={styles.label}>Request a role upgrade</label>
            <div style={styles.inputGroup}>
              <select
                value={requestedRole}
                onChange={(e) => setRequestedRole(e.target.value)}
                style={{ ...styles.input, backgroundColor: '#fff', cursor: 'pointer' }}
              >
                {REQUESTABLE.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <small style={{ color: '#64748b' }}>
              Volunteer requests are approved by a Ward Member or above. Ward Member and Official requests are approved by an Official/Admin.
            </small>

            {requestErr && <div style={styles.errorBox}>{requestErr}</div>}
            {requestMsg && <div style={styles.infoBox}>{requestMsg}</div>}

            <button type="submit" style={styles.saveBtn} disabled={requesting}>
              {requesting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column' },
  card: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  heading: { display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1rem 0' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.8rem', color: '#475569', marginTop: '0.6rem', fontWeight: 'bold' },
  inputGroup: { display: 'flex', alignItems: 'center', gap: '0.6rem', border: '1px solid #cbd5e1', padding: '0.6rem 0.8rem', borderRadius: '6px' },
 input: { 
  border: 'none', 
  outline: 'none', 
  width: '100%', 
  fontSize: '0.9rem', 
  background: 'transparent',
  color: '#0f172a' // Add dark text color here
},
  saveBtn: { marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.7rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  errorBox: { padding: '0.6rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.82rem', color: '#991b1b' },
  infoBox: { padding: '0.6rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '0.82rem', color: '#1e40af' },
  roleRow: { display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' },
  pendingBox: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem', padding: '0.7rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', fontSize: '0.85rem', color: '#92400e' },
  rejectedBox: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem', padding: '0.7rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.85rem', color: '#991b1b' }
};

export default Settings;