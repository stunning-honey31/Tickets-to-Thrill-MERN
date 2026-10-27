import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';

const STATUS_CLASS = {
  pending_payment: 'badge-pending',
  upcoming: 'badge-upcoming',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

function Bookings() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [refundNotice, setRefundNotice] = useState('');
  const [busyItem, setBusyItem] = useState(null);

  function load() {
    api.get('/orders/mine').then(({ data }) => setOrders(data.orders)).catch(() => setError('Could not load your bookings.'));
  }

  useEffect(load, []);

  async function handleCancel(orderId, itemId) {
    setBusyItem(itemId);
    setError('');
    setRefundNotice('');
    try {
      const { data } = await api.post(`/orders/${orderId}/items/${itemId}/cancel`);
      setRefundNotice(data.refundMessage);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel this booking.');
    } finally {
      setBusyItem(null);
    }
  }

  async function handleDownload(orderId) {
    const { data } = await api.get(`/orders/${orderId}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!orders) return <Loader label="Loading bookings..." />;
  if (orders.length === 0) {
    return (
      <div className="card text-center">
        <p>No bookings yet.</p>
        <Link to="/tickets" className="btn btn-primary">Browse Tickets</Link>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      {refundNotice && <div className="alert alert-success">{refundNotice}</div>}
      {orders.map((order) => (
        <div className="card" key={order._id}>
          <div className="flex-between">
            <div>
              <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
              <div className="muted" style={{ fontSize: '0.85rem' }}>
                Booked {new Date(order.createdAt).toLocaleDateString()} &middot; Visiting{' '}
                {new Date(order.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <span className={`badge ${order.status === 'paid' ? 'badge-paid' : 'badge-pending'}`}>{order.status}</span>
          </div>

          <table className="mt-16">
            <thead>
              <tr><th>Ticket</th><th>Qty</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item._id}>
                  <td>{item.ticketName}</td>
                  <td>{item.qty}</td>
                  <td>
                    <span className={`badge ${STATUS_CLASS[item.status]}`}>{item.status.replace('_', ' ')}</span>
                    {item.status === 'cancelled' && item.refundAmount > 0 && (
                      <div className="muted" style={{ fontSize: '0.78rem', marginTop: 4 }}>Refund: Rs. {item.refundAmount.toFixed(2)}</div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {item.status === 'upcoming' && (
                      <button className="btn btn-danger btn-sm" disabled={busyItem === item._id} onClick={() => handleCancel(order._id, item._id)}>
                        {busyItem === item._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex-between mt-16">
            <strong>Total: Rs. {order.total.toFixed(2)}</strong>
            {order.status === 'paid' ? (
              <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(order._id)}>Download PDF</button>
            ) : (
              <Link className="btn btn-primary btn-sm" to={`/payment/${order._id}`}>Finish Payment</Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileForm() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await api.put('/auth/me', { name, phone });
      await refresh();
      setMsg('Profile updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3>Profile</h3>
      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input value={user?.email || ''} disabled />
      </div>
      <button className="btn btn-primary">Save Changes</button>
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await api.put('/auth/me/password', { currentPassword, newPassword });
      setMsg('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update password.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-16">
      <h3>Change Password</h3>
      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label>Current Password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
      </div>
      <button className="btn btn-primary">Update Password</button>
    </form>
  );
}

export default function MyAccount() {
  const { user } = useAuth();
  const [tab, setTab] = useState('bookings');

  return (
    <div className="container section">
      <div className="text-center" style={{ marginBottom: 30 }}>
        <div className="eyebrow"><span className="dot" />My Account</div>
        <h1>Hi, {user?.name?.split(' ')[0]}</h1>
      </div>

      <div className="flex gap-8" style={{ justifyContent: 'center', marginBottom: 28 }}>
        <button className={tab === 'bookings' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'} onClick={() => setTab('bookings')}>My Bookings</button>
        <button className={tab === 'profile' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'} onClick={() => setTab('profile')}>Profile &amp; Security</button>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {tab === 'bookings' ? (
          <Bookings />
        ) : (
          <>
            <ProfileForm />
            <PasswordForm />
          </>
        )}
      </div>
    </div>
  );
}
