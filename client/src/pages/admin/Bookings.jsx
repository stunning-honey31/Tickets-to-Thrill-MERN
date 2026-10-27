import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader.jsx';

const STATUSES = ['all', 'upcoming', 'completed', 'cancelled'];
const STATUS_CLASS = { upcoming: 'badge-upcoming', completed: 'badge-completed', cancelled: 'badge-cancelled' };

export default function Bookings() {
  const [bookings, setBookings] = useState(null);
  const [status, setStatus] = useState('all');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function load() {
    api.get('/admin/bookings', { params: { status } }).then(({ data }) => setBookings(data.bookings)).catch(() => setError('Could not load bookings.'));
  }
  useEffect(load, [status]);

  async function updateStatus(booking, newStatus) {
    setNotice('');
    const { data } = await api.put(`/admin/bookings/${booking.orderId}/${booking.itemId}`, { status: newStatus });
    if (data.refundMessage) setNotice(data.refundMessage);
    load();
  }

  return (
    <div>
      <h1>Bookings</h1>
      <div className="flex gap-8 mt-16">
        {STATUSES.map((s) => (
          <button key={s} className={s === status ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'} onClick={() => setStatus(s)}>
            {s}
          </button>
        ))}
      </div>

      {notice && <div className="alert alert-success mt-16">{notice}</div>}
      {error && <div className="alert alert-error mt-16">{error}</div>}
      {!bookings ? (
        <Loader />
      ) : (
        <div className="card mt-16">
          <table>
            <thead>
              <tr><th>Customer</th><th>Ticket</th><th>Qty</th><th>Visit Date</th><th>Status</th><th>Refund</th><th></th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.itemId}>
                  <td>{b.user?.name || 'Deleted user'}</td>
                  <td>{b.ticketName}</td>
                  <td>{b.qty}</td>
                  <td className="muted">{new Date(b.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td><span className={`badge ${STATUS_CLASS[b.status] || 'badge-pending'}`}>{b.status}</span></td>
                  <td className="muted">{b.status === 'cancelled' && b.refundAmount != null ? `Rs. ${b.refundAmount.toFixed(2)}` : '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <select value={b.status} onChange={(e) => updateStatus(b, e.target.value)} style={{ width: 'auto', padding: '6px 10px' }}>
                      <option value="upcoming">upcoming</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan={7} className="muted">No bookings found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
