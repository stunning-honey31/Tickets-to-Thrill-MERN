export default function About() {
  return (
    <div className="container section">
      <div className="text-center" style={{ marginBottom: 30 }}>
        <div className="eyebrow"><span className="dot" />Our Story</div>
        <h1>About Tickets to Thrill</h1>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Who we are</h3>
          <p>
            Tickets to Thrill is Gujarat's favorite after-dark theme park - a mix of high-speed coasters,
            water rides, family attractions, and neon-lit night shows. This site is the official way to
            book your visit online instead of queueing at the box office.
          </p>
        </div>
        <div className="card">
          <h3>Why book online</h3>
          <p>
            Booking ahead gets you a QR-ready e-ticket the moment you pay, sent straight to your inbox and
            downloadable any time from My Account - no printing required (though you can if you'd like a
            paper backup).
          </p>
        </div>
        <div className="card">
          <h3>Opening hours</h3>
          <p>Every day, 10:00 AM to 10:00 PM. Twilight Splash Zone access begins at 5:00 PM.</p>
        </div>
        <div className="card">
          <h3>Getting here</h3>
          <p>Located just off the highway with dedicated visitor parking - no separate ticket needed, just drive on in.</p>
        </div>
      </div>
    </div>
  );
}
