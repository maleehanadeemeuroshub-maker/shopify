import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RequireRole({ roles, redirectTo = '/', children }) {
  const { user, ready } = useAuth();

  if (!ready) return null;
  if (!user || !roles.includes(user.role)) return <Navigate to={redirectTo} replace />;

  return children;
}
