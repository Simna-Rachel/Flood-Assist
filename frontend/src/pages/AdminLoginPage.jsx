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
    <div className="auth-wrap">
      <div className="glass auth-card">

        <div className="auth-head">
          <img src={logo} alt="Logo" className="auth-logo" />

          <h1 className="auth-title sm chrome-dark">
            Admin Sign In
          </h1>

          <p className="auth-sub">
            Flood Assist administration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form">

          {/* EMAIL */}
          <div className="field">
            <ShieldCheck size={18} />
            <input
              type="email"
              placeholder="Admin email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="field">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="note note-error">
              {error}
            </div>
          )}

          {/* SIGN IN BUTTON */}
          <button
            type="submit"
            className="btn btn-sea btn-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                Signing in...
              </>
            ) : (
              'Sign in as admin'
            )}
          </button>

        </form>

        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={onBack}
          className="text-btn"
        >
          Back to standard sign in
        </button>

      </div>
    </div>
  );
}

export default AdminLoginPage;
