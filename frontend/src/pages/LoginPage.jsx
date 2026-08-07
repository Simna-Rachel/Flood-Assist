import React, { useState } from 'react';
import { User, Lock, Phone, MapPin, ShieldAlert, Loader2 } from 'lucide-react';
import logo from '../assets/logo.jpeg';
import { registerUser, loginUser, saveSession } from '../lib/api';

function LoginPage({ onLogin }) {
  const [isNewUser, setIsNewUser] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('Citizen');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // UI still shows friendly labels; map them to backend role keys.
  const ROLE_MAP = {
    'Citizen': 'citizen',
    'Volunteer': 'volunteer',
    'Local Representative': 'ward_member',
    'Official': 'official'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (isNewUser) {
        const requestedRole = ROLE_MAP[role] || 'citizen';
        const data = await registerUser({
          name: fullName,
          email,
          phone,
          address,
          password,
          requestedRole
        });

        saveSession(data.token, data.user);

        if (requestedRole !== 'citizen') {
          setInfo(
            `Account created. You're active as a Citizen for now — your request to become a ${role} is pending approval.`
          );
        }

        onLogin(data.user);
      } else {
        const data = await loginUser({ email, password });
        saveSession(data.token, data.user);
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img src={logo} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
            NattilAlert
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            {isNewUser ? 'Create a New Citizen Account' : 'Sign In to Disaster Portal'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {isNewUser && (
            <>
              <div style={styles.inputGroup}>
                <User size={18} color="#64748b" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <Phone size={18} color="#64748b" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <MapPin size={18} color="#64748b" />
                <input
                  type="text"
                  placeholder="District / Residence Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              {/* Account Type Selection */}
              <div style={styles.inputGroup}>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ ...styles.input, backgroundColor: '#fff', cursor: 'pointer' }}
                >
                  <option value="Citizen">🏠 Citizen</option>
                  <option value="Volunteer">🦺 Volunteer</option>
                  <option value="Local Representative">🏛️ Local Representative / Ward Member</option>
                  <option value="Official">🚨 Emergency Official</option>
                </select>
              </div>
              {role !== 'Citizen' && (
                <p style={styles.roleNotice}>
                  You'll sign up as a Citizen immediately, and your request to become a {role} will be sent for approval.
                </p>
              )}
            </>
          )}

          <div style={styles.inputGroup}>
            <User size={18} color="#64748b" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={18} color="#64748b" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
            />
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}
          {info && <div style={styles.infoBox}>{info}</div>}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%' }}>
                <Loader2 size={16} className="spin" /> Please wait...
              </span>
            ) : (
              isNewUser ? 'Register Account' : 'Sign In'
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
          {isNewUser ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            onClick={() => { setIsNewUser(!isNewUser); setError(''); setInfo(''); }}
            style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isNewUser ? 'Sign In' : 'Sign Up'}
          </span>
        </p>

        <div style={styles.warningBox}>
          <ShieldAlert size={18} color="#dc2626" />
          <span>Strict identity verification active. Fake reporting is punishable by law.</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f172a', padding: '1rem' },
  card: { backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  inputGroup: { display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #cbd5e1', padding: '0.75rem 1rem', borderRadius: '6px' },
  input: { border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem' },
  submitBtn: { width: '100%', padding: '0.8rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  warningBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.8rem', color: '#991b1b' },
  errorBox: { padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.85rem', color: '#991b1b' },
  infoBox: { padding: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '0.85rem', color: '#1e40af' },
  roleNotice: { fontSize: '0.8rem', color: '#64748b', margin: '-0.5rem 0 0 0', lineHeight: 1.4 }
};

export default LoginPage;
