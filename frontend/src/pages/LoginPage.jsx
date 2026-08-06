import React, { useState } from 'react';
import { User, Lock, Phone, MapPin, ShieldAlert } from 'lucide-react';
import logo from '../assets/logo.jpeg';

function LoginPage({ onLogin }) {
  const [isNewUser, setIsNewUser] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('Citizen');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const userRole = isNewUser ? role : (localStorage.getItem(`role_${email}`) || 'Citizen');
    const name = isNewUser ? fullName : (localStorage.getItem(`name_${email}`) || email.split('@')[0]);

    const userData = {
      email,
      fullName: name,
      phone,
      address,
      role: userRole
    };

    // Store basic profile locally for future logins
    if (isNewUser) {
      localStorage.setItem(`name_${email}`, fullName);
      localStorage.setItem(`phone_${email}`, phone);
      localStorage.setItem(`role_${email}`, role);
    }

    onLogin(userData);
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
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            {isNewUser ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
          {isNewUser ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span 
            onClick={() => setIsNewUser(!isNewUser)} 
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
  warningBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.8rem', color: '#991b1b' }
};

export default LoginPage;