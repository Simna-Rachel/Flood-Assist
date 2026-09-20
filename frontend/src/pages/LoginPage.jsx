import { useState } from 'react';
import { User, Lock, Phone, MapPin, ShieldAlert, Loader2 } from 'lucide-react';
import logo from '../assets/logo.jpeg';
import { registerUser, loginUser, saveSession } from '../lib/api';

function LoginPage({ onLogin, onAdminLogin }) {
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
    <div className="auth-wrap">
      <div className="glass auth-card">
        <div className="auth-head">
          <img src={logo} alt="Logo" className="auth-logo" />
          <h1 className="auth-title chrome-dark">
            NattilAlert
          </h1>
          <p className="auth-sub">
            {isNewUser ? 'Create a New Citizen Account' : 'Sign In to Disaster Portal'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {isNewUser && (
            <>
              <div className="field">
                <User size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <Phone size={18} />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <MapPin size={18} />
                <input
                  type="text"
                  placeholder="District / Residence Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              {/* Account Type Selection */}
              <div className="field">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Citizen">🏠 Citizen</option>
                  <option value="Volunteer">🦺 Volunteer</option>
                  <option value="Local Representative">🏛️ Local Representative / Ward Member</option>
                  <option value="Official">🚨 Emergency Official</option>
                </select>
              </div>
              {role !== 'Citizen' && (
                <p className="role-notice">
                  You'll sign up as a Citizen immediately, and your request to become a {role} will be sent for approval.
                </p>
              )}
            </>
          )}

          <div className="field">
            <User size={18} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className="note note-error">{error}</div>}
          {info && <div className="note note-info">{info}</div>}

          <button type="submit" className="btn btn-aqua btn-block" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="spin" /> Please wait...
              </>
            ) : (
              isNewUser ? 'Register Account' : 'Sign In'
            )}
          </button>
        </form>

        <p className="auth-foot">
          {isNewUser ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            onClick={() => { setIsNewUser(!isNewUser); setError(''); setInfo(''); }}
            className="link"
          >
            {isNewUser ? 'Sign In' : 'Sign Up'}
          </span>
        </p>

        <div className="note note-error auth-warning">
          <ShieldAlert size={18} color="#dc2626" />
          <span>Strict identity verification active. Fake reporting is punishable by law.</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
