import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/account');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container section">
      <div className="card form-card">
        <div className="text-center" style={{ marginBottom: 20 }}>
          <div className="eyebrow"><span className="dot" />Join the park</div>
          <h1 style={{ fontSize: '1.6rem' }}>Create an Account</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input value={form.name} onChange={(e) => update('name', e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Phone (optional)</label>
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={8} />
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="form-note">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
