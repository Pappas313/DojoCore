import { Navigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// project imports
import { useAuth } from 'contexts/AuthContext';

// ==============================|| AUTH GUARD ||============================== //

export default function AuthGuard({ children }) {
  const { user, isInitialized } = useAuth();
  const location = useLocation();

  // Still checking the cookie — render a full-page spinner to avoid flash-redirect
  if (!isInitialized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    // Preserve the intended destination so login can redirect back
    return <Navigate to="/pages/login" state={{ from: location }} replace />;
  }

  return children;
}
