import { createBrowserRouter } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';

// ── Global error element ──────────────────────────────────────────────────────
function RouterError() {
  return (
    <div style={{ padding: 48, textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#d32f2f' }}>Page not found</h2>
      <p style={{ color: '#555' }}>The page you requested does not exist.</p>
      <a href="/" style={{ color: '#1976d2' }}>Go to Home</a>
    </div>
  );
}

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    { ...MainRoutes, errorElement: <RouterError /> },
    { ...AuthenticationRoutes, errorElement: <RouterError /> }
  ],
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;
