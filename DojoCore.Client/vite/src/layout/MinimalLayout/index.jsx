import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import LanguageSwitcher from 'layout/MainLayout/Header/LanguageSwitcher';

// ==============================|| MINIMAL LAYOUT ||============================== //

export default function MinimalLayout() {
  return (
    <>
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1300 }}>
        <LanguageSwitcher variant="auth" />
      </Box>
      <Outlet />
    </>
  );
}
