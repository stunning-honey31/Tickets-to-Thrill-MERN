import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Cart() {
  const { items, setQty, removeItem, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visitDate, setVisitDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCheckout() {
    setError('');
    if (!user) {
      navigate('/login?next=/cart');
      return;
    }
    if (!visitDate) {
      setError('Please choose the date you plan to visit the park.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/orders/checkout', {
        items: items.map((i) => ({ ticketId: i.ticketId, qty: i.qty })),
        visitDate,
      });
      clearCart();
      navigate(`/payment/${data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start checkout.');
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container section text-center">
        <h1>Your cart is empty</h1>
        <p className="muted">Add a few passes to get started.</p>
        <Link to="/tickets" className="btn btn-primary">Browse Tickets</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1>Your Cart</h1>
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 30 }}>
        <div className="card">
          {items.map((item) => (
            <div className="cart-row" key={item.ticketId}>
              <div>
                <strong>{item.name}</strong>
                <div className="muted" style={{ fontSize: '0.85rem' }}>Rs. {item.price.toFixed(2)} each</div>
              </div>
              <div className="flex gap-16" style={{ alignItems: 'center' }}>
                <div className="qty-stepper">
                  <button onClick={() => setQty(item.ticketId, item.qty - 1)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => setQty(item.ticketId, item.qty + 1)}>+</button>
                </div>
                <strong>Rs. {(item.price * item.qty).toFixed(2)}</strong>
                <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.ticketId)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card cart-summary">
          <h3>Order Summary</h3>

          <div className="form-group mt-16">
            <label>When are you visiting?</label>
            <input type="date" min={todayISO()} value={visitDate} onChange={(e) => setVisitDate(e.target.value)} required />
          </div>

          <div className="flex-between mt-16">
            <span className="muted">Total</span>
            <strong style={{ fontSize: '1.3rem' }}>Rs. {total.toFixed(2)}</strong>
          </div>
          {error && <div className="alert alert-error mt-16">{error}</div>}
          <button className="btn btn-primary btn-block mt-16" onClick={handleCheckout} disabled={submitting}>
            {submitting ? 'Starting checkout...' : user ? 'Proceed to Payment' : 'Log in to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
}
