import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      const next = params.get('next');
      navigate(next || (user.role === 'admin' ? '/admin' : '/account'));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container section">
      <div className="card form-card">
        <div className="text-center" style={{ marginBottom: 20 }}>
          <div className="eyebrow"><span className="dot" />Welcome back</div>
          <h1 style={{ fontSize: '1.6rem' }}>Log In</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="form-note">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
