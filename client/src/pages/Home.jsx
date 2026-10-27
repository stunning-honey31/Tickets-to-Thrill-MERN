import { Link } from 'react-router-dom';

const HIGHLIGHTS = [
  { icon: '🎢', title: 'Marquee Rides', text: 'Loop-the-loop coasters and drop towers for the fearless.' },
  { icon: '💦', title: 'Splash Zones', text: 'Water rides and a lazy river to cool off between coasters.' },
  { icon: '🎡', title: 'Family Fun', text: 'Gentle rides and a kids zone for the little thrill-seekers.' },
  { icon: '🌙', title: 'Night Shows', text: 'Lights, music and stunt shows once the sun goes down.' },
];

export default function Home() {
  return (
    <div>
      <section className="hero">
        <div className="container">
          <div className="eyebrow"><span className="dot" />Now open every day, 10am - 10pm</div>
          <h1>
            Rides, splashes &amp; scares<br />for every <span className="gradient-text">age</span>.
          </h1>
          <p className="lead">
            Book your Tickets to Thrill online in minutes - skip the box-office line and walk straight in
            with an e-ticket on your phone.
          </p>
          <div className="hero-cta">
            <Link to="/tickets" className="btn btn-primary">Browse Tickets</Link>
            <Link to="/about" className="btn btn-secondary">Learn More</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 36 }}>
            <div className="eyebrow"><span className="dot" />What's inside</div>
            <h2>A whole park's worth of thrill</h2>
          </div>
          <div className="grid grid-4">
            {HIGHLIGHTS.map((h) => (
              <div className="card" key={h.title}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>{h.icon}</div>
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container card" style={{ textAlign: 'center', padding: '50px 30px' }}>
          <h2>Ready for tonight's thrill?</h2>
          <p style={{ maxWidth: 480, margin: '0 auto 20px' }}>
            Grab a combo pass, add the twilight splash zone, and you're set for a full day and a neon-lit evening.
          </p>
          <Link to="/tickets" className="btn btn-primary">See Ticket Options</Link>
        </div>
      </section>
    </div>
  );
}
