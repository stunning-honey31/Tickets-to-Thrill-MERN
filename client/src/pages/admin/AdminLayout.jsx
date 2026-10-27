import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import LogoIcon from '../../components/LogoIcon.jsx';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="logo-badge"><LogoIcon size={20} /></span> T2T Admin
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end>📊 Dashboard</NavLink>
          <NavLink to="/admin/users">👤 Users</NavLink>
          <NavLink to="/admin/bookings">🎫 Bookings</NavLink>
          <NavLink to="/admin/messages">✉️ Messages</NavLink>
        </nav>
        <div className="flex gap-8" style={{ flexDirection: 'column' }}>
          <NavLink to="/">&larr; Back to site</NavLink>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
