import React, { useState } from 'react';
import { User, Lock, ShieldAlert } from 'lucide-react';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      // Allows logging in with ANY entered credentials for testing
      onLogin({ email });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>🌊 Flood Assist</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Kerala Emergency Response & Disaster Alert Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <User size={18} color="#64748b" />
            <input 
              type="email" 
              placeholder="Enter any email..." 
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
              placeholder="Enter any password..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            Sign In (Demo Mode)
          </button>
        </form>

        <div style={styles.warningBox}>
          <ShieldAlert size={18} color="#dc2626" />
          <span>
            Strict identity verification active. Misuse or fake reporting is punishable by law.
          </span>
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