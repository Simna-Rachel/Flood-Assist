import { useState, useEffect } from 'react';
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
    <div className="stack">
      <div className="glass">
        <h3 className="panel-title">
          <User size={20} /> Profile {loadingProfile && <Loader2 size={14} className="spin" style={{ marginLeft: '6px' }} />}
        </h3>

        <form onSubmit={handleSave} className="form tight">
          <label className="label">Username</label>
          <div className="field">
            <User size={16} />
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <label className="label">Email</label>
          <div className="field disabled">
            <Mail size={16} />
            <input value={profile?.email || ''} disabled />
          </div>
          <small className="muted">Email can't be changed here — it's your login ID.</small>

          <label className="label">Phone Number</label>
          <div className="field">
            <Phone size={16} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Add a phone number" />
          </div>

          <label className="label">Address / District</label>
          <div className="field">
            <MapPin size={16} />
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Add your address" />
          </div>

          {saveErr && <div className="note note-error" style={{ marginTop: '0.6rem' }}>{saveErr}</div>}
          {saveMsg && <div className="note note-info" style={{ marginTop: '0.6rem' }}>{saveMsg}</div>}

          <button type="submit" className="btn btn-aqua btn-block" style={{ marginTop: '0.9rem' }} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="glass">
        <h3 className="panel-title"><ShieldCheck size={20} /> Role & Verification</h3>

        <div className="role-row">
          <span className="soft">Current role:</span>
          <strong>{ROLE_LABELS[profile?.role] || profile?.role}</strong>
        </div>

        {roleStatus === 'pending' && (
          <div className="note note-warn" style={{ marginTop: '0.9rem' }}>
            <Clock size={16} />
            <span>Your request to become a <strong>{ROLE_LABELS[profile?.requestedRole]}</strong> is pending approval.</span>
          </div>
        )}

        {roleStatus === 'rejected' && (
          <div className="note note-error" style={{ marginTop: '0.9rem' }}>
            <XCircle size={16} />
            <span>Your last role request was rejected{profile?.roleRejectionReason ? `: ${profile.roleRejectionReason}` : '.'} You can request again below.</span>
          </div>
        )}

        {isCitizen && roleStatus !== 'pending' && (
          <form onSubmit={handleRequestRole} className="form tight" style={{ marginTop: '1rem' }}>
            <label className="label">Request a role upgrade</label>
            <div className="field">
              <select
                value={requestedRole}
                onChange={(e) => setRequestedRole(e.target.value)}
              >
                {REQUESTABLE.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <small className="muted">
              Volunteer requests are approved by a Ward Member or above. Ward Member and Official requests are approved by an Official/Admin.
            </small>

            {requestErr && <div className="note note-error" style={{ marginTop: '0.6rem' }}>{requestErr}</div>}
            {requestMsg && <div className="note note-info" style={{ marginTop: '0.6rem' }}>{requestMsg}</div>}

            <button type="submit" className="btn btn-aqua btn-block" style={{ marginTop: '0.9rem' }} disabled={requesting}>
              {requesting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Settings;
