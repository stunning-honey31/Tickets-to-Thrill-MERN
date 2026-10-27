import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useCart } from '../context/CartContext.jsx';
import Loader from '../components/Loader.jsx';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'individual', label: 'Individual' },
  { value: 'combo', label: 'Combo' },
  { value: 'offer', label: 'Offers' },
];

// Same grouping/order/eyebrow copy as the original site's data/tickets.php catalog.
const GROUP_META = {
  individual: { eyebrow: '🎫 Individual', title: 'Single-entry passes' },
  combo: { eyebrow: '🎁 Combo', title: 'Bundle up & save' },
  offer: { eyebrow: '🔥 Limited-Time Offers', title: 'Deals worth planning around' },
};
const GROUP_ORDER = ['individual', 'combo', 'offer'];

function TicketCard({ ticket, onAdd, justAdded, inCart }) {
  return (
    <div className="ticket-card">
      {ticket.badge && <span className="ticket-badge">{ticket.badge}</span>}
      <span className="cat-tag">{ticket.category}</span>
      <h3>{ticket.name}</h3>
      <p>{ticket.description}</p>
      {ticket.bullets?.length > 0 && (
        <ul className="ticket-bullets">
          {ticket.bullets.map((b) => <li key={b}>{b}</li>)}
        </ul>
      )}
      <div className="price-row">
        {ticket.originalPrice > ticket.price && <span className="was-price">Rs. {ticket.originalPrice.toFixed(0)}</span>}
        <span className="price">Rs. {ticket.price.toFixed(0)} <span>/ {ticket.perLabel || 'person'}</span></span>
      </div>
      <button className="btn btn-primary btn-block mt-8" onClick={() => onAdd(ticket)}>
        {justAdded === ticket._id ? 'Added!' : inCart ? `In cart (${inCart.qty})` : 'Add to Cart'}
      </button>
    </div>
  );
}

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem, items } = useCart();
  const [justAdded, setJustAdded] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get('/tickets', { params: { category } })
      .then(({ data }) => setTickets(data.tickets))
      .catch(() => setError('Could not load tickets. Is the API server running?'))
      .finally(() => setLoading(false));
  }, [category]);

  function handleAdd(ticket) {
    addItem(ticket, 1);
    setJustAdded(ticket._id);
    setTimeout(() => setJustAdded(null), 1200);
  }

  const groups = GROUP_ORDER
    .map((key) => ({ key, meta: GROUP_META[key], tickets: tickets.filter((t) => t.category === key) }))
    .filter((g) => g.tickets.length > 0);

  return (
    <div className="container section">
      <div className="text-center" style={{ marginBottom: 30 }}>
        <div className="eyebrow"><span className="dot" />Your Passes</div>
        <h1>Choose your tickets</h1>
      </div>

      <div className="flex gap-8" style={{ justifyContent: 'center', marginBottom: 30, flexWrap: 'wrap' }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={c.value === category ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <Loader label="Loading tickets..." />
      ) : tickets.length === 0 ? (
        <p className="text-center muted">No tickets in this category yet.</p>
      ) : (
        groups.map((group, i) => (
          <section key={group.key} className={i > 0 ? 'mt-40' : ''}>
            <div className="eyebrow">{group.meta.eyebrow}</div>
            <h2 style={{ marginBottom: 20 }}>{group.meta.title}</h2>
            <div className="grid grid-3">
              {group.tickets.map((t) => {
                const inCart = items.find((it) => it.ticketId === t._id);
                return <TicketCard key={t._id} ticket={t} onAdd={handleAdd} justAdded={justAdded} inCart={inCart} />;
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
