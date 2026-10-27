import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader.jsx';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api
      .get('/orders/mine')
      .then(({ data }) => {
        const found = data.orders.find((o) => o._id === orderId);
        if (!found) throw new Error('not found');
        setOrder(found);
      })
      .catch(() => setError('Could not load this order.'));
  }, [orderId]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const { data } = await api.get(`/orders/${orderId}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch {
      setError('Could not download the ticket PDF.');
    } finally {
      setDownloading(false);
    }
  }

  if (error) return <div className="container section text-center"><p>{error}</p></div>;
  if (!order) return <Loader label="Loading your order..." />;

  return (
    <div className="container section">
      <div className="card" style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '2.4rem' }}>🎉</div>
        <h1 style={{ fontSize: '1.6rem' }}>Booking Confirmed!</h1>
        <p>
          Order <strong>#{order._id.slice(-6).toUpperCase()}</strong> is paid and your passes are ready.
          A copy has been emailed to you as well.
        </p>

        <div className="alert alert-info" style={{ textAlign: 'left' }}>
          <strong>Visit date:</strong> {new Date(order.visitDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </div>

        <div className="ticket-preview mt-24">
          {order.items.map((item) => (
            <div key={item._id} className="flex-between" style={{ marginBottom: 8 }}>
              <span>{item.ticketName} &times; {item.qty}</span>
              <strong>Rs. {(item.price * item.qty).toFixed(2)}</strong>
            </div>
          ))}
          <hr className="divider" />
          <div className="flex-between">
            <strong>Total Paid</strong>
            <strong className="gradient-text" style={{ fontSize: '1.2rem' }}>Rs. {order.total.toFixed(2)}</strong>
          </div>
        </div>

        <div className="flex gap-12 mt-24" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Preparing PDF...' : 'Download E-Ticket (PDF)'}
          </button>
          <Link className="btn btn-ghost" to="/account">Go to My Account</Link>
        </div>
      </div>
    </div>
  );
}
