import React, { useState } from 'react';
import { Drawer, Fab, Box, Typography, Switch, FormControlLabel, ToggleButtonGroup, ToggleButton, Divider } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { useThemeStore } from '@/store/useThemeStore';
import { useTranslation } from 'react-i18next';

export const SettingsDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { mode, toggleTheme } = useThemeStore();
  const { i18n } = useTranslation();

  const handleLanguageChange = (
    event: React.MouseEvent<HTMLElement>,
    newLanguage: string | null,
  ) => {
    if (newLanguage !== null) {
      i18n.changeLanguage(newLanguage);
    }
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="settings"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          top: '50%',
          right: 0,
          transform: 'translateY(-50%)',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <SettingsIcon />
      </Fab>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 250, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Theme
          </Typography>
          <FormControlLabel
            control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
            label={mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Language
          </Typography>
          <ToggleButtonGroup
            value={i18n.language}
            exclusive
            onChange={handleLanguageChange}
            fullWidth
            size="small"
          >
            <ToggleButton value="el">EL</ToggleButton>
            <ToggleButton value="en">EN</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Drawer>
    </>
  );
};
