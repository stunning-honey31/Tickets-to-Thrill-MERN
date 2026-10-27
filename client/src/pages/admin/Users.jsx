import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Users() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const { user: me } = useAuth();

  function load() {
    api.get('/admin/users').then(({ data }) => setUsers(data.users)).catch(() => setError('Could not load users.'));
  }
  useEffect(load, []);

  async function toggleRole(u) {
    const role = u.role === 'admin' ? 'user' : 'admin';
    await api.put(`/admin/users/${u._id}/role`, { role });
    load();
  }

  async function handleDelete(u) {
    if (!confirm(`Delete ${u.name}? This also removes their bookings.`)) return;
    await api.delete(`/admin/users/${u._id}`);
    load();
  }

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!users) return <Loader />;

  return (
    <div>
      <h1>Users</h1>
      <div className="card mt-24">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>{u.role}</span></td>
                <td className="muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleRole(u)} disabled={u._id === me.id}>
                    Make {u.role === 'admin' ? 'user' : 'admin'}
                  </button>{' '}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)} disabled={u._id === me.id}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
