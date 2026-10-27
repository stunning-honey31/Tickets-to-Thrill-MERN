import { Link } from 'react-router-dom';
import LogoIcon from './LogoIcon.jsx';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo mb-0" style={{ marginBottom: 14 }}>
              <span className="logo-badge"><LogoIcon size={22} /></span>
              Tickets to <span className="gradient-text">Thrill</span>
            </div>
            <p className="muted" style={{ fontSize: '0.88rem' }}>
              Gujarat's favorite theme park after dark - rides, splashes and scares for every age, booked in minutes.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <Link to="/tickets">All Tickets</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/account">My Account</Link>
            <Link to="/cart">My Cart</Link>
          </div>
          <div>
            <h4>Stay in the loop</h4>
            <p className="muted" style={{ fontSize: '0.85rem' }}>Offers, new rides &amp; event dates - no spam.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Tickets to Thrill. All rights reserved.</span>
          <span>Made for thrill-seekers, by thrill-seekers.</span>
        </div>
      </div>
    </footer>
  );
}
