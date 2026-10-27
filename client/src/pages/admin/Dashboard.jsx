import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data)).catch(() => setError('Could not load dashboard data.'));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return <Loader />;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grid grid-4 mt-24">
        <div className="stat-tile"><div className="label">Total Users</div><div className="value">{stats.totalUsers}</div></div>
        <div className="stat-tile"><div className="label">Tickets Booked</div><div className="value">{stats.totalTickets}</div></div>
        <div className="stat-tile"><div className="label">Revenue</div><div className="value">Rs. {stats.revenue.toFixed(0)}</div></div>
        <div className="stat-tile"><div className="label">Unread Messages</div><div className="value">{stats.unreadMessages}</div></div>
      </div>

      <div className="grid grid-2 mt-40" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3>Recent Orders</h3>
          <table>
            <thead><tr><th>User</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o._id}>
                  <td>{o.user?.name || 'Deleted user'}</td>
                  <td>Rs. {o.total.toFixed(2)}</td>
                  <td><span className={`badge ${o.status === 'paid' ? 'badge-paid' : 'badge-pending'}`}>{o.status}</span></td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && <tr><td colSpan={3} className="muted">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Recent Messages</h3>
          <table>
            <thead><tr><th>From</th><th>Subject</th></tr></thead>
            <tbody>
              {stats.recentMessages.map((m) => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td>{m.subject}</td>
                </tr>
              ))}
              {stats.recentMessages.length === 0 && <tr><td colSpan={2} className="muted">No messages yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
