import { useState } from 'react';
import api from '../api/axios';

const SUBJECTS = ['General enquiry', 'Booking issue', 'Group booking', 'Feedback', 'Other'];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/contact', form);
      setSent(true);
      setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container section">
      <div className="card form-card">
        <div className="text-center" style={{ marginBottom: 20 }}>
          <div className="eyebrow"><span className="dot" />Get in touch</div>
          <h1 style={{ fontSize: '1.6rem' }}>Contact Us</h1>
        </div>

        {sent && <div className="alert alert-success">Thanks - we've got your message and will get back to you soon.</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <select value={form.subject} onChange={(e) => update('subject', e.target.value)}>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea rows={5} value={form.message} onChange={(e) => update('message', e.target.value)} required minLength={10} maxLength={2000} />
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
