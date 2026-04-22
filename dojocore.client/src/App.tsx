import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useThemeStore } from '@/store/useThemeStore';
import { darkTheme, lightTheme } from '@/theme/theme';
import '@/i18n/config'; // Initialize i18n
import { Refine, Authenticated, useLogout } from '@refinedev/core';
import routerBindings, { NavigateToResource } from '@refinedev/react-router-v6';
import dataProvider from '@refinedev/simple-rest';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { authProvider } from '@/features/auth/authProvider';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { Typography, Box, Button } from '@mui/material';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { elGR, enUS } from '@mui/x-date-pickers/locales';
import 'dayjs/locale/en';
import 'dayjs/locale/el';

// Simple dashboard placeholder for testing authenticated routes
const DashboardPlaceholder = () => {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation('auth');
  const { toggleTheme, mode } = useThemeStore();
  const { mutate: logout } = useLogout();
  
  return (
    <Box sx={{ p: 4, minHeight: '100vh', backgroundColor: 'background.default', color: 'text.primary' }}>
      <Typography variant="h4" gutterBottom>Dashboard - Pending Admin Approval</Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>Welcome, {user?.username || 'User'} (Role: {user?.role})</Typography>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={toggleTheme}>
          Toggle Theme ({mode})
        </Button>
        <Button variant="outlined" onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'el' : 'en')}>
          Toggle Language ({i18n.language})
        </Button>
        <Button variant="contained" color="error" onClick={() => logout()}>
          Logout
        </Button>
      </Box>
    </Box>
  );
};

function App() {
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  const { i18n } = useTranslation();

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider 
        dateAdapter={AdapterDayjs} 
        adapterLocale={i18n.language}
        localeText={i18n.language === 'el' ? elGR.components.MuiLocalizationProvider.defaultProps.localeText : enUS.components.MuiLocalizationProvider.defaultProps.localeText}
      >
        <CssBaseline />
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider(import.meta.env.VITE_API_URL || '/api')}
          routerProvider={routerBindings}
          authProvider={authProvider}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
        >
          <Routes>
            {/* Authenticated Routes */}
            <Route
              element={
                <Authenticated fallback={<Navigate to="/login" />}>
                  <Outlet />
                </Authenticated>
              }
            >
              <Route index element={<DashboardPlaceholder />} />
            </Route>

            {/* Unauthenticated Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </Refine>
      </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
