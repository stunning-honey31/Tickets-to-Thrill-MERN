import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import LogoIcon from './LogoIcon.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="site-header">
      <nav className="navbar container">
        <Link to="/" className="logo">
          <span className="logo-badge"><LogoIcon size={22} /></span>
          Tickets to <span className="gradient-text">Thrill</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/tickets">Tickets</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </div>

        <div className="nav-actions">
          <Link to="/cart" className="cart-badge" aria-label="Cart">
            🛒
            {count > 0 && <span className="count">{count}</span>}
          </Link>
          {user ? (
            <>
              <Link to="/account" className="btn btn-ghost btn-sm">My Account</Link>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
