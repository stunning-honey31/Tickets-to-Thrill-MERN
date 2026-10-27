import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

function formatCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/orders/pay', {
        orderId,
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiry,
        cvv,
      });
      navigate(`/order-confirmation/${data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container section">
      <div className="card form-card">
        <div className="text-center" style={{ marginBottom: 20 }}>
          <div className="eyebrow"><span className="dot" />Secure demo checkout</div>
          <h1 style={{ fontSize: '1.6rem' }}>Payment</h1>
        </div>

        <div className="alert alert-info">
          This is a simulated payment gateway - it checks that your card details look valid but never
          contacts a real bank. Use any realistic-looking test numbers.
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Card Number</label>
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="4242 4242 4242 4242"
              required
            />
          </div>
          <div className="grid grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label>Expiry (MM/YY)</label>
              <input value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} placeholder="12/28" required />
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" required />
            </div>
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Processing payment...' : 'Pay Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
