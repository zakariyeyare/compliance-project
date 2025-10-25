import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;          // eller en spinner
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
