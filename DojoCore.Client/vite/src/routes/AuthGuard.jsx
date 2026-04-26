import { Navigate } from 'react-router-dom';

// project imports
import { useAuth } from 'contexts/AuthContext';

// ==============================|| AUTH GUARD ||============================== //

export default function AuthGuard({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/pages/login" replace />;
  return children;
}
