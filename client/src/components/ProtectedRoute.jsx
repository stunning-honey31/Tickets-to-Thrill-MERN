import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
}
