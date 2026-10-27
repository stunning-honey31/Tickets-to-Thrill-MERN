import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader.jsx';

export default function Messages() {
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState('');

  function load() {
    api.get('/admin/messages').then(({ data }) => setMessages(data.messages)).catch(() => setError('Could not load messages.'));
  }
  useEffect(load, []);

  async function toggleRead(m) {
    await api.put(`/admin/messages/${m._id}`, { read: !m.read });
    load();
  }

  async function handleDelete(m) {
    if (!confirm('Delete this message?')) return;
    await api.delete(`/admin/messages/${m._id}`);
    load();
  }

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!messages) return <Loader />;

  return (
    <div>
      <h1>Messages</h1>
      <div className="grid mt-24" style={{ gap: 14 }}>
        {messages.map((m) => (
          <div className="card" key={m._id} style={{ opacity: m.read ? 0.7 : 1 }}>
            <div className="flex-between">
              <div>
                <strong>{m.subject}</strong>
                <div className="muted" style={{ fontSize: '0.85rem' }}>{m.name} &lt;{m.email}&gt; - {new Date(m.createdAt).toLocaleString()}</div>
              </div>
              {!m.read && <span className="badge badge-pending">unread</span>}
            </div>
            <p className="mt-8">{m.message}</p>
            <div className="flex gap-8">
              <button className="btn btn-ghost btn-sm" onClick={() => toggleRead(m)}>Mark {m.read ? 'unread' : 'read'}</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m)}>Delete</button>
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="muted">No messages yet.</p>}
      </div>
    </div>
  );
}
