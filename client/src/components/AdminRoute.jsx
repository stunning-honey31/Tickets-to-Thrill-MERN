import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/account" replace />;
  return children;
}
