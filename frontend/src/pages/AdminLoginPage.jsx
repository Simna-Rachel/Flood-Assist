import { useState } from 'react';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';
import logo from '../assets/logo.jpeg';
import { loginAdmin, saveSession } from '../lib/api';

function AdminLoginPage({ onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginAdmin({ email, password });
      saveSession(data.token, data.user);
      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Unable to sign in as admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Dynamic keyframe injection for Loader2 animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.heading}>
          <img src={logo} alt="Logo" style={styles.logo} />
          <h1 style={styles.title}>Admin Sign In</h1>
          <p style={styles.subtitle}>Flood Assist administration</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <ShieldCheck size={18} color="#64748b" />
            <input
              type="email"
              placeholder="Admin email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              onChange={(event) => setPassword(event.target.value)}
              required
              style={styles.input}
            />
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              ...(loading ? styles.submitBtnDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loadingText}>
                <Loader2 size={16} className="spinner" /> Signing in...
              </span>
            ) : (
              'Sign in as admin'
            )}
          </button>
        </form>

        <button type="button" onClick={onBack} style={styles.backBtn}>
          Back to standard sign in
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '1rem',
    backgroundColor: '#f8fafc',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '2.5rem',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  logo: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  title: {
    color: '#0f172a',
    margin: '0.5rem 0 0.25rem 0',
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.9rem',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    border: '1px solid #cbd5e1',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    backgroundColor: '#fff',
  },
  input: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.95rem',
    color: '#0f172a',
    backgroundColor: 'transparent',
  },
  submitBtn: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#0f766e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'background-color 0.2s ease',
  },
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed',
  },
  loadingText: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
  },
  errorBox: {
    padding: '0.75rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: '#991b1b',
  },
  backBtn: {
    display: 'block',
    margin: '1.25rem auto 0',
    padding: 0,
    border: 'none',
    background: 'none',
    color: '#475569',
    cursor: 'pointer',
    fontSize: '0.85rem',
    textDecoration: 'underline',
  },
};

export default AdminLoginPage;