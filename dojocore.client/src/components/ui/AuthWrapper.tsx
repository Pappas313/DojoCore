import React from 'react';
import { Box, Card, Typography, useTheme } from '@mui/material';
import { SettingsDrawer } from './SettingsDrawer';

interface AuthWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  maxWidth?: number | string;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children, title, subtitle, maxWidth = 475 }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        m: 0,
        p: 0,
        border: 'none',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        boxSizing: 'border-box'
      }}
    >
      <Card
        sx={{
          maxWidth: maxWidth,
          width: '100%',
          p: { xs: 3, sm: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
        }}
      >
        {/* DojoCore Logo */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 32, height: 32, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
          <Typography variant="h5" fontWeight={700} color="text.primary">
            DojoCore
          </Typography>
        </Box>

        <Typography variant="h4" fontWeight={600} color="primary.main" gutterBottom textAlign="center">
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            {subtitle}
          </Typography>
        )}

        <Box sx={{ width: '100%' }}>
          {children}
        </Box>
      </Card>
      <SettingsDrawer />
    </Box>
  );
};
